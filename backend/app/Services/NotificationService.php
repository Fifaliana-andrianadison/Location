<?php

namespace App\Services;

use App\Models\Notification;
use App\Models\User;

class NotificationService
{
    public function envoyer(User $user, string $type, string $titre, ?string $contenu = null, ?string $lien = null): Notification
    {
        return Notification::create([
            'user_id' => $user->id,
            'type' => $type,
            'titre' => $titre,
            'contenu' => $contenu,
            'lien' => $lien,
        ]);
    }

    public function notifierProprietaires(string $type, string $titre, ?string $contenu = null, ?string $lien = null): void
    {
        User::where('role', User::ROLE_PROPRIETAIRE)->get()
            ->each(fn ($u) => $this->envoyer($u, $type, $titre, $contenu, $lien));
    }

    public function notifierAdmins(string $type, string $titre, ?string $contenu = null, ?string $lien = null): void
    {
        User::where('role', User::ROLE_ADMIN)->get()
            ->each(fn ($u) => $this->envoyer($u, $type, $titre, $contenu, $lien));
    }
}