<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class PaymentMethod extends Model
{
    public $timestamps = false;

    protected $primaryKey = 'payment_method_id';

    protected $fillable = [
        'user_id',
        'stripe_customer_id',
        'stripe_payment_method_id',
        'type',
        'last_4_digits',
        'card_brand',
    ];

    protected $hidden = [
        'stripe_customer_id',
        'stripe_payment_method_id',
    ];

    protected function casts(): array
    {
        return [
            'created_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'payment_method_id', 'payment_method_id');
    }
}