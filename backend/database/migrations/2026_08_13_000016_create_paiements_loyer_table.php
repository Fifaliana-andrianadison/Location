<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('paiements_loyer', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->date('mois');
            $table->decimal('montant', 12, 2);
            $table->enum('methode', ['mvola', 'orange_money', 'airtel_money', 'especes', 'virement'])->default('especes');
            $table->string('reference')->nullable();
            $table->enum('statut', ['en_attente', 'confirme', 'rejete'])->default('en_attente');
            $table->string('recu_path')->nullable();
            $table->dateTime('paye_le')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('paiements_loyer');
    }
};
