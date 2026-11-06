<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\PaymentMethod;
use App\Models\User;
use Database\Factories\ShippingFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class PaymentApiTest extends TestCase
{
    use RefreshDatabase;

    private User $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->usuario = User::factory()->create();
    }

    public function test_salvar_metodo_nao_armazena_dados_do_cartao(): void
    {
        $this->actingAs($this->usuario, 'sanctum')
            ->postJson('/api/me/payment-methods', [
                'stripe_payment_method_id' => 'pm_123abc',
                'type' => 'card',
                'last_4_digits' => '4242',
                'card_brand' => 'visa',
            ])
            ->assertStatus(201)
            ->assertJsonPath('last_4_digits', '4242')
            ->assertJsonMissing(['stripe_customer_id', 'stripe_payment_method_id', 'card_number', 'cvv']);

        // Nunca armazenar cvv / numero completo (nao ha colunas para isso no schema).
        $this->assertDatabaseCount('payment_methods', 1);
        $salvo = PaymentMethod::first();
        $this->assertNull($salvo->cvv);
        $this->assertNull($salvo->card_number);
    }

    public function test_criar_payment_intent_mock_e_confirmar(): void
    {
        $metodo = PaymentMethod::create([
            'user_id' => $this->usuario->user_id,
            'stripe_customer_id' => 'cus_mock_x',
            'stripe_payment_method_id' => 'pm_123abc',
            'type' => 'card',
            'last_4_digits' => '4242',
        ]);

        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create([
            'value' => '250.00',
        ]);

        $payment = $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/payments", [
                'payment_method_id' => $metodo->payment_method_id,
            ])
            ->assertStatus(201)
            ->assertJsonPath('payment_status', 'processing')
            ->assertJsonPath('value', 250);

        // Intent mock (pi_mock_*) e confirmacao.
        $this->assertStringStartsWith('pi_mock_', PaymentMethod::find($metodo->payment_method_id)->payments()->first()->stripe_payment_intent_id);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/payments/{$payment->json('id')}/confirmar")
            ->assertOk()
            ->assertJsonPath('payment_status', 'succeeded');
    }

    public function test_metodo_de_outro_usuario_e_rejeitado(): void
    {
        $outro = User::factory()->create();
        $metodo = PaymentMethod::create([
            'user_id' => $outro->user_id,
            'stripe_customer_id' => 'cus_mock_y',
            'stripe_payment_method_id' => 'pm_xyz',
            'type' => 'card',
        ]);

        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/payments", [
                'payment_method_id' => $metodo->payment_method_id,
            ])
            ->assertStatus(403);
    }

    public function test_usuario_nao_paga_shipping_alheio(): void
    {
        $outro = User::factory()->create();
        $metodo = PaymentMethod::create([
            'user_id' => $this->usuario->user_id,
            'stripe_customer_id' => 'cus_mock_z',
            'stripe_payment_method_id' => 'pm_abc123',
            'type' => 'card',
        ]);

        $shipping = ShippingFactory::new()->doUsuario($outro)->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/payments", [
                'payment_method_id' => $metodo->payment_method_id,
            ])
            ->assertStatus(403);
    }
}