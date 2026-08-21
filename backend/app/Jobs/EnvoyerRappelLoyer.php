<?php

namespace App\Jobs;

use App\Models\Location;
use App\Models\PaiementLoyer;
use App\Services\NotificationService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class EnvoyerRappelLoyer implements ShouldQueue
{
    use Queueable;

    public function handle(NotificationService $notifications): void
    {
        $mois = now()->startOfMonth()->subMonth();

        $locations = Location::query()
            ->where('statut', Location::STATUT_ACTIF)
            ->with(['locataire'])
            ->whereDoesntHave('paiements', function ($q) use ($mois) {
                $q->where('statut', PaiementLoyer::STATUT_CONFIRME)
                    ->where('mois', $mois->toDateString());
            })
            ->get();

        foreach ($locations as $location) {
            $notifications->envoyer(
                $location->locataire,
                \App\Models\Notification::TYPE_RAPPEL,
                'Rappel de loyer',
                "Votre loyer de {$mois->translatedFormat('F Y')} n'a pas encore été payé.",
                '/mes-paiements'
            );
        }
    }
}