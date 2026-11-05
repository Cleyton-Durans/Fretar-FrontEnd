<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shipping_drivers', function (Blueprint $table) {
            $table->unsignedBigInteger('shipping_id');
            $table->unsignedBigInteger('driver_id');
            $table->string('status', 30)->default('pending');
            $table->timestampTz('reply_at')->nullable();

            $table->primary(['shipping_id', 'driver_id']);

            $table->foreign('shipping_id')
                ->references('shipping_id')
                ->on('shippings')
                ->onDelete('cascade');
            $table->foreign('driver_id')
                ->references('driver_id')
                ->on('drivers')
                ->onDelete('cascade');
        });

        DB::statement('ALTER TABLE shipping_drivers ALTER COLUMN status DROP DEFAULT');
        DB::statement('ALTER TABLE shipping_drivers
            ALTER COLUMN status TYPE shipping_driver_status USING status::shipping_driver_status');
        DB::statement("ALTER TABLE shipping_drivers
            ALTER COLUMN status SET DEFAULT 'pending'::shipping_driver_status");

        DB::statement('CREATE INDEX shipping_drivers_driver_id_index ON shipping_drivers (driver_id)');
        DB::statement('CREATE INDEX shipping_drivers_status_index ON shipping_drivers (status)');
    }

    public function down(): void
    {
        Schema::dropIfExists('shipping_drivers');
    }
};