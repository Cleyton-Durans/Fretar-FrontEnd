<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StoreShippingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'origin' => ['required', 'string', 'max:1000'],
            'destination' => ['required', 'string', 'max:1000'],
            'origin_lat' => ['required', 'numeric', 'between:-90,90'],
            'origin_lng' => ['required', 'numeric', 'between:-180,180'],
            'destination_lat' => ['required', 'numeric', 'between:-90,90'],
            'destination_lng' => ['required', 'numeric', 'between:-180,180'],
            'about_load' => ['nullable', 'string'],
            // Tipo de veiculo: define a tarifa por km (config/fretar.php).
            'recommended_vehicle' => ['required', 'string', Rule::in(array_keys(config('fretar.vehicles')))],
            // O valor NAO vem do cliente: e calculado no servidor (PricingService).
            'distance_km' => ['nullable', 'numeric', 'min:0', 'max:20000'],
        ];
    }
}