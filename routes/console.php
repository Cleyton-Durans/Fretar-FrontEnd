<?php

use Illuminate\Support\Facades\Artisan;

Artisan::command('about', function () {
    $this->comment('Fretar backend — Laravel 12 + PostgreSQL.');
})->purpose('Exibe informacoes resumidas do backend Fretar');