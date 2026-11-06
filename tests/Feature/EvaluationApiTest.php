<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;
use Database\Factories\ShippingFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class EvaluationApiTest extends TestCase
{
    use RefreshDatabase;

    private User $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->usuario = User::factory()->create();
    }

    private function shippingConcluida(array $estado = []): \App\Models\Shipping
    {
        $motorista = Driver::factory()->create();

        return ShippingFactory::new()->doUsuario($this->usuario)->concluida()->create([
            'driver_id' => $motorista->driver_id,
            ...$estado,
        ]);
    }

    public function test_usuario_avalia_shipping_concluido(): void
    {
        $shipping = $this->shippingConcluida();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", [
                'rating' => 5,
                'comment' => 'Excelente motorista.',
            ])
            ->assertStatus(201)
            ->assertJsonPath('rating', 5);

        $this->assertDatabaseHas('evaluations', [
            'shipping_id' => $shipping->shipping_id,
            'rating' => 5,
        ]);
    }

    public function test_rating_fora_do_intervalo_e_rejeitado(): void
    {
        $shipping = $this->shippingConcluida();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", ['rating' => 6])
            ->assertStatus(422);
    }

    public function test_avaliacao_antes_da_conclusao_e_rejeitada(): void
    {
        $motorista = Driver::factory()->create();
        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create([
            'status' => 'in_transit',
            'driver_id' => $motorista->driver_id,
        ]);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", ['rating' => 5])
            ->assertStatus(422);
    }

    public function test_um_shipping_tem_no_maximo_uma_avaliacao(): void
    {
        $shipping = $this->shippingConcluida();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", ['rating' => 5])
            ->assertStatus(201);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", ['rating' => 3])
            ->assertStatus(422);
    }

    public function test_apenas_o_proprietario_avalia(): void
    {
        $outro = User::factory()->create();
        $shipping = ShippingFactory::new()->doUsuario($outro)->concluida()->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", ['rating' => 5])
            ->assertStatus(403);
    }

    public function test_shipping_sem_motorista_nao_pode_ser_avaliado(): void
    {
        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->concluida()->create([
            'driver_id' => null,
        ]);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/evaluation", ['rating' => 5])
            ->assertStatus(422);
    }
}