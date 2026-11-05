<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Vehicle extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $primaryKey = 'vehicle_id';

    protected $fillable = [
        'driver_id',
        'vehicle_type',
        'license_plate',
        'capacity_load_kg',
    ];

    protected function casts(): array
    {
        return [
            'capacity_load_kg' => 'decimal:2',
        ];
    }

    public function driver(): BelongsTo
    {
        return $this->belongsTo(Driver::class, 'driver_id', 'driver_id');
    }
}