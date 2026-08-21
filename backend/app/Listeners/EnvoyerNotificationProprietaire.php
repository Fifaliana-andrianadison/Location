<?php

namespace App\Listeners;

use App\Events\CandidatureRecue;
use App\Services\NotificationService;

class EnvoyerNotificationProprietaire
{
    public function __construct(private NotificationService $notifications)
    {
    }

    public function handle(CandidatureRecue $event): void
    {
        $candidature = $event->candidature;
        $proprietaire = $candidature->annonce?->propriete?->proprietaire;

        if ($proprietaire) {
            $this->notifications->envoyer(
                $proprietaire,
                \App\Models\Notification::TYPE_CANDIDATURE,
                'Nouvelle candidature',
                "{$candidature->locataire?->name} a postulé sur « {$candidature->annonce?->titre} ».",
                "/candidatures/{$candidature->id}"
            );
        }
    }
}