<?php

namespace App\Services;

/**
 * Calcula o valor do frete no servidor (o cliente nao decide o preco).
 * valor = max(valor minimo do veiculo, distancia em km x tarifa por km do veiculo)
 */
class PricingService
{
    /**
     * Tarifa de cada tipo de veiculo (base x multiplicador).
     *
     * @return array<string, array{label: string, price_per_km: float, min_price: float}>
     */
    public function veiculos(): array
    {
        $base = (float) config('fretar.price_per_km');
        $minimo = (float) config('fretar.min_price');
        $lista = [];

        foreach (config('fretar.vehicles') as $chave => $dados) {
            $multiplicador = (float) $dados['multiplier'];

            $lista[$chave] = [
                'label' => $dados['label'],
                'price_per_km' => round($base * $multiplicador, 2),
                'min_price' => round($minimo * $multiplicador, 2),
            ];
        }

        return $lista;
    }

    /**
     * Tarifa vigente (usada pelo app para mostrar a estimativa de cada veiculo).
     */
    public function tarifa(): array
    {
        return [
            'price_per_km' => (float) config('fretar.price_per_km'),
            'min_price' => (float) config('fretar.min_price'),
            'vehicles' => $this->veiculos(),
        ];
    }

    /**
     * Tarifa do veiculo informado (se desconhecido, usa a tarifa base).
     *
     * @return array{price_per_km: float, min_price: float}
     */
    public function tarifaDoVeiculo(?string $tipo): array
    {
        $veiculos = $this->veiculos();

        if ($tipo !== null && isset($veiculos[$tipo])) {
            return [
                'price_per_km' => $veiculos[$tipo]['price_per_km'],
                'min_price' => $veiculos[$tipo]['min_price'],
            ];
        }

        return [
            'price_per_km' => (float) config('fretar.price_per_km'),
            'min_price' => (float) config('fretar.min_price'),
        ];
    }

    /**
     * Distancia em linha reta (km) entre dois pontos (formula de Haversine).
     */
    public function distanciaRetaKm(float $lat1, float $lng1, float $lat2, float $lng2): float
    {
        $raioTerraKm = 6371.0088;

        $dLat = deg2rad($lat2 - $lat1);
        $dLng = deg2rad($lng2 - $lng1);

        $a = sin($dLat / 2) * sin($dLat / 2)
            + cos(deg2rad($lat1)) * cos(deg2rad($lat2)) * sin($dLng / 2) * sin($dLng / 2);

        return 2 * $raioTerraKm * asin(min(1.0, sqrt($a)));
    }

    /**
     * Retorna [distance_km, value, price_per_km]. Usa a distancia de rota
     * informada pelo app quando ela e plausivel; senao, estima pela distancia
     * em linha reta. O valor NUNCA vem do cliente.
     *
     * @param  array<string, mixed>  $dados  origin_lat, origin_lng, destination_lat,
     *                                       destination_lng, recommended_vehicle e
     *                                       (opcional) distance_km
     * @return array{0: float, 1: float, 2: float}
     */
    public function calcular(array $dados): array
    {
        $reta = $this->distanciaRetaKm(
            (float) $dados['origin_lat'],
            (float) $dados['origin_lng'],
            (float) $dados['destination_lat'],
            (float) $dados['destination_lng']
        );

        $distancia = $reta * (float) config('fretar.road_factor');

        if (isset($dados['distance_km'])) {
            $informada = (float) $dados['distance_km'];
            $limiteSuperior = max($reta * 2.5, $reta + 5);

            if ($informada >= $reta * 0.95 && $informada <= $limiteSuperior) {
                $distancia = $informada;
            }
        }

        $tarifa = $this->tarifaDoVeiculo($dados['recommended_vehicle'] ?? null);

        $distancia = round($distancia, 2);
        $valor = round($distancia * $tarifa['price_per_km'], 2);
        $valor = max($tarifa['min_price'], $valor);

        return [$distancia, $valor, $tarifa['price_per_km']];
    }
}
