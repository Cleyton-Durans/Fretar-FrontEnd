<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->timestampTz('simulacao_iniciada_em')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('shippings', function (Blueprint $table) {
            $table->dropColumn('simulacao_iniciada_em');
        });
    }
};