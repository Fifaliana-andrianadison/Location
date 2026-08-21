<?php

namespace App\Console\Commands;

use App\Models\User;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Hash;

class CreateAdmin extends Command
{
    protected $signature = 'users:create-admin {--email= : Email de l\'administrateur} {--password= : Mot de passe} {--name= : Nom}';

    protected $description = 'Crée un administrateur par défaut (idempotent)';

    public function handle(): int
    {
        $email = $this->option('email') ?: env('ADMIN_EMAIL', 'admin@loyer.mg');
        $password = $this->option('password') ?: env('ADMIN_PASSWORD', 'admin123');
        $name = $this->option('name') ?: env('ADMIN_NAME', 'Administrateur');

        $user = User::firstOrCreate(
            ['email' => $email],
            ['name' => $name, 'password' => Hash::make($password), 'role' => User::ROLE_ADMIN],
        );

        if ($user->wasRecentlyCreated) {
            $this->info("Administrateur créé : {$email} / {$password}");
        } else {
            $this->warn("L'administrateur {$email} existe déjà.");
        }

        return self::SUCCESS;
    }
}