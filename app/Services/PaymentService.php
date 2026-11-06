<?php

namespace App\Services;

use App\Enums\PaymentStatus;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Shipping;
use App\Models\User;
use Illuminate\Support\Str;
use Illuminate\Validation\ValidationException;
use Stripe\Exception\ApiErrorException;

class PaymentService
{
    /**
     * Armazena APENAS o token fornecido pelo Stripe (pm_...).
     * Nunca armazenar numero de cartao, cvv, validade ou dados completos.
     *
     * Com a Stripe ativa, o cartao e vinculado a um Customer da Stripe,
     * o que permite reutiliza-lo em pagamentos futuros.
     */
    public function salvarMetodo(User $usuario, array $dados): PaymentMethod
    {
        $customerId = $dados['stripe_customer_id'] ?? 'cus_mock_'.Str::uuid();

        if (
            $this->usarStripe()
            && $dados['type'] === 'card'
            && ! str_starts_with($dados['stripe_payment_method_id'], 'pm_mock_')
        ) {
            try {
                $customerId = $this->customerStripeDoUsuario($usuario);

                $this->clienteStripe()->paymentMethods->attach(
                    $dados['stripe_payment_method_id'],
                    ['customer' => $customerId]
                );
            } catch (ApiErrorException $e) {
                throw ValidationException::withMessages([
                    'stripe_payment_method_id' => 'Não foi possível validar o cartão na Stripe: '.$e->getMessage(),
                ]);
            }
        }

        return PaymentMethod::create([
            'user_id' => $usuario->user_id,
            'stripe_customer_id' => $customerId,
            'stripe_payment_method_id' => $dados['stripe_payment_method_id'],
            'type' => $dados['type'],
            'last_4_digits' => $dados['last_4_digits'] ?? null,
            'card_brand' => $dados['card_brand'] ?? null,
        ]);
    }

    /**
     * Cria o pagamento do shipping. Com a Stripe ativa e cartao real, ja cobra
     * (PaymentIntent confirmado). Pix, dinheiro e cartoes de teste antigos
     * (pm_mock_*) continuam simulados.
     */
    public function criarIntent(Shipping $shipping, PaymentMethod $metodo): Payment
    {
        if ($metodo->user_id !== $shipping->user_id) {
            abort(403, 'Método de pagamento não pertence a você.');
        }

        if ((float) $shipping->value < 0) {
            throw ValidationException::withMessages(['value' => 'Valor inválido.']);
        }

        // Evita cobrar duas vezes (so vale para cobrancas reais).
        if (
            ! $this->usarMockPara($metodo)
            && Payment::where('shipping_id', $shipping->shipping_id)
                ->where('payment_status', PaymentStatus::Succeeded->value)
                ->exists()
        ) {
            throw ValidationException::withMessages(['payment' => 'Este frete já foi pago.']);
        }

        $payment = Payment::create([
            'shipping_id' => $shipping->shipping_id,
            'payment_method_id' => $metodo->payment_method_id,
            'value' => $shipping->value,
            'payment_status' => PaymentStatus::Pending,
        ]);

        [$intentId, $status, $segredo] = $this->criarIntentStripe($payment, $metodo);

        $payment->update([
            'stripe_payment_intent_id' => $intentId,
            'payment_status' => $status,
            'paid_at' => $status === PaymentStatus::Succeeded ? now() : null,
        ]);

        $payment->refresh();
        $payment->clientSecret = $segredo;

        return $payment;
    }

