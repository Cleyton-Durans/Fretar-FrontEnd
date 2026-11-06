<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\DriverResource;
use App\Models\Driver;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class DriverController extends Controller
{
    public function me(Request $request): DriverResource
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        return new DriverResource($motorista->load('vehicles'));
    }

    public function disponiveis(Request $request): AnonymousResourceCollection
    {
        return DriverResource::collection(
            Driver::query()
                ->where('status_online', true)
                ->whereHas('vehicles')
                ->with('vehicles')
                ->get()
        );
    }
}