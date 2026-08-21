<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenant_invoices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('house_id');
        });

        Schema::table('tenant_invoices', function (Blueprint $table) {
            $table->foreignId('bien_id')->nullable()->after('tenant_id')->constrained('biens')->nullOnDelete();
        });
    }

    public function down(): void
    {
        Schema::table('tenant_invoices', function (Blueprint $table) {
            $table->dropConstrainedForeignId('bien_id');
        });

        Schema::table('tenant_invoices', function (Blueprint $table) {
            $table->foreignId('house_id')->nullable()->after('tenant_id')->constrained('houses')->nullOnDelete();
        });
    }
};
