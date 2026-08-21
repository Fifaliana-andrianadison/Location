<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::dropIfExists('electricity_bills');

        Schema::table('tenant_invoices', function (Blueprint $table) {
            $table->renameColumn('electricity_amount', 'other_charges_amount');
        });

        Schema::table('apartments', function (Blueprint $table) {
            $table->decimal('other_charges', 12, 2)->default(0)->after('monthly_rent');
        });
    }

    public function down(): void
    {
        Schema::table('apartments', function (Blueprint $table) {
            $table->dropColumn('other_charges');
        });

        Schema::table('tenant_invoices', function (Blueprint $table) {
            $table->renameColumn('other_charges_amount', 'electricity_amount');
        });

        Schema::create('electricity_bills', function (Blueprint $table) {
            $table->id();
            $table->foreignId('house_id')->constrained()->cascadeOnDelete();
            $table->unsignedTinyInteger('month');
            $table->unsignedSmallInteger('year');
            $table->decimal('total_amount', 12, 2);
            $table->timestamps();
            $table->unique(['house_id', 'month', 'year']);
        });
    }
};