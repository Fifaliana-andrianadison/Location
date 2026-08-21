<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('apartment_id');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('bien_id')->nullable()->after('id')->constrained('biens')->nullOnDelete();
            $table->foreignId('user_id')->nullable()->after('bien_id')->constrained('users')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bien_id');
            $table->dropConstrainedForeignId('user_id');
        });

        Schema::table('tenants', function (Blueprint $table) {
            $table->foreignId('apartment_id')->nullable()->after('id')->constrained('apartments')->nullOnDelete();
        });
    }
};
