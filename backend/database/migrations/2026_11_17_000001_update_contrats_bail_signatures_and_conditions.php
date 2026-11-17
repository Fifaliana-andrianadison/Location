<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('contrats_bail', function (Blueprint $table) {
            // Les signatures dessinées sont des images base64 : bien plus de 255 caractères.
            $table->longText('signature_proprietaire')->nullable()->change();
            $table->longText('signature_locataire')->nullable()->change();
        });

        Schema::table('contrats_bail', function (Blueprint $table) {
            $table->text('conditions')->nullable()->after('caution');
        });
    }

    public function down(): void
    {
        Schema::table('contrats_bail', function (Blueprint $table) {
            $table->dropColumn('conditions');
        });
    }
};
