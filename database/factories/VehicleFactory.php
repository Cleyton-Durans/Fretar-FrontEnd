<?php

namespace Database\Factories;

use App\Models\Driver;
use Illuminate\Database\Eloquent\Factories\Factory;

class VehicleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'driver_id' => Driver::factory(),
            'vehicle_type' => fake()->randomElement(['Van', 'Caminhão 3/4', 'Caminhão Truck']),
            'license_plate' => fake()->unique()->regexify('[A-Z]{3}[0-9][A-Z0-9][0-9]{2}'),
            'capacity_load_kg' => fake()->randomFloat(2, 500, 15000),
        ];
    }

    public function doMotorista(Driver $driver): static
    {
        return $this->state(fn () => ['driver_id' => $driver->driver_id]);
    }
}