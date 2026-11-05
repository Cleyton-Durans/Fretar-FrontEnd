<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;

class Driver extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $primaryKey = 'driver_id';

    protected $fillable = [
        'name',
        'email',
        'password_hash',
        'phone',
        'address',
        'cnh',
        'pix_key_type',
        'pix_key',
        'status_online',
        'avatar',
    ];

    protected $hidden = [
        'password_hash',
    ];

    protected function casts(): array
    {
        return [
            'status_online' => 'boolean',
            'created_at' => 'datetime',
            'updated_at' => 'datetime',
        ];
    }

    public function getAuthPassword(): string
    {
        return $this->password_hash;
    }

    public function getAuthIdentifierName(): string
    {
        return 'email';
    }

    public function vehicles(): HasMany
    {
        return $this->hasMany(Vehicle::class, 'driver_id', 'driver_id');
    }

    public function assignedShippings(): HasMany
    {
        return $this->hasMany(Shipping::class, 'driver_id', 'driver_id');
    }

    public function shippingDriverOffers(): HasMany
    {
        return $this->hasMany(ShippingDriver::class, 'driver_id', 'driver_id');
    }

    public function evaluationsReceived(): HasMany
    {
        return $this->hasMany(Evaluation::class, 'driver_id', 'driver_id');
    }

    public function getRating(): float
    {
        return $this->evaluationsReceived()->avg('rating') ?? 0;
    }
}