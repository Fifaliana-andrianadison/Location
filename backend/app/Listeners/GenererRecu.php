<?php

namespace App\Listeners;

use App\Events\PaiementEffectue;

class GenererRecu
{
    public function handle(PaiementEffectue $event): void
    {
        $paiement = $event->paiement;

        // Le reçu PDF dédié n'est pas encore généré : on ne stocke donc pas de chemin fictif.
        // TODO: générer le reçu via un service dédié puis renseigner recu_path.
    }
}