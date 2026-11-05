<?php

namespace App\Models;

use App\Enums\ShippingStatus;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Shipping extends Model
{
    /**
     * Duracao da simulacao de trajeto (visualizacao compartilhada
     * motorista -> cliente) usada para derivar o progresso do percurso.
     */
    public const SIMULACAO_DURACAO_MS = 120000;

    /**
     * O schema nao possui updated_at em shippings (apenas created_at/completed_at).
     * created_at e preenchido pelo default now() do banco.
     */
    public $timestamps = false;

    protected $primaryKey = 'shipping_id';

    protected $fillable = [
        'user_id',
        'driver_id',
        'origin',
        'destination',
        'origin_lat',
        'origin_lng',
        'destination_lat',
        'destination_lng',
        'about_load',
        'recommended_vehicle',
        'status',
        'value',
        'distance_km',
        'price_per_km',
        'completed_at',
        'simulacao_iniciada_em',
    ];

    protected function casts(): array
    {
        return [
            'status' => ShippingStatus::class,
            'value' => 'decimal:2',
            'distance_km' => 'decimal:2',
            'price_per_km' => 'decimal:2',
            'origin_lat' => 'decimal:7',
            'origin_lng' => 'decimal:7',
            'destination_lat' => 'decimal:7',
            'destination_lng' => 'decimal:7',
            'created_at' => 'datetime',
            'completed_at' => 'datetime',
            'simulacao_iniciada_em' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id', 'user_id');
    }

    /**
     * Motorista atualmente atribuido ao envio (nullable).
     * O historico completo fica em shippingDrivers().
     */
    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }

    public function shippingDrivers(): HasMany
    {
        return $this->hasMany(ShippingDriver::class, 'shipping_id', 'shipping_id');
    }

    public function payments(): HasMany
    {
        return $this->hasMany(Payment::class, 'shipping_id', 'shipping_id');
    }

    public function evaluation(): HasOne
    {
        return $this->hasOne(Evaluation::class, 'shipping_id', 'shipping_id');
    }

    public function temAvaliacao(): bool
    {
        return $this->evaluation()->exists();
    }
}