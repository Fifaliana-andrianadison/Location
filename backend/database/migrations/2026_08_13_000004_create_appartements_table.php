<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('appartements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->cascadeOnDelete();
            $table->foreignId('maison_id')->nullable()->constrained('maisons')->nullOnDelete();
            $table->unsignedTinyInteger('nb_pieces')->default(1);
            $table->unsignedTinyInteger('nb_chambres')->default(1);
            $table->unsignedTinyInteger('nb_salles_bain')->default(1);
            $table->decimal('superficie', 12, 2)->nullable();
            $table->boolean('meuble')->default(false);
            $table->decimal('prix', 12, 2);
            $table->enum('statut', ['disponible', 'en_attente', 'occupe', 'indisponible'])->default('en_attente');
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('appartements');
    }
};
