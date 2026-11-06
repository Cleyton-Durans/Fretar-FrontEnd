<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('users', function (Blueprint $table) {
            $table->bigIncrements('user_id');
            $table->string('name', 150);
            $table->text('email');
            $table->text('password_hash');
            $table->string('phone', 30)->nullable();
            $table->text('address')->nullable();
            $table->text('avatar')->nullable();
            $table->timestampTz('created_at')->useCurrent();
            $table->timestampTz('updated_at')->useCurrent();
        });

        DB::statement('ALTER TABLE users ALTER COLUMN email TYPE CITEXT');
        DB::statement('CREATE UNIQUE INDEX users_email_unique ON users (email)');
        DB::statement('CREATE INDEX users_created_at_index ON users (created_at)');
    }

    public function down(): void
    {
        Schema::dropIfExists('users');
    }
};