<?php

namespace App\Services;

use App\Enums\ShippingDriverStatus;
use App\Enums\ShippingStatus;
use App\Models\Driver;
use App\Models\Shipping;
use App\Models\ShippingDriver;
use App\Models\User;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;

class ShippingService
{
    public function criar(User $usuario, array $dados): Shipping
    {
        // O valor e calculado aqui (distancia x tarifa); nunca vem do cliente.
        [$distanciaKm, $valor, $precoPorKm] = app(PricingService::class)->calcular($dados);

        return $usuario->shippings()->create([
            'origin' => $dados['origin'],
            'destination' => $dados['destination'],
            'origin_lat' => $dados['origin_lat'] ?? null,
            'origin_lng' => $dados['origin_lng'] ?? null,
            'destination_lat' => $dados['destination_lat'] ?? null,
            'destination_lng' => $dados['destination_lng'] ?? null,
            'about_load' => $dados['about_load'] ?? null,
            'recommended_vehicle' => $dados['recommended_vehicle'] ?? null,
            'value' => $valor,
            'distance_km' => $distanciaKm,
            'price_per_km' => $precoPorKm,
            'status' => ShippingStatus::Pending,
        ]);
    }

    /**
     * Busca motoristas disponiveis (online + com veiculo) e cria as linhas
     * em shipping_drivers (status pending). Historico nunca e apagado.
     */
    public function procurarMotoristas(Shipping $shipping, User $usuario): int
    {
        $this->garantirProprietario($shipping, $usuario->user_id);
        $this->transicionar($shipping, ShippingStatus::SearchingDriver);

        $candidatos = Driver::query()
            ->where('status_online', true)
            ->whereHas('vehicles')
            ->get();

        foreach ($candidatos as $motorista) {
            ShippingDriver::firstOrCreate(
                ['shipping_id' => $shipping->shipping_id, 'driver_id' => $motorista->driver_id],
                ['status' => ShippingDriverStatus::Pending]
            );
        }

        return $candidatos->count();
    }

    /**
     * Motorista aceita/recusa uma oferta. O aceite registra o motorista em
     * shippings.driver_id SEM apagar as demais linhas de shipping_drivers.
     */
    public function responder(Shipping $shipping, Driver $motorista, ShippingDriverStatus $status): void
    {
        // Trava a linha da solicitacao e a do vinculo antes de responder,
        // evitando que um aceite concorrente atribua dois motoristas ao mesmo frete.
        DB::transaction(function () use ($shipping, $motorista, $status) {
            /** @var Shipping $shipping */
            $shipping = Shipping::whereKey($shipping->shipping_id)
                ->lockForUpdate()
                ->firstOrFail();

            $registro = ShippingDriver::where('shipping_id', $shipping->shipping_id)
                ->where('driver_id', $motorista->driver_id)
                ->lockForUpdate()
                ->first();

            if (! $registro) {
                abort(404, 'Oferta não encontrada para este motorista.');
            }

            if ($registro->status !== ShippingDriverStatus::Pending) {
                throw ValidationException::withMessages([
                    'status' => "Esta oferta já foi respondida ({$registro->status->value}).",
                ]);
            }

            // shipping_drivers tem chave composta (shipping_id, driver_id). Um
            // $registro->update() usaria so shipping_id no WHERE e alteraria a
            // oferta de TODOS os motoristas desse frete.
            ShippingDriver::where('shipping_id', $shipping->shipping_id)
                ->where('driver_id', $motorista->driver_id)
                ->update([
                    'status' => $status->value,
                    'reply_at' => now(),
                ]);

            if ($status === ShippingDriverStatus::Accepted) {
                $this->transicionar($shipping, ShippingStatus::DriverAssigned);
                $shipping->update(['driver_id' => $motorista->driver_id]);
            }
        });
    }

    public function iniciar(Shipping $shipping, Driver $motorista): void
    {
        $this->garantirMotorista($shipping, $motorista->driver_id);
        $this->transicionar($shipping, ShippingStatus::InTransit);
    }

    public function concluir(Shipping $shipping, Driver $motorista): void
    {
        $this->garantirMotorista($shipping, $motorista->driver_id);
        $this->transicionar($shipping, ShippingStatus::Completed);
        $shipping->update(['completed_at' => now()]);
    }

    /**
     * Motorista inicia a simulacao de trajeto. O marco temporal e persistido
     * para que o cliente acompanhe o mesmo percurso em tempo real.
     */
    public function iniciarSimulacao(Shipping $shipping, Driver $motorista): void
    {
        $this->garantirMotorista($shipping, $motorista->driver_id);

        if ($shipping->simulacao_iniciada_em !== null) {
            throw ValidationException::withMessages([
                'simulacao' => 'A simulação já está em andamento para este frete.',
            ]);
        }

        $shipping->update(['simulacao_iniciada_em' => now()]);
    }

    public function pararSimulacao(Shipping $shipping, Driver $motorista): void
    {
        $this->garantirMotorista($shipping, $motorista->driver_id);
        $shipping->update(['simulacao_iniciada_em' => null]);
    }

    public function cancelar(Shipping $shipping, User $usuario): void
    {
        $this->garantirProprietario($shipping, $usuario->user_id);
        $this->transicionar($shipping, ShippingStatus::Cancelled);
    }

    private function transicionar(Shipping $shipping, ShippingStatus $proximo): void
    {
        $atual = $shipping->status;

        if (! $atual->podeTransicionarPara($proximo)) {
            throw ValidationException::withMessages([
                'status' => "Transição de {$atual->value} para {$proximo->value} não permitida.",
            ]);
        }

        $shipping->update(['status' => $proximo]);
    }

    private function garantirProprietario(Shipping $shipping, int $userId): void
    {
        if ($shipping->user_id !== $userId) {
            abort(403, 'Esta solicitação não pertence a você.');
        }
    }

    private function garantirMotorista(Shipping $shipping, int $driverId): void
    {
        if ($shipping->driver_id !== $driverId) {
            abort(403, 'Esta solicitação não está atribuída a este motorista.');
        }
    }
}