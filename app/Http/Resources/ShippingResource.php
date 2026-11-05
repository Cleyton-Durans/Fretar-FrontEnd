<?php

namespace App\Http\Resources;

use App\Enums\PaymentStatus;
use App\Enums\ShippingStatus;
use App\Models\Shipping;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ShippingResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        $status = is_string($this->status)
            ? ShippingStatus::from($this->status)
            : $this->status;

        $simulacaoIniciadaEm = $this->simulacao_iniciada_em;
        $simulacaoProgresso = $simulacaoIniciadaEm === null
            ? null
            : min(1.0, max(
                0,
                (now()->getTimestampMs() - $simulacaoIniciadaEm->getTimestampMs())
                    / Shipping::SIMULACAO_DURACAO_MS
            ));

        return [
            'id' => $this->shipping_id,
            'origin' => $this->origin,
            'destination' => $this->destination,
            'origin_lat' => $this->origin_lat !== null ? (float) $this->origin_lat : null,
            'origin_lng' => $this->origin_lng !== null ? (float) $this->origin_lng : null,
            'destination_lat' => $this->destination_lat !== null ? (float) $this->destination_lat : null,
            'destination_lng' => $this->destination_lng !== null ? (float) $this->destination_lng : null,
            'about_load' => $this->about_load,
            'recommended_vehicle' => $this->recommended_vehicle,
            'status' => $status->value,
            'status_label' => $status->label(),
            'value' => (float) $this->value,
            'distance_km' => $this->distance_km !== null ? (float) $this->distance_km : null,
            'price_per_km' => $this->price_per_km !== null ? (float) $this->price_per_km : null,
            'pago' => $this->payments()
                ->where('payment_status', PaymentStatus::Succeeded->value)
                ->exists(),
            'created_at' => $this->created_at?->toIso8601String(),
            'completed_at' => $this->completed_at?->toIso8601String(),
            'simulacao_iniciada_em' => $simulacaoIniciadaEm?->toIso8601String(),
            'simulacao_duracao_ms' => Shipping::SIMULACAO_DURACAO_MS,
            'simulacao_progresso' => $simulacaoProgresso === null
                ? null
                : round($simulacaoProgresso, 4),
            'user' => $this->whenLoaded('user', fn () => [
                'id' => $this->user->user_id,
                'name' => $this->user->name,
            ]),
            'driver' => $this->whenLoaded('driver', fn () => [
                'id' => $this->driver?->driver_id,
                'name' => $this->driver?->name,
            ]),
            'motoristas_ofertados' => $this->whenCounted('shippingDrivers'),
            'tem_avaliacao' => $this->evaluation ? true : false,
            'avaliacao' => $this->whenLoaded('evaluation', fn () => $this->evaluation
                ? [
                    'rating' => $this->evaluation->rating,
                    'comment' => $this->evaluation->comment,
                ]
                : null),
        ];
    }
}