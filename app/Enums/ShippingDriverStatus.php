<?php

namespace App\Enums;

enum ShippingDriverStatus: string
{
    case Pending = 'pending';
    case Accepted = 'accepted';
    case Rejected = 'rejected';
    case Expired = 'expired';
    case Cancelled = 'cancelled';

    public function label(): string
    {
        return match ($this) {
            self::Pending => 'Aguardando resposta',
            self::Accepted => 'Aceita',
            self::Rejected => 'Recusada',
            self::Expired => 'Expirada',
            self::Cancelled => 'Cancelada',
        };
    }

    /**
     * A partir de pending, o motorista pode aceitar ou recusar.
     * O historico de respostas nunca e apagado.
     */
    public static function respostaValida(string $status): bool
    {
        return in_array($status, [self::Accepted->value, self::Rejected->value], true);
    }
}