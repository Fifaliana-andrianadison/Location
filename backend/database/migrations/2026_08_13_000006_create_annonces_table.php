<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('annonces', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->cascadeOnDelete();
            $table->foreignId('appartement_id')->nullable()->constrained('appartements')->nullOnDelete();
            $table->enum('type', ['maison', 'appartement', 'terrain']);
            $table->enum('mode', ['location', 'vente'])->default('location');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->decimal('prix', 12, 2);
            $table->enum('type_loyer', ['mensuel', 'journalier', 'annuel'])->nullable();
            $table->unsignedTinyInteger('nb_pieces')->nullable();
            $table->decimal('superficie', 12, 2)->nullable();
            $table->boolean('meuble')->default(false);
            $table->enum('verification', ['en_attente', 'verifiee', 'rejetee'])->default('en_attente');
            $table->enum('statut', ['disponible', 'en_attente', 'occupe', 'vendu', 'indisponible'])->default('disponible');
            $table->timestamps();

            $table->index(['verification', 'statut']);
            $table->index(['type', 'mode']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('annonces');
    }
};
