<?php

namespace App\Enums;

enum ShippingStatus: string
{
    case Pending = 'pending';
    case SearchingDriver = 'searching_driver';
    case DriverAssigned = 'driver_assigned';
    case InTransit = 'in_transit';
    case Completed = 'completed';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Pendente',
            self::SearchingDriver => 'Procurando motorista',
            self::DriverAssigned => 'Motorista atribuído',
            self::InTransit => 'Em trânsito',
            self::Completed => 'Concluído',
            self::Cancelled => 'Cancelado',
        };
    }

    /**
     * Transicoes validas a partir do estado atual.
     */
    public function transicoes(): array
    {
        return match ($this) {
            self::Pending => [self::SearchingDriver, self::Cancelled],
            self::SearchingDriver => [self::DriverAssigned, self::Cancelled],
            self::DriverAssigned => [self::InTransit, self::Cancelled],
            self::InTransit => [self::Completed],
            self::Completed, self::Cancelled => [],
        };
    }

    public function podeTransicionarPara(self $proximo): bool
    {
        return in_array($proximo, $this->transicoes(), true);
    }
}