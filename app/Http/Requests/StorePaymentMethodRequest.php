<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;
use Illuminate\Validation\Rule;

class StorePaymentMethodRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'stripe_customer_id' => ['nullable', 'string'],
            'stripe_payment_method_id' => ['required', 'string'],
            'type' => ['required', 'string', 'max:30'],
            'last_4_digits' => ['nullable', 'string', 'digits:4'],
            'card_brand' => ['nullable', 'string', 'max:30'],
        ];
    }
}