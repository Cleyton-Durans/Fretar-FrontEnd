<?php

namespace App\Providers;

use Illuminate\Http\Resources\Json\JsonResource;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        // Recursos JSON sem o wrapper "data" no topo.
        // A API expoe campos de recurso na raiz (ex.: { status, origin, ... }).
        JsonResource::withoutWrapping();
    }
}