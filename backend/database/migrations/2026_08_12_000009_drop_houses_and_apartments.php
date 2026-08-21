<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        DB::table('images')
            ->whereIn('imageable_type', ['App\\Models\\House', 'App\\Models\\Apartment'])
            ->delete();

        Schema::dropIfExists('apartments');
        Schema::dropIfExists('houses');
    }

    public function down(): void
    {
        // Les tables houses/apartments sont remplacées par la table unique "biens".
    }
};
