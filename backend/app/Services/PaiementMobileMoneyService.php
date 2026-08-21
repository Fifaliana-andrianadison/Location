<?php

namespace App\Services;

use Illuminate\Support\Str;

/**
 * Abstraction des paiements Mobile Money (Mvola / Orange Money / Airtel Money).
 * En l'absence de clés API fournies, le service enregistre une référence de
 * démonstration ; les endpoints réels se branchent ici.
 */
class PaiementMobileMoneyService
{
    public const OPERATEURS = ['mvola', 'orange_money', 'airtel_money'];

    public function initierPaiement(string $operateur, string $telephone, float $montant, string $motif): array
    {
        if (! in_array($operateur, self::OPERATEURS, true)) {
            throw new \InvalidArgumentException("Opérateur Mobile Money inconnu: {$operateur}");
        }

        $reference = strtoupper($operateur).'-'.Str::upper(Str::random(10));

        // TODO: appeler l'API réelle de l'opérateur (Mvola, Orange Money, Airtel Money).
        return [
            'operateur' => $operateur,
            'telephone' => $telephone,
            'montant' => (float) $montant,
            'motif' => $motif,
            'reference' => $reference,
            'statut' => 'en_attente',
            'message' => "Paiement {$montant} Ar initié via {$operateur}.",
        ];
    }

    public function verifierStatut(string $reference): array
    {
        // TODO: interroger l'API de l'opérateur pour confirmer le paiement.
        return [
            'reference' => $reference,
            'statut' => 'confirme',
        ];
    }
}