<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     * NB : les événements de modèles sont volontairement ACTIFS
     * (ProprieteObserver synchronise la table `annonces`).
     */
    public function run(): void
    {
        $this->call(DefaultAdminSeeder::class);
        $this->call(DemoDataSeeder::class);
    }
}
