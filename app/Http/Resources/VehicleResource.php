<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class VehicleResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->vehicle_id,
            'driver_id' => $this->driver_id,
            'vehicle_type' => $this->vehicle_type,
            'license_plate' => $this->license_plate,
            'capacity_load_kg' => (float) $this->capacity_load_kg,
        ];
    }
}