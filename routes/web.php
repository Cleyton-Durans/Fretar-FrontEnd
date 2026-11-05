<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return response()->json([
        'nome' => 'Fretar API',
        'versao' => '1.0',
        'stack' => 'Laravel 12 + PostgreSQL',
    ]);
});