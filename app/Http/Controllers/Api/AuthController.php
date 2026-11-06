<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\LoginRequest;
use App\Http\Requests\RegisterDriverRequest;
use App\Http\Requests\RegisterUserRequest;
use App\Http\Resources\DriverResource;
use App\Http\Resources\UserResource;
use App\Models\Driver;
use App\Models\User;
use App\Models\Vehicle;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;

class AuthController extends Controller
{
    public function registrarUser(RegisterUserRequest $request): JsonResponse
    {
        $usuario = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'phone' => $request->phone,
            'address' => $request->address,
            'avatar' => $request->avatar,
        ]);

        $token = $usuario->createToken('fretar-user')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'usuario' => new UserResource($usuario),
        ], 201);
    }

    public function registrarDriver(RegisterDriverRequest $request): JsonResponse
    {
        $motorista = Driver::create([
            'name' => $request->name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'cnh' => $request->cnh,
            'phone' => $request->phone,
            'address' => $request->address,
            'pix_key_type' => $request->pix_key_type,
            'pix_key' => $request->pix_key,
            // Nasce online para poder receber ofertas (ainda nao ha botao de ficar online).
            'status_online' => true,
        ]);

        if ($request->filled('vehicle_type') || $request->filled('license_plate')) {
            Vehicle::create([
                'driver_id' => $motorista->driver_id,
                'vehicle_type' => $request->vehicle_type,
                'license_plate' => $request->license_plate,
                'capacity_load_kg' => $request->capacity_load_kg,
            ]);
        }

        $motorista->load('vehicles');
        $token = $motorista->createToken('fretar-driver')->plainTextToken;

        return response()->json([
            'token' => $token,
            'token_type' => 'Bearer',
            'usuario' => new DriverResource($motorista),
        ], 201);
    }

    public function login(LoginRequest $request): JsonResponse
    {
        $email = $request->email;
        $senha = $request->password;

        if (($user = User::where('email', $email)->first()) && Hash::check($senha, $user->password_hash)) {
            $token = $user->createToken('fretar-user')->plainTextToken;

            return response()->json([
                'token' => $token,
                'token_type' => 'Bearer',
                'usuario' => new UserResource($user),
            ]);
        }

        if (($motorista = Driver::where('email', $email)->first()) && Hash::check($senha, $motorista->password_hash)) {
            $motorista->load('vehicles');
            $token = $motorista->createToken('fretar-driver')->plainTextToken;

            return response()->json([
                'token' => $token,
                'token_type' => 'Bearer',
                'usuario' => new DriverResource($motorista),
            ]);
        }

        return response()->json(['message' => 'Credenciais inválidas.'], 401);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json(['message' => 'Sessão encerrada.'], 200);
    }

    public function me(Request $request): JsonResponse
    {
        $usuario = $request->user();

        return response()->json([
            'usuario' => $usuario instanceof Driver
                ? new DriverResource($usuario->load('vehicles'))
                : new UserResource($usuario),
        ]);
    }
}