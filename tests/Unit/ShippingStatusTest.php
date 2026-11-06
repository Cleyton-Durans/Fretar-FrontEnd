<?php

namespace Tests\Unit;

use App\Enums\ShippingDriverStatus;
use App\Enums\ShippingStatus;
use PHPUnit\Framework\TestCase;

class ShippingStatusTest extends TestCase
{
    public function test_transicoes_validas_pela_regra_de_negocio(): void
    {
        $this->assertTrue(ShippingStatus::Pending->podeTransicionarPara(ShippingStatus::SearchingDriver));
        $this->assertTrue(ShippingStatus::Pending->podeTransicionarPara(ShippingStatus::Cancelled));
        $this->assertTrue(ShippingStatus::SearchingDriver->podeTransicionarPara(ShippingStatus::DriverAssigned));
        $this->assertTrue(ShippingStatus::DriverAssigned->podeTransicionarPara(ShippingStatus::InTransit));
        $this->assertTrue(ShippingStatus::InTransit->podeTransicionarPara(ShippingStatus::Completed));
    }

    public function test_transicoes_invalidas_sao_bloqueadas(): void
    {
        $this->assertFalse(ShippingStatus::Pending->podeTransicionarPara(ShippingStatus::Completed));
        $this->assertFalse(ShippingStatus::Completed->podeTransicionarPara(ShippingStatus::InTransit));
        $this->assertFalse(ShippingStatus::Cancelled->podeTransicionarPara(ShippingStatus::DriverAssigned));
        $this->assertFalse(ShippingStatus::DriverAssigned->podeTransicionarPara(ShippingStatus::Completed));
    }

    public function test_respostas_de_motorista_permitidas(): void
    {
        $this->assertTrue(ShippingDriverStatus::respostaValida('accepted'));
        $this->assertTrue(ShippingDriverStatus::respostaValida('rejected'));
        $this->assertFalse(ShippingDriverStatus::respostaValida('expired'));
        $this->assertFalse(ShippingDriverStatus::respostaValida('qualquer_coisa'));
    }
}