<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            $table->unsignedSmallInteger('rooms_count')->default(1)->after('label');
            $table->text('description')->nullable()->after('monthly_rent');
        });

        Schema::table('houses', function (Blueprint $table) {
            $table->string('address')->nullable()->after('name');
            $table->string('neighborhood')->nullable()->after('address');
        });
    }

    public function down(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            $table->dropColumn(['rooms_count', 'description']);
        });

        Schema::table('houses', function (Blueprint $table) {
            $table->dropColumn(['address', 'neighborhood']);
        });
    }
};
