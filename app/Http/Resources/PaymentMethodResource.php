<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentMethodResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->payment_method_id,
            'type' => $this->type,
            'last_4_digits' => $this->last_4_digits,
            'card_brand' => $this->card_brand,
            'created_at' => $this->created_at?->toIso8601String(),
        ];
    }
}