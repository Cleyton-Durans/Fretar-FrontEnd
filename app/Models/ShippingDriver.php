<?php

namespace App\Models;

use App\Enums\ShippingDriverStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ShippingDriver extends Model
{
    /**
     * Chave primaria composta (shipping_id, driver_id).
     * O schema garante que um mesmo motorista nao aparece duas vezes no mesmo shipping.
     */
    public $incrementing = false;

    public $timestamps = false;

    protected $primaryKey = 'shipping_id';

    protected $fillable = [
        'shipping_id',
        'driver_id',
        'status',
        'reply_at',
    ];

    protected function casts(): array
    {
        return [
            'status' => ShippingDriverStatus::class,
            'reply_at' => 'datetime',
        ];
    }

    public function shipping(): BelongsTo
    {
        return $this->belongsTo(Shipping::class, 'shipping_id', 'shipping_id');
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }
}