    /**
     * Confirma um pagamento: mock, ou consulta o status real do PaymentIntent.
     * Em producao, o ideal e tambem receber o webhook da Stripe.
     */
    public function confirmar(Payment $payment, PaymentMethod $metodo): Payment
    {
        if ($payment->payment_status === PaymentStatus::Succeeded) {
            return $payment;
        }

        if (
            $this->usarMockPara($metodo)
            || str_starts_with((string) $payment->stripe_payment_intent_id, 'pi_mock_')
        ) {
            $payment->update([
                'payment_status' => PaymentStatus::Succeeded,
                'paid_at' => now(),
            ]);

            return $payment->refresh();
        }

        try {
            $intent = $this->clienteStripe()->paymentIntents->retrieve($payment->stripe_payment_intent_id);
        } catch (ApiErrorException $e) {
            abort(502, 'Não foi possível consultar o pagamento na Stripe.');
        }

        $novoStatus = $this->statusDoIntent($intent->status);

        $payment->update([
            'payment_status' => $novoStatus,
            'paid_at' => $novoStatus === PaymentStatus::Succeeded ? now() : $payment->paid_at,
        ]);

        $payment->refresh();
        $payment->clientSecret = $intent->status === 'requires_action' ? $intent->client_secret : null;

        return $payment;
    }

    /**
     * @return array{0: string, 1: PaymentStatus, 2: string|null}  [id do intent, status, client_secret]
     */
    private function criarIntentStripe(Payment $payment, PaymentMethod $metodo): array
    {
        if ($this->usarMockPara($metodo)) {
            return ['pi_mock_'.Str::uuid(), PaymentStatus::Processing, null];
        }

        try {
            $intent = $this->clienteStripe()->paymentIntents->create([
                'amount' => (int) round((float) $payment->value * 100),
                'currency' => 'brl',
                'customer' => $metodo->stripe_customer_id,
                'payment_method' => $metodo->stripe_payment_method_id,
                'confirm' => true,
                // sem redirecionamentos: se o banco pedir autenticacao (3DS), o app resolve na propria tela
                'automatic_payment_methods' => ['enabled' => true, 'allow_redirects' => 'never'],
                'description' => 'Frete #'.$payment->shipping_id,
                'metadata' => [
                    'payment_id' => (string) $payment->payment_id,
                    'shipping_id' => (string) $payment->shipping_id,
                ],
            ]);
        } catch (ApiErrorException $e) {
            $payment->update(['payment_status' => PaymentStatus::Failed]);

            throw ValidationException::withMessages([
                'payment' => 'Pagamento recusado pela Stripe: '.$e->getMessage(),
            ]);
        }

        return [
            $intent->id,
            $this->statusDoIntent($intent->status),
            $intent->status === 'requires_action' ? $intent->client_secret : null,
        ];
    }

    private function statusDoIntent(string $statusStripe): PaymentStatus
    {
        return match ($statusStripe) {
            'succeeded' => PaymentStatus::Succeeded,
            'processing', 'requires_action', 'requires_confirmation', 'requires_capture' => PaymentStatus::Processing,
            'canceled' => PaymentStatus::Cancelled,
            default => PaymentStatus::Failed,
        };
    }

    /**
     * Reaproveita o Customer da Stripe do usuario (se ja tiver cartao salvo) ou cria um.
     */
    private function customerStripeDoUsuario(User $usuario): string
    {
        $existente = $usuario->paymentMethods()
            ->where('stripe_customer_id', 'not like', 'cus_mock_%')
            ->value('stripe_customer_id');

        if ($existente) {
            return $existente;
        }

        $cliente = $this->clienteStripe()->customers->create([
            'name' => $usuario->name,
            'email' => $usuario->email,
            'metadata' => ['user_id' => (string) $usuario->user_id],
        ]);

        return $cliente->id;
    }

    /**
     * Stripe ativa = ha chave secreta, a biblioteca existe e o modo mock esta desligado.
     */
    private function usarStripe(): bool
    {
        return ! $this->usarMock();
    }

    private function usarMock(): bool
    {
        $secret = config('services.stripe.secret');

        return (bool) config('services.stripe.mock_enabled') || ! $secret || ! class_exists(\Stripe\StripeClient::class);
    }

    /**
     * Pix, dinheiro e cartoes de teste antigos (pm_mock_*) nunca vao para a Stripe.
     */
    private function usarMockPara(PaymentMethod $metodo): bool
    {
        return $this->usarMock()
            || $metodo->type !== 'card'
            || str_starts_with((string) $metodo->stripe_payment_method_id, 'pm_mock_');
    }

    private function clienteStripe(): \Stripe\StripeClient
    {
        return new \Stripe\StripeClient(config('services.stripe.secret'));
    }
}
