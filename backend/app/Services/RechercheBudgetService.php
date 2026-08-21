<?php

namespace App\Services;

use App\Models\Annonce;

/**
 * Recherche unifiée par budget sur la table pivot `annonces`.
 */
class RechercheBudgetService
{
    public function search(array $filters): \Illuminate\Contracts\Pagination\LengthAwarePaginator
    {
        $query = Annonce::query()
            ->with(['propriete.proprietaire', 'localisation', 'images'])
            ->where('verification', Annonce::VERIF_VERIFIEE)
            ->whereNotIn('statut', [Annonce::STATUT_INDISPONIBLE, Annonce::STATUT_VENDU]);

        $budgetMin = $filters['budget_min'] ?? null;
        $budgetMax = $filters['budget_max'] ?? null;

        if ($budgetMin && $budgetMax && $budgetMin > $budgetMax) {
            [$budgetMin, $budgetMax] = [$budgetMax, $budgetMin];
        }

        if ($budgetMin !== null && $budgetMin !== '') {
            $query->where('prix', '>=', (float) $budgetMin);
        }

        if ($budgetMax !== null && $budgetMax !== '') {
            $query->where('prix', '<=', (float) $budgetMax);
        }

        if (! empty($filters['type'])) {
            $query->where('type', $filters['type']);
        }

        if (! empty($filters['mode'])) {
            $query->where('mode', $filters['mode']);
        }

        if (! empty($filters['ville'])) {
            $query->whereHas('localisation', fn ($q) => $q->where('ville', 'like', "%{$filters['ville']}%"));
        }

        if (! empty($filters['quartier'])) {
            $query->whereHas('localisation', fn ($q) => $q->where('quartier', 'like', "%{$filters['quartier']}%"));
        }

        $query->latest('annonces.created_at');

        return $query->paginate($filters['per_page'] ?? 12)->withQueryString();
    }
}