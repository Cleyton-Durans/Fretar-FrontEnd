<?php

return [

    'stripe' => [
        'secret' => env('STRIPE_SECRET_KEY'),
        'webhook_secret' => env('STRIPE_WEBHOOK_SECRET'),
        // Se true e nao houver STRIPE_SECRET_KEY, gera PaymentIntents mock (pi_mock_*).
        'mock_enabled' => env('STRIPE_MOCK_ENABLED', true),
    ],

    'osrm' => [
        'endpoint' => env('OSRM_ENDPOINT', 'https://router.project-osrm.org'),
    ],

];