<?php

namespace Database\Factories;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

class ShippingFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'origin' => fake()->city().' — Centro',
            'destination' => fake()->city().' — Zona Sul',
            'about_load' => fake()->sentence(),
            'recommended_vehicle' => 'Caminhão 3/4',
            'status' => 'pending',
            'value' => fake()->randomFloat(2, 50, 5000),
        ];
    }

    public function doUsuario(User $user): static
    {
        return $this->state(fn () => ['user_id' => $user->user_id]);
    }

    public function concluida(): static
    {
        return $this->state(fn () => [
            'status' => 'completed',
            'completed_at' => now(),
        ]);
    }
}