<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('biens', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained('users')->nullOnDelete();
            $table->enum('type_bien', ['appartement', 'villa', 'maison', 'terrain'])->default('appartement');
            $table->enum('mode', ['location', 'vente'])->default('location');
            $table->string('titre');
            $table->text('description')->nullable();
            $table->string('adresse')->nullable();
            $table->string('quartier')->nullable();
            $table->string('ville')->nullable();
            $table->decimal('latitude', 10, 7)->nullable();
            $table->decimal('longitude', 10, 7)->nullable();
            $table->decimal('superficie', 12, 2)->nullable();
            $table->decimal('prix', 12, 2);
            $table->enum('type_loyer', ['mensuel', 'journalier', 'annuel'])->nullable();
            $table->boolean('meuble')->default(false);
            $table->enum('statut', ['disponible', 'occupe', 'vendu', 'en_attente'])->default('disponible');
            $table->unsignedTinyInteger('nb_chambres')->nullable();
            $table->unsignedTinyInteger('nb_salles_bain')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('biens');
    }
};
