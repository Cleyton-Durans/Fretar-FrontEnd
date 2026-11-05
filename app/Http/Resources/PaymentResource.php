<?php

namespace App\Http\Resources;

use App\Enums\PaymentStatus;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class PaymentResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = is_string($this->payment_status)
            ? PaymentStatus::from($this->payment_status)
            : $this->payment_status;

        return [
            'id' => $this->payment_id,
            'shipping_id' => $this->shipping_id,
            'payment_method_id' => $this->payment_method_id,
            'value' => (float) $this->value,
            'payment_status' => $status->value,
            'payment_status_label' => $status->label(),
            'paid_at' => $this->paid_at?->toIso8601String(),
            'created_at' => $this->created_at?->toIso8601String(),
            'client_secret' => $this->when(! empty($this->resource->clientSecret), $this->resource->clientSecret),
        ];
    }
}