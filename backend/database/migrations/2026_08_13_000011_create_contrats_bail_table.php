<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('contrats_bail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('annonce_id')->constrained('annonces')->cascadeOnDelete();
            $table->foreignId('proprietaire_id')->constrained('users')->cascadeOnDelete();
            $table->foreignId('locataire_id')->constrained('users')->cascadeOnDelete();
            $table->date('date_debut');
            $table->date('date_fin');
            $table->decimal('loyer_mensuel', 12, 2);
            $table->decimal('caution', 12, 2)->default(0);
            $table->string('pdf_path')->nullable();
            $table->string('signature_proprietaire')->nullable();
            $table->string('signature_locataire')->nullable();
            $table->enum('statut', ['brouillon', 'en_attente', 'signe', 'actif', 'termine', 'resilie'])->default('brouillon');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('contrats_bail');
    }
};
