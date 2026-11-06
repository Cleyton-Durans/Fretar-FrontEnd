<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('drivers', function (Blueprint $table) {
            $table->bigIncrements('driver_id');
            $table->string('name', 150);
            $table->text('email');
            $table->text('password_hash');
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->string('cnh', 30);
            $table->boolean('status_online')->default(false);
            $table->text('avatar')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement('ALTER TABLE drivers ALTER COLUMN email TYPE CITEXT');
        DB::statement('CREATE UNIQUE INDEX drivers_email_unique ON drivers (email)');
        DB::statement('CREATE UNIQUE INDEX drivers_cnh_unique ON drivers (cnh)');
        DB::statement('CREATE INDEX drivers_status_online_index ON drivers (status_online)');
    }

    public function down(): void
    {
        Schema::dropIfExists('drivers');
    }
};