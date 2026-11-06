<?php

namespace Tests\Feature;

use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Foundation\Testing\RefreshDatabase;
use Tests\TestCase;

class AuthApiTest extends TestCase
{
    use RefreshDatabase;

    public function test_usuario_pode_registrar_logar_e_ver_perfil(): void
    {
        $registro = $this->postJson('/api/auth/register/user', [
            'name' => 'Ana Cliente',
            'email' => 'ana@fretar.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ]);

        $registro->assertStatus(201)
            ->assertJsonStructure(['token', 'usuario' => ['id', 'tipo', 'name', 'email']])
            ->assertJsonMissing(['password_hash']);

        $token = $registro->json('token');

        $this->withToken($token)
            ->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('usuario.email', 'ana@fretar.com')
            ->assertJsonPath('usuario.tipo', 'user');

        $this->postJson('/api/auth/login', [
            'email' => 'ana@fretar.com',
            'password' => 'secret123',
        ])->assertOk()->assertJsonStructure(['token']);

        // citext: email em caixa alta tambem deve ser bloqueado como duplicado.
        $this->postJson('/api/auth/register/user', [
            'name' => 'Outra',
            'email' => 'ANA@FRETAR.COM',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
        ])->assertStatus(422);
    }

    public function test_motorista_pode_registrar_com_veiculo(): void
    {
        $registro = $this->postJson('/api/auth/register/driver', [
            'name' => 'Jorge Motorista',
            'email' => 'jorge@fretar.com',
            'password' => 'secret123',
            'password_confirmation' => 'secret123',
            'cnh' => '12345678901',
            'vehicle_type' => 'Van',
            'license_plate' => 'VAN1X99',
            'capacity_load_kg' => 1200,
        ]);

        $registro->assertStatus(201)
            ->assertJsonPath('usuario.tipo', 'driver')
            ->assertJsonPath('usuario.vehicles.0.license_plate', 'VAN1X99');

        $token = $registro->json('token');

        $this->withToken($token)->getJson('/api/auth/me')
            ->assertOk()
            ->assertJsonPath('usuario.cnh', '12345678901');

        $this->assertDatabaseCount('vehicles', 1);
    }

    public function test_login_com_credenciais_invalidas_retorna_401(): void
    {
        $this->postJson('/api/auth/login', [
            'email' => 'ninguem@fretar.com',
            'password' => 'errada123',
        ])->assertStatus(401);
    }

    public function test_rotas_protegidas_exigem_token(): void
    {
        $this->getJson('/api/auth/me')->assertStatus(401);
        $this->postJson('/api/shippings', [])->assertStatus(401);
    }

    public function test_user_nao_acessa_rota_de_driver(): void
    {
        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/me/offers')->assertStatus(403);
        $this->getJson('/api/drivers/vehicles')->assertStatus(403);
    }

    public function test_driver_nao_acessa_rota_de_cliente(): void
    {
        $driver = Driver::factory()->create();
        $this->actingAs($driver, 'sanctum');

        $this->postJson('/api/shippings', [
            'origin' => 'A', 'destination' => 'B', 'value' => 10,
        ])->assertStatus(403);
    }

    public function test_motorista_disponivel_aparece_na_lista(): void
    {
        $driver = Driver::factory()->create();
        Vehicle::factory()->doMotorista($driver)->create();

        $user = User::factory()->create();
        $this->actingAs($user, 'sanctum');

        $this->getJson('/api/drivers/disponiveis')
            ->assertOk()
            ->assertJsonCount(1)
            ->assertJsonPath('0.name', $driver->name);
    }
}