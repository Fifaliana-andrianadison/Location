<?php

namespace App\Listeners;

use App\Events\PaiementEffectue;

class GenererRecu
{
    public function handle(PaiementEffectue $event): void
    {
        $paiement = $event->paiement;

        // TODO: générer un reçu PDF dédié via un service RécuService.
        $paiement->recu_path = $paiement->recu_path ?? "recus/{$paiement->id}-{$paiement->reference}.pdf";
        $paiement->save();
    }
}