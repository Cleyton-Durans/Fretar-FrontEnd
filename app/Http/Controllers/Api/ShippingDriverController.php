<?php

namespace App\Http\Controllers\Api;

use App\Enums\ShippingDriverStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\RespondShippingRequest;
use App\Http\Resources\ShippingResource;
use App\Models\Driver;
use App\Models\Shipping;
use App\Services\ShippingService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ShippingDriverController extends Controller
{
    public function __construct(private readonly ShippingService $servico) {}

    public function minhasOffers(Request $request): JsonResponse
    {
        /** @var Driver $motorista */
        $motorista = $request->user();

        // Retorna cada oferta com o status do proprio vinculo
        // (pending/accepted/rejected), para o painel do motorista saber o que
        // ja foi respondido, + o recurso da solicitacao.
        $ofertas = $motorista->shippingDriverOffers()
            ->with(['shipping.user', 'shipping.driver', 'shipping.evaluation'])
            ->orderByDesc('shipping_id')
            ->get()
            ->map(fn ($registro) => [
                'offer_status' => $registro->status->value,
                'offer_status_label' => $registro->status->label(),
                'reply_at' => $registro->reply_at?->toIso8601String(),
                'shipping' => new ShippingResource($registro->shipping),
            ]);

        return response()->json($ofertas);
    }

    public function responder(
        Request $request,
        Shipping $shipping,
        RespondShippingRequest $validacao
    ): JsonResponse {
        /** @var Driver $motorista */
        $motorista = $request->user();

        $status = ShippingDriverStatus::from($validacao->status);
        $this->servico->responder($shipping, $motorista, $status);

        return response()->json([
            'message' => $status === ShippingDriverStatus::Accepted
                ? 'Oferta aceita. Você foi atribuído a esta solicitação.'
                : 'Oferta recusada.',
            'shipping' => new ShippingResource($shipping->fresh()->load(['user', 'driver', 'evaluation'])),
        ]);
    }
}