<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('etats_des_lieux', function (Blueprint $table) {
            $table->id();
            $table->foreignId('location_id')->constrained('locations')->cascadeOnDelete();
            $table->enum('type', ['entree', 'sortie']);
            $table->date('date');
            $table->text('notes')->nullable();
            $table->json('photos')->nullable();
            $table->string('signature_locataire')->nullable();
            $table->string('signature_proprietaire')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('etats_des_lieux');
    }
};
