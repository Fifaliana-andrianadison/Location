<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->string('cin')->nullable()->after('full_name');
            $table->unsignedTinyInteger('children_count')->default(0)->after('cin');
            $table->unsignedTinyInteger('adults_count')->default(1)->after('children_count');
            $table->string('job')->nullable()->after('adults_count');
            $table->string('origin')->nullable()->after('job');
        });
    }

    public function down(): void
    {
        Schema::table('tenants', function (Blueprint $table) {
            $table->dropColumn(['cin', 'children_count', 'adults_count', 'job', 'origin']);
        });
    }
};
