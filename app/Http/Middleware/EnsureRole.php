<?php

namespace App\Http\Middleware;

use App\Models\Driver;
use App\Models\User;
use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureRole
{
    /**
     * Verifica se o token autenticado pertence a um User ou Driver.
     * Uso: ->middleware('role:driver') ou 'role:user'.
     */
    public function handle(Request $request, Closure $next, string $role): Response
    {
        $usuario = $request->user();

        if ($role === 'driver' && ! $usuario instanceof Driver) {
            return response()->json(['message' => 'Acesso restrito a motoristas.'], 403);
        }

        if ($role === 'user' && ! $usuario instanceof User) {
            return response()->json(['message' => 'Acesso restrito a clientes.'], 403);
        }

        return $next($request);
    }
}