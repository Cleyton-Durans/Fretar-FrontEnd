<?php

namespace Database\Factories;

use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Facades\Hash;

class DriverFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->name(),
            'email' => fake()->unique()->safeEmail(),
            'password_hash' => Hash::make('secret123'),
            'phone' => fake()->phoneNumber(),
            'address' => fake()->address(),
            'cnh' => fake()->unique()->numerify('###########'),
            'status_online' => true,
            'avatar' => null,
        ];
    }
}