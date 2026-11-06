<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\Shipping;
use App\Models\User;
use App\Models\Vehicle;
use Database\Factories\ShippingFactory;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Illuminate\Testing\TestResponse;
use Tests\TestCase;

class ShippingApiTest extends TestCase
{
    use RefreshDatabase;

    private User $usuario;

    protected function setUp(): void
    {
        parent::setUp();
        $this->usuario = User::factory()->create();
    }

    private function criarMotoristaComVeiculo(): Driver
    {
        $motorista = Driver::factory()->create();
        Vehicle::factory()->doMotorista($motorista)->create();

        return $motorista;
    }

    /**
     * Porto Alegre -> Canoas (cerca de 13 km em linha reta). O valor NAO e enviado:
     * quem calcula e o servidor (distancia x tarifa).
     */
    private function criarShipping(array $extra = []): TestResponse
    {
        return $this->actingAs($this->usuario, 'sanctum')
            ->postJson('/api/shippings', array_merge([
                'origin' => 'Porto Alegre',
                'destination' => 'Canoas',
                'origin_lat' => -30.0346,
                'origin_lng' => -51.2177,
                'destination_lat' => -29.9178,
                'destination_lng' => -51.1839,
                'about_load' => 'Paletes de papel',
                'recommended_vehicle' => 'carro',
                'distance_km' => 15,
            ], $extra));
    }

    private function criarShippingAtribuido(Driver $motorista): Shipping
    {
        return ShippingFactory::new()->doUsuario($this->usuario)->create([
            'status' => 'driver_assigned',
            'driver_id' => $motorista->driver_id,
        ]);
    }

    public function test_usuario_cria_shipping_com_sucesso(): void
    {
        config(['fretar.price_per_km' => 3.0, 'fretar.min_price' => 10.0]);

        $resposta = $this->criarShipping();

        // 15 km x R$ 3,00/km = R$ 45,00
        $resposta->assertStatus(201)
            ->assertJsonPath('status', 'pending')
            ->assertJsonPath('origin', 'Porto Alegre')
            ->assertJsonPath('value', 45)
            ->assertJsonPath('distance_km', 15);

        $this->assertDatabaseHas('shippings', [
            'origin' => 'Porto Alegre',
            'value' => '45.00',
            'distance_km' => '15.00',
        ]);
    }

    public function test_cliente_nao_consegue_definir_o_valor(): void
    {
        config(['fretar.price_per_km' => 3.0, 'fretar.min_price' => 10.0]);

        // Mesmo mandando um valor, o servidor ignora e calcula pela distancia.
        $this->criarShipping(['value' => 1])
            ->assertStatus(201)
            ->assertJsonPath('value', 45);

        $this->assertDatabaseMissing('shippings', ['value' => '1.00']);
    }

    public function test_tarifa_muda_conforme_o_tipo_de_veiculo(): void
    {
        config(['fretar.price_per_km' => 3.0, 'fretar.min_price' => 10.0]);

        // 15 km: moto = 3,00 x 0,6 = 1,80/km; caminhao = 3,00 x 2,4 = 7,20/km
        $this->criarShipping(['recommended_vehicle' => 'moto'])
            ->assertStatus(201)
            ->assertJsonPath('value', 27)
            ->assertJsonPath('price_per_km', 1.8);

        $this->criarShipping(['recommended_vehicle' => 'caminhao'])
            ->assertStatus(201)
            ->assertJsonPath('value', 108)
            ->assertJsonPath('price_per_km', 7.2);
    }

    public function test_tipo_de_veiculo_e_obrigatorio_e_deve_existir(): void
    {
        $this->criarShipping(['recommended_vehicle' => null])->assertStatus(422);
        $this->criarShipping(['recommended_vehicle' => 'aviao'])->assertStatus(422);
    }

    public function test_respeita_o_valor_minimo(): void
    {
        config(['fretar.price_per_km' => 3.0, 'fretar.min_price' => 100.0]);

        $this->criarShipping()
            ->assertStatus(201)
            ->assertJsonPath('value', 100);
    }

    public function test_distancia_absurda_e_ignorada(): void
    {
        config(['fretar.price_per_km' => 3.0, 'fretar.min_price' => 10.0]);

        // 0,1 km e impossivel para ~13 km em linha reta: o servidor usa a propria estimativa.
        $resposta = $this->criarShipping(['distance_km' => 0.1]);

        $resposta->assertStatus(201);
        $this->assertGreaterThan(10, $resposta->json('distance_km'));
    }

    public function test_coordenadas_sao_obrigatorias_para_calcular_o_valor(): void
    {
        $this->actingAs($this->usuario, 'sanctum')
            ->postJson('/api/shippings', [
                'origin' => 'A',
                'destination' => 'B',
            ])
            ->assertStatus(422);
    }

    public function test_tarifa_e_exposta_para_o_app(): void
    {
        config(['fretar.price_per_km' => 3.0, 'fretar.min_price' => 10.0]);

        $this->actingAs($this->usuario, 'sanctum')
            ->getJson('/api/tarifa')
            ->assertOk()
            ->assertJsonPath('price_per_km', 3)
            ->assertJsonPath('min_price', 10)
            ->assertJsonPath('vehicles.moto.price_per_km', 1.8)
            ->assertJsonPath('vehicles.caminhao.price_per_km', 7.2)
            ->assertJsonPath('vehicles.caminhao.min_price', 24);
    }

