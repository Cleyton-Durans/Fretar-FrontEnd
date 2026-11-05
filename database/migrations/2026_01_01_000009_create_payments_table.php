<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('payments', function (Blueprint $table) {
            $table->bigIncrements('payment_id');
            $table->unsignedBigInteger('shipping_id');
            $table->unsignedBigInteger('payment_method_id')->nullable();
            $table->text('stripe_payment_intent_id')->nullable();
            $table->decimal('value', 12, 2);
            $table->string('payment_status', 30)->default('pending');
            $table->timestampTz('paid_at')->nullable();
            $table->timestampTz('created_at')->useCurrent();

            $table->foreign('shipping_id')
                ->references('shipping_id')
                ->on('shippings');
            $table->foreign('payment_method_id')
                ->references('payment_method_id')
                ->on('payment_methods')
                ->onDelete('set null');
        });

        DB::statement('ALTER TABLE payments ALTER COLUMN payment_status DROP DEFAULT');
        DB::statement('ALTER TABLE payments
            ALTER COLUMN payment_status TYPE payment_status USING payment_status::payment_status');
        DB::statement("ALTER TABLE payments
            ALTER COLUMN payment_status SET DEFAULT 'pending'::payment_status");
        DB::statement('ALTER TABLE payments
            ADD CONSTRAINT chk_payment_value CHECK (value >= 0)');

        DB::statement('CREATE UNIQUE INDEX payments_stripe_payment_intent_id_unique ON payments (stripe_payment_intent_id)');
        DB::statement('CREATE INDEX payments_shipping_id_index ON payments (shipping_id)');
        DB::statement('CREATE INDEX payments_payment_method_id_index ON payments (payment_method_id)');
        DB::statement('CREATE INDEX payments_payment_status_index ON payments (payment_status)');
        DB::statement('CREATE INDEX payments_created_at_index ON payments (created_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('payments');
    }
};