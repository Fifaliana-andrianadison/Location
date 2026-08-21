<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('notifications', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained('users')->cascadeOnDelete();
            $table->enum('type', ['candidature', 'paiement', 'contrat', 'message', 'systeme', 'rappel'])->default('systeme');
            $table->string('titre');
            $table->text('contenu')->nullable();
            $table->string('lien')->nullable();
            $table->boolean('lue')->default(false);
            $table->timestamp('lue_at')->nullable();
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('notifications');
    }
};
