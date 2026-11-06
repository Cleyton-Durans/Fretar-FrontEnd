<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('vehicles', function (Blueprint $table) {
            $table->bigIncrements('vehicle_id');
            $table->unsignedBigInteger('driver_id');
            $table->string('vehicle_type', 50);
            $table->string('license_plate', 20);
            $table->decimal('capacity_load_kg', 10, 2);

            $table->foreign('driver_id')
                ->references('driver_id')
                ->on('drivers')
                ->onDelete('cascade');
        });

        DB::statement('ALTER TABLE vehicles
            ADD CONSTRAINT chk_vehicle_capacity CHECK (capacity_load_kg > 0)');
        DB::statement('ALTER TABLE vehicles
            ADD CONSTRAINT vehicles_license_plate_unique UNIQUE (license_plate)');
        DB::statement('CREATE INDEX vehicles_driver_id_index ON vehicles (driver_id)');
    }

    public function down(): void
    {
        Schema::dropIfExists('vehicles');
    }
};