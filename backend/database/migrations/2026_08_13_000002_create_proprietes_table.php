<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('proprietes', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['maison', 'appartement', 'terrain'])->default('appartement');
            $table->enum('mode', ['location', 'vente'])->default('location');
            $table->enum('statut', ['disponible', 'en_attente', 'occupe', 'vendu', 'indisponible'])->default('en_attente');
            $table->enum('verification', ['en_attente', 'verifiee', 'rejetee'])->default('en_attente');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2);
            $table->enum('type_loyer', ['mensuel', 'journalier', 'annuel'])->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('proprietes');
    }
};
