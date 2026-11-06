<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreVehicleRequest;
use App\Http\Resources\VehicleResource;
use App\Models\Driver;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class VehicleController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        return VehicleResource::collection($motorista->vehicles()->get());
    }

    public function store(StoreVehicleRequest $request): JsonResponse
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        $veiculo = $motorista->vehicles()->create($request->validated());

        return (new VehicleResource($veiculo))->response()->setStatusCode(201);
    }

    public function show(Request $request, Vehicle $vehicle): VehicleResource
    {
        $this->garantirProprietario($request->user(), $vehicle);

        return new VehicleResource($vehicle);
    }

    public function update(StoreVehicleRequest $request, Vehicle $vehicle): VehicleResource
    {
        $this->garantirProprietario($request->user(), $vehicle);

        $vehicle->update($request->validated());

        return new VehicleResource($vehicle->refresh());
    }

    public function destroy(Request $request, Vehicle $vehicle): JsonResponse
    {
        $this->garantirProprietario($request->user(), $vehicle);

        $vehicle->delete();

        return response()->json(['message' => 'Veículo removido.'], 200);
    }

    private function garantirProprietario(Driver $motorista, Vehicle $vehicle): void
    {
        if ($vehicle->driver_id !== $motorista->driver_id) {
            abort(403, 'Este veículo não pertence a você.');
        }
    }
}