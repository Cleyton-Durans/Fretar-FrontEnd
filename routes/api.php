<?php

use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DriverController;
use App\Http\Controllers\Api\EvaluationController;
use App\Http\Controllers\Api\PaymentController;
use App\Http\Controllers\Api\ShippingController;
use App\Http\Controllers\Api\ShippingDriverController;
use App\Http\Controllers\Api\VehicleController;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| autenticacao via Laravel Sanctum (tokens de API).
| Users e Drivers autenticam com credenciais proprias
| (tabelas users e drivers, conforme database-schema.yaml).
|
*/

Route::prefix('auth')->group(function () {
    Route::post('/register/user', [AuthController::class, 'registrarUser']);
    Route::post('/register/driver', [AuthController::class, 'registrarDriver']);
    Route::post('/login', [AuthController::class, 'login']);
    Route::post('/logout', [AuthController::class, 'logout'])->middleware('auth:sanctum');
    Route::get('/me', [AuthController::class, 'me'])->middleware('auth:sanctum');
});

Route::middleware('auth:sanctum')->group(function () {
    // Lista de motoristas disponiveis (qualquer autenticado).
    Route::get('/drivers/disponiveis', [DriverController::class, 'disponiveis']);

    // Tarifa vigente (R$/km e minimo) para mostrar a estimativa ao cliente.
    Route::get('/tarifa', [ShippingController::class, 'tarifa']);

    // Histórico: cliente e motorista (o controller já trata os dois casos).
    Route::get('/me/shippings', [ShippingController::class, 'index']);

    // ---------- Users: solicitações de transporte ----------
    Route::middleware('role:user')->group(function () {
        Route::post('/shippings', [ShippingController::class, 'store']);
        Route::get('/shippings/{shipping}', [ShippingController::class, 'show']);
        Route::post('/shippings/{shipping}/cancelar', [ShippingController::class, 'cancelar']);
        Route::post('/shippings/{shipping}/procurar-motoristas', [ShippingController::class, 'procurarMotoristas']);

        // ---------- Métodos de pagamento ----------
        Route::get('/me/payment-methods', [PaymentController::class, 'metodos']);
        Route::post('/me/payment-methods', [PaymentController::class, 'salvarMetodo']);
        Route::post('/shippings/{shipping}/payments', [PaymentController::class, 'store']);
        Route::post('/payments/{payment}/confirmar', [PaymentController::class, 'confirmar']);

        // ---------- Avaliações ----------
        Route::post('/shippings/{shipping}/evaluation', [EvaluationController::class, 'store']);
        Route::get('/evaluations', [EvaluationController::class, 'index']);
    });

    // ---------- Drivers: responder e executar solicitações ----------
    Route::middleware('role:driver')->group(function () {
        Route::get('/me', [DriverController::class, 'me']);
        Route::get('/me/offers', [ShippingDriverController::class, 'minhasOffers']);
        Route::post('/shippings/{shipping}/responder', [ShippingDriverController::class, 'responder']);
        Route::post('/shippings/{shipping}/iniciar', [ShippingController::class, 'iniciar']);
        Route::post('/shippings/{shipping}/concluir', [ShippingController::class, 'concluir']);
        Route::post('/shippings/{shipping}/simulacao/iniciar', [ShippingController::class, 'iniciarSimulacao']);
        Route::post('/shippings/{shipping}/simulacao/parar', [ShippingController::class, 'pararSimulacao']);

        Route::apiResource('/drivers/vehicles', VehicleController::class);
    });
});