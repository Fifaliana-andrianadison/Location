<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('maisons', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->constrained('proprietes')->cascadeOnDelete();
            $table->unsignedTinyInteger('nb_etages')->default(0);
            $table->unsignedTinyInteger('nb_chambres')->default(1);
            $table->unsignedTinyInteger('nb_salles_bain')->default(1);
            $table->decimal('superficie', 12, 2)->nullable();
            $table->boolean('meuble')->default(false);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('maisons');
    }
};
