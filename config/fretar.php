<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Tarifa do frete
    |--------------------------------------------------------------------------
    | O valor do frete e sempre calculado no servidor: distancia x tarifa por km.
    | Para mudar, edite o .env (ou os numeros abaixo), por exemplo:
    |   FRETE_PRICE_PER_KM=25
    */

    // Reais cobrados por quilometro (base = carro; os demais veiculos multiplicam).
    'price_per_km' => (float) env('FRETE_PRICE_PER_KM', 2.5),

    // Valor minimo cobrado por frete (R$).
    'min_price' => (float) env('FRETE_MIN_PRICE', 20),

    // Tipos de veiculo. A tarifa de cada um = tarifa base x multiplicador
    // (o valor minimo tambem). Moto mais barata, caminhao mais caro.
    // A chave (moto, carro...) e a mesma usada no cadastro do motorista.
    'vehicles' => [
        'moto' => ['label' => 'Moto', 'multiplier' => 0.6],
        'carro' => ['label' => 'Carro', 'multiplier' => 1.0],
        'caminhonete' => ['label' => 'Caminhonete', 'multiplier' => 1.3],
        'van' => ['label' => 'Van', 'multiplier' => 1.6],
        'caminhao' => ['label' => 'Caminhão', 'multiplier' => 2.4],
    ],

    // Quando o app nao manda uma distancia de rota confiavel, usa-se a
    // distancia em linha reta multiplicada por este fator (aproxima as ruas).
    'road_factor' => (float) env('FRETE_ROAD_FACTOR', 1.25),

];
