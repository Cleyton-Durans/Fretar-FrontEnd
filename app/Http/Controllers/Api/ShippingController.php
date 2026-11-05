<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreShippingRequest;
use App\Http\Resources\ShippingResource;
use App\Models\Driver;
use App\Models\Shipping;
use App\Models\User;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class ShippingController extends Controller
{
    public function __construct(private readonly ShippingService $servico) {}

    public function index(Request $request): AnonymousResourceCollection
    {
        $usuario = $request->user();

        $consulta = Shipping::query()
            ->with(['user', 'driver', 'evaluation'])
            ->withCount('shippingDrivers')
            ->orderByDesc('created_at');

        if ($usuario instanceof User) {
            $consulta->where('user_id', $usuario->user_id);
        } elseif ($usuario instanceof Driver) {
            $consulta->where(function ($q) use ($usuario) {
                $q->where('driver_id', $usuario->driver_id)
                    ->orWhereHas('shippingDrivers', fn ($sub) => $sub->where('driver_id', $usuario->driver_id));
            });
        }

        return ShippingResource::collection($consulta->get());
    }

    public function show(Request $request, Shipping $shipping): ShippingResource
    {
        $shipping->load(['user', 'driver', 'evaluation']);

        $usuario = $request->user();
        $eProprietario = $usuario instanceof User && $shipping->user_id === $usuario->user_id;
        $eMotorista = $usuario instanceof Driver
            && ($shipping->driver_id === $usuario->driver_id
                || $shipping->shippingDrivers()->where('driver_id', $usuario->driver_id)->exists());

        if (! $eProprietario && ! $eMotorista) {
            abort(403, 'Você não tem acesso a esta solicitação.');
        }

        return new ShippingResource($shipping);
    }

    /**
     * Tarifa vigente (R$/km e valor minimo) para o app mostrar a estimativa.
     */
    public function tarifa(): JsonResponse
    {
        return response()->json(app(\App\Services\PricingService::class)->tarifa());
    }

    public function store(StoreShippingRequest $request): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $shipping = $this->servico->criar($usuario, $request->validated());
        $shipping->load(['user', 'driver', 'evaluation']);

        return (new ShippingResource($shipping))->response()->setStatusCode(201);
    }

    public function cancelar(Request $request, Shipping $shipping): ShippingResource
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $this->servico->cancelar($shipping, $usuario);

        return new ShippingResource($shipping->load(['user', 'driver', 'evaluation']));
    }

    public function procurarMotoristas(Request $request, Shipping $shipping): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $quantidade = $this->servico->procurarMotoristas($shipping, $usuario);

        return response()->json([
            'message' => "Oficializamos {$quantidade} motorista(s) para esta solicitação.",
            'shipping' => new ShippingResource($shipping->load(['driver', 'user', 'evaluation'])),
        ]);
    }

    public function iniciar(Request $request, Shipping $shipping): ShippingResource
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        $this->servico->iniciar($shipping, $motorista);

        return new ShippingResource($shipping->load(['user', 'driver', 'evaluation']));
    }

    public function concluir(Request $request, Shipping $shipping): ShippingResource
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        $this->servico->concluir($shipping, $motorista);

        return new ShippingResource($shipping->load(['user', 'driver', 'evaluation', 'shippingDrivers']));
    }

    public function iniciarSimulacao(Request $request, Shipping $shipping): ShippingResource
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        $this->servico->iniciarSimulacao($shipping, $motorista);

        return new ShippingResource($shipping->load(['user', 'driver', 'evaluation']));
    }

    public function pararSimulacao(Request $request, Shipping $shipping): ShippingResource
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        $this->servico->pararSimulacao($shipping, $motorista);

        return new ShippingResource($shipping->load(['user', 'driver', 'evaluation']));
    }
}