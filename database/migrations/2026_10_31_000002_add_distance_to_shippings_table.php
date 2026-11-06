<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Guarda a distancia (km) usada para calcular o valor do frete.
     */
    public function up(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->decimal('distance_km', 8, 2)->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->dropColumn('distance_km');
        });
    }
};
