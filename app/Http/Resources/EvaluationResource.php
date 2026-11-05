<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class EvaluationResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->evaluation_id,
            'shipping_id' => $this->shipping_id,
            'driver_id' => $this->driver_id,
            'driver' => $this->whenLoaded('driver', fn () => [
                'id' => $this->driver->driver_id,
                'name' => $this->driver->name,
            ]),
            'rating' => $this->rating,
            'comment' => $this->comment,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}