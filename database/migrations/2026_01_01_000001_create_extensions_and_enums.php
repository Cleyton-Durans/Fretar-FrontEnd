<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up(): void
    {
        DB::statement('CREATE EXTENSION IF NOT EXISTS citext');

        DB::statement("CREATE TYPE shipping_status AS ENUM (
            'pending',
            'searching_driver',
            'driver_assigned',
            'in_transit',
            'completed',
            'cancelled'
        )");

        DB::statement("CREATE TYPE shipping_driver_status AS ENUM (
            'pending',
            'accepted',
            'rejected',
            'expired',
            'cancelled'
        )");

        DB::statement("CREATE TYPE payment_status AS ENUM (
            'pending',
            'processing',
            'succeeded',
            'failed',
            'cancelled',
            'refunded'
        )");
    }

    public function down(): void
    {
        DB::statement('DROP TYPE IF EXISTS payment_status');
        DB::statement('DROP TYPE IF EXISTS shipping_driver_status');
        DB::statement('DROP TYPE IF EXISTS shipping_status');
        DB::statement('DROP EXTENSION IF EXISTS citext');
    }
};