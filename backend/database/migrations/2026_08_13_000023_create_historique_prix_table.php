<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('historique_prix', function (Blueprint $table) {
            $table->id();
            $table->foreignId('propriete_id')->nullable()->constrained('proprietes')->cascadeOnDelete();
            $table->foreignId('appartement_id')->nullable()->constrained('appartements')->cascadeOnDelete();
            $table->decimal('ancien_prix', 12, 2);
            $table->decimal('nouveau_prix', 12, 2);
            $table->date('date_changement')->default(now());
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('historique_prix');
    }
};
