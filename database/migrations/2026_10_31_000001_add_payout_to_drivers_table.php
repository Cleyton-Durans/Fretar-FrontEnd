<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Forma de recebimento do motorista (chave Pix).
     */
    public function up(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->string('pix_key_type', 20)->nullable()->after('cnh');
            $table->string('pix_key', 140)->nullable()->after('pix_key_type');
        });
    }

    public function down(): void
    {
        Schema::table('drivers', function (Blueprint $table) {
            $table->dropColumn(['pix_key_type', 'pix_key']);
        });
    }
};
