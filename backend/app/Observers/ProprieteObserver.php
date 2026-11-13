<?php

namespace App\Observers;

use App\Models\Annonce;
use App\Models\Appartement;
use App\Models\HistoriquePrix;
use App\Models\Propriete;

/**
 * Synchronise automatiquement la table pivot `annonces` à partir de `proprietes`.
 */
class ProprieteObserver
{
    public function created(Propriete $propriete): void
    {
        $this->syncAnnonce($propriete);
    }

    public function updated(Propriete $propriete): void
    {
        if ($propriete->wasChanged('prix') && $propriete->getOriginal('prix') !== null) {
            HistoriquePrix::create([
                'propriete_id' => $propriete->id,
                'ancien_prix' => $propriete->getOriginal('prix'),
                'nouveau_prix' => $propriete->prix,
                'date_changement' => now(),
            ]);
        }

        $this->syncAnnonce($propriete);
    }

    public function deleted(Propriete $propriete): void
    {
        Annonce::where('propriete_id', $propriete->id)->delete();
    }

    public function syncAnnonce(Propriete $propriete): void
    {
        if ($propriete->type === Propriete::TYPE_APPARTEMENT) {
            $appartement = $propriete->appartements()->first();
            $prix = $appartement?->prix ?? $propriete->prix;
            $nbPieces = $appartement?->nb_pieces;
            $statut = $appartement?->statut ?? $propriete->statut;
        } else {
            $prix = $propriete->prix;
            $nbPieces = $propriete->maison?->nb_chambres;
            $statut = $propriete->type === Propriete::TYPE_TERRAIN
                ? ($propriete->terrain?->statut ?? $propriete->statut)
                : $propriete->statut;
        }

        $meuble = $propriete->type === Propriete::TYPE_APPARTEMENT
            ? ($appartement?->meuble ?? false)
            : ($propriete->maison?->meuble ?? false);

        $superficie = $propriete->type === Propriete::TYPE_TERRAIN
            ? $propriete->terrain?->superficie
            : ($propriete->type === Propriete::TYPE_APPARTEMENT
                ? ($appartement?->superficie ?? null)
                : $propriete->maison?->superficie);

        Annonce::updateOrCreate(
            ['propriete_id' => $propriete->id],
            [
                'appartement_id' => $propriete->type === Propriete::TYPE_APPARTEMENT ? $appartement?->id : null,
                'type' => $propriete->type,
                'mode' => $propriete->mode,
                'titre' => $propriete->titre,
                'description' => $propriete->description,
                'prix' => $prix,
                'type_loyer' => $propriete->type_loyer,
                'nb_pieces' => $nbPieces,
                'superficie' => $superficie,
                'meuble' => $meuble,
                'verification' => $propriete->verification,
                'statut' => $statut,
            ]
        );
    }
}