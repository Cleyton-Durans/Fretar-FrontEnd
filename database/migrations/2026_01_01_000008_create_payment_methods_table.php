<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payment_methods', function (Blueprint $table) {
            $table->bigIncrements('payment_method_id');
            $table->unsignedBigInteger('user_id');
            $table->text('stripe_customer_id');
            $table->text('stripe_payment_method_id');
            $table->string('type', 30);
            $table->char('last_4_digits', 4)->nullable();
            $table->string('card_brand', 30)->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('user_id')
                ->references('user_id')
                ->on('users')
                ->onDelete('cascade');

            $table->unique('stripe_payment_method_id');
        });

        DB::statement('CREATE INDEX payment_methods_user_id_index ON payment_methods (user_id)');
        DB::statement('CREATE INDEX payment_methods_stripe_customer_id_index ON payment_methods (stripe_customer_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('payment_methods');
    }
};