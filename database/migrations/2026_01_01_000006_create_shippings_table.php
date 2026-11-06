<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('shippings', function (Blueprint $table) {
            $table->bigIncrements('shipping_id');
            $table->unsignedBigInteger('user_id');
            $table->unsignedBigInteger('driver_id')->nullable();
            $table->text('origin');
            $table->text('destination');
            $table->text('about_load')->nullable();
            $table->string('recommended_vehicle', 100)->nullable();
            $table->string('status', 30)->default('pending');
            $table->decimal('value', 12, 2);
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('completed_at')->nullable();

            $table->foreign('user_id')->references('user_id')->on('users');
            $table->foreign('driver_id')
                ->references('driver_id')
                ->on('drivers')
                ->onDelete('set null');
        });

        DB::statement('ALTER TABLE shippings ALTER COLUMN status DROP DEFAULT');
        DB::statement('ALTER TABLE shippings
            ALTER COLUMN status TYPE shipping_status USING status::shipping_status');
        DB::statement("ALTER TABLE shippings
            ALTER COLUMN status SET DEFAULT 'pending'::shipping_status");
        DB::statement('ALTER TABLE shippings
            ADD CONSTRAINT chk_shipping_value CHECK (value >= 0)');

        DB::statement('CREATE INDEX shippings_user_id_index ON shippings (user_id)');
        DB::statement('CREATE INDEX shippings_driver_id_index ON shippings (driver_id)');
        DB::statement('CREATE INDEX shippings_status_index ON shippings (status)');
        DB::statement('CREATE INDEX shippings_created_at_index ON shippings (created_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('shippings');
    }
};