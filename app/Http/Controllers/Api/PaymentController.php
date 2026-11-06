<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaymentMethodRequest;
use App\Http\Requests\StorePaymentRequest;
use App\Http\Resources\PaymentMethodResource;
use App\Http\Resources\PaymentResource;
use App\Models\Payment;
use App\Models\PaymentMethod;
use App\Models\Shipping;
use App\Models\User;
use App\Services\PaymentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;

class PaymentController extends Controller
{
    public function __construct(private readonly PaymentService $servico) {}

    public function metodos(Request $request): AnonymousResourceCollection
    {
        /** @var User $usuario */
        $usuario = $request->user();

        return PaymentMethodResource::collection($usuario->paymentMethods()->get());
    }

    public function salvarMetodo(StorePaymentMethodRequest $request): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $metodo = $this->servico->salvarMetodo($usuario, $request->validated());

        return (new PaymentMethodResource($metodo))->response()->setStatusCode(201);
    }

    public function store(StorePaymentRequest $request, Shipping $shipping): JsonResponse
    {
        $this->garantirProprietario($request->user(), $shipping);

        $metodo = PaymentMethod::findOrFail($request->payment_method_id);
        $payment = $this->servico->criarIntent($shipping, $metodo);

        return (new PaymentResource($payment))->response()->setStatusCode(201);
    }

    public function confirmar(Request $request, Payment $payment): PaymentResource
    {
        $shipping = $payment->shipping()->firstOrFail();
        $this->garantirProprietario($request->user(), $shipping);

        $metodo = $payment->paymentMethod;

        if (! $metodo) {
            abort(422, 'Pagamento sem método vinculado.');
        }

        return new PaymentResource($this->servico->confirmar($payment, $metodo));
    }

    private function garantirProprietario(User $usuario, Shipping $shipping): void
    {
        if ($shipping->user_id !== $usuario->user_id) {
            abort(403, 'Esta solicitação não pertence a você.');
        }
    }
}