    public function test_procurar_motoristas_cria_ofertas_e_muda_status(): void
    {
        $this->criarMotoristaComVeiculo();
        $this->criarMotoristaComVeiculo();

        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create([
            'status' => 'pending',
        ]);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/procurar-motoristas")
            ->assertOk()
            ->assertJsonPath('shipping.status', 'searching_driver');

        $this->assertDatabaseCount('shipping_drivers', 2);
        $this->assertDatabaseHas('shipping_drivers', ['status' => 'pending']);
    }

    public function test_aceite_registra_driver_e_preserva_historico(): void
    {
        $motoristaA = $this->criarMotoristaComVeiculo();
        $motoristaB = $this->criarMotoristaComVeiculo();

        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create([
            'status' => 'pending',
        ]);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/procurar-motoristas");

        // Motorista A aceita.
        $this->actingAs($motoristaA, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/responder", ['status' => 'accepted'])
            ->assertOk()
            ->assertJsonPath('shipping.status', 'driver_assigned');

        // driver_id atualizado + historico com os 2 motoristas preservado.
        $this->assertDatabaseHas('shippings', [
            'shipping_id' => $shipping->shipping_id,
            'driver_id' => $motoristaA->driver_id,
        ]);

        $this->assertDatabaseCount('shipping_drivers', 2);
        $this->assertDatabaseHas('shipping_drivers', [
            'shipping_id' => $shipping->shipping_id,
            'driver_id' => $motoristaA->driver_id,
            'status' => 'accepted',
        ]);
    }

    public function test_motorista_sem_oferta_nao_responde(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $outro = Driver::factory()->create();

        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create();

        $this->actingAs($outro, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/responder", ['status' => 'accepted'])
            ->assertStatus(404);
    }

    public function test_resposta_duplicada_e_rejeitada(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/procurar-motoristas");

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/responder", ['status' => 'accepted'])
            ->assertOk();

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/responder", ['status' => 'rejected'])
            ->assertStatus(422);
    }

    public function test_fluxo_completo_iniciar_e_concluir(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/procurar-motoristas");

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/responder", ['status' => 'accepted'])
            ->assertOk();

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/iniciar")
            ->assertOk()
            ->assertJsonPath('status', 'in_transit');

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/concluir")
            ->assertOk()
            ->assertJsonPath('status', 'completed');

        $this->assertNotNull($shipping->fresh()->completed_at);
    }

    public function test_shipping_concluido_nao_reabre(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create([
            'status' => 'completed',
            'completed_at' => now(),
            'driver_id' => $motorista->driver_id,
        ]);

        // completed nao permite transicao p/ in_transit nem cancelamento.
        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/iniciar")
            ->assertStatus(422);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/cancelar")
            ->assertStatus(422);
    }

    public function test_motorista_nao_atribuido_nao_inicia(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $intruso = $this->criarMotoristaComVeiculo();

        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/procurar-motoristas");

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/responder", ['status' => 'accepted']);

        $this->actingAs($intruso, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/iniciar")
            ->assertStatus(403);
    }

    public function test_dono_pode_cancelar_shipping(): void
    {
        $shipping = ShippingFactory::new()->doUsuario($this->usuario)->create([
            'status' => 'pending',
        ]);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/cancelar")
            ->assertOk()
            ->assertJsonPath('status', 'cancelled');
    }

    public function test_outro_usuario_nao_cancela_shipping_alheio(): void
    {
        $outro = User::factory()->create();
        $shipping = ShippingFactory::new()->doUsuario($outro)->create();

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/cancelar")
            ->assertStatus(403);
    }

    public function test_motorista_inicia_e_para_a_simulacao(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $shipping = $this->criarShippingAtribuido($motorista);

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/simulacao/iniciar")
            ->assertOk()
            ->assertJsonPath('simulacao_iniciada_em', fn ($valor) => $valor !== null)
            ->assertJsonPath('simulacao_progresso', fn ($valor) => $valor !== null);

        $this->assertNotNull($shipping->fresh()->simulacao_iniciada_em);

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/simulacao/parar")
            ->assertOk()
            ->assertJsonPath('simulacao_iniciada_em', null)
            ->assertJsonPath('simulacao_progresso', null);

        $this->assertNull($shipping->fresh()->simulacao_iniciada_em);
    }

    public function test_iniciar_simulacao_duplicada_e_rejeitada(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $shipping = $this->criarShippingAtribuido($motorista);

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/simulacao/iniciar")
            ->assertOk();

        $this->actingAs($motorista, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/simulacao/iniciar")
            ->assertStatus(422);
    }

    public function test_cliente_nao_inicia_simulacao(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $shipping = $this->criarShippingAtribuido($motorista);

        $this->actingAs($this->usuario, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/simulacao/iniciar")
            ->assertStatus(403);
    }

    public function test_motorista_nao_atribuido_nao_inicia_simulacao(): void
    {
        $motorista = $this->criarMotoristaComVeiculo();
        $intruso = $this->criarMotoristaComVeiculo();
        $shipping = $this->criarShippingAtribuido($motorista);

        $this->actingAs($intruso, 'sanctum')
            ->postJson("/api/shippings/{$shipping->shipping_id}/simulacao/iniciar")
            ->assertStatus(403);
    }
}