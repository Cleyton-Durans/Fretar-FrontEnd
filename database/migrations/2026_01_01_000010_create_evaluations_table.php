<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('evaluations', function (Blueprint $table) {
            $table->bigIncrements('evaluation_id');
            $table->unsignedBigInteger('driver_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('shipping_id');
            $table->smallInteger('rating');
            $table->text('comment')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('driver_id')->references('driver_id')->on('drivers');
            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('shipping_id')->references('shipping_id')->on('shippings');

            // Um shipping possui no maximo uma avaliacao (one_to_one).
            $table->unique('shipping_id');
        });

        DB::statement('ALTER TABLE evaluations
            ADD CONSTRAINT chk_evaluation_rating CHECK (rating >= 1 AND rating <= 5)');

        DB::statement('CREATE INDEX evaluations_driver_id_index ON evaluations (driver_id)');
        DB::statement('CREATE INDEX evaluations_user_id_index ON evaluations (user_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('evaluations');
    }
};