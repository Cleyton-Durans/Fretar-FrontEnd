<?php

namespace Database\Seeders;

use App\Models\Driver;
use App\Models\PaymentMethod;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        $usuario = User::firstOrCreate(
            ['email' => 'cliente@fretar.com'],
            [
                'name' => 'Cliente Demo',
                'password_hash' => Hash::make('secret123'),
                'phone' => '(51) 99999-0001',
            ]
        );

        $motorista = Driver::firstOrCreate(
            ['email' => 'motorista@fretar.com'],
            [
                'name' => 'Motorista Demo',
                'password_hash' => Hash::make('secret123'),
                'phone' => '(51) 99999-0002',
                'cnh' => '01234567890',
                'status_online' => true,
            ]
        );

        Vehicle::firstOrCreate(
            ['license_plate' => 'ABC1D23'],
            [
                'driver_id' => $motorista->driver_id,
                'vehicle_type' => 'Caminhão 3/4',
                'capacity_load_kg' => 3000,
            ]
        );

        // Metodo de pagamento mock do cliente demo (F5). Evita a UI de cartao:
        // apenas o token simulado do Stripe e armazenado, nunca dados sensiveis.
        PaymentMethod::firstOrCreate(
            ['stripe_payment_method_id' => 'pm_mock_cliente_demo'],
            [
                'user_id' => $usuario->user_id,
                'stripe_customer_id' => 'cus_mock_cliente_demo',
                'type' => 'card',
                'last_4_digits' => '4242',
                'card_brand' => 'visa',
            ]
        );

        $this->command?->info('Usuário de teste: cliente@fretar.com / secret123');
        $this->command?->info('Motorista de teste: motorista@fretar.com / secret123');
    }
}