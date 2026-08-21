<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DefaultAdminSeeder extends Seeder
{
    public function run(): void
    {
        User::firstOrCreate(
            ['email' => env('ADMIN_EMAIL', 'admin@tanytoerana.mg')],
            [
                'name' => env('ADMIN_NAME', 'Administrateur'),
                'password' => Hash::make(env('ADMIN_PASSWORD', 'admin123')),
                'role' => User::ROLE_ADMIN,
            ]
        );

        $this->command?->info('Administrateur par défaut : '.env('ADMIN_EMAIL', 'admin@tanytoerana.mg').' / '.env('ADMIN_PASSWORD', 'admin123'));
    }
}
