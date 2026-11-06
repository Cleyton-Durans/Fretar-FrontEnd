<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Guarda a tarifa por km aplicada (depende do tipo de veiculo), para o
     * historico nao mudar se a tarifa for alterada depois.
     */
    public function up(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->decimal('price_per_km', 8, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->dropColumn('price_per_km');
        });
    }
};
