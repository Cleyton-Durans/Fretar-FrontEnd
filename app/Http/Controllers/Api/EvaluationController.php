<?php

namespace App\Http\Controllers\Api;

use App\Enums\ShippingStatus;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreEvaluationRequest;
use App\Http\Resources\EvaluationResource;
use App\Models\Evaluation;
use App\Models\Shipping;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\AnonymousResourceCollection;
use Illuminate\Validation\ValidationException;

class EvaluationController extends Controller
{
    public function index(Request $request): AnonymousResourceCollection
    {
        /** @var User $usuario */
        $usuario = $request->user();

        return EvaluationResource::collection(
            $usuario->evaluations()->with('driver')->get()
        );
    }

    public function store(StoreEvaluationRequest $request, Shipping $shipping): JsonResponse
    {
        /** @var User $usuario */
        $usuario = $request->user();

        $this->garantirRegras($shipping, $usuario);

        $avaliacao = Evaluation::create([
            'shipping_id' => $shipping->shipping_id,
            'user_id' => $usuario->user_id,
            'driver_id' => $shipping->driver_id,
            'rating' => $request->rating,
            'comment' => $request->comment,
        ]);

        return (new EvaluationResource($avaliacao->load('driver')))->response()->setStatusCode(201);
    }

    private function garantirRegras(Shipping $shipping, User $usuario): void
    {
        if ($shipping->user_id !== $usuario->user_id) {
            abort(403, 'Apenas o proprietário do shipping pode avaliar.');
        }

        if ($shipping->status !== ShippingStatus::Completed) {
            throw ValidationException::withMessages([
                'shipping' => 'A avaliação deve ocorrer somente após a conclusão do shipping.',
            ]);
        }

        if (! $shipping->driver_id) {
            throw ValidationException::withMessages([
                'shipping' => 'Nenhum motorista foi atribuído a este shipping.',
            ]);
        }

        if ($shipping->temAvaliacao()) {
            throw ValidationException::withMessages([
                'shipping' => 'Este shipping já possui uma avaliação.',
            ]);
        }
    }
}