<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Annonce;
use App\Models\Candidature;
use App\Models\ContratBail;
use App\Models\Litige;
use App\Models\Location;
use App\Models\PaiementLoyer;
use App\Models\Propriete;
use App\Models\User;
use Illuminate\Http\JsonResponse;

class StatistiqueController extends Controller
{
    public function index(): JsonResponse
    {
        return response()->json([
            'utilisateurs' => [
                'total' => User::count(),
                'proprietaires' => User::where('role', User::ROLE_PROPRIETAIRE)->count(),
                'locataires' => User::where('role', User::ROLE_LOCATAIRE)->count(),
            ],
            'biens' => [
                'total' => Propriete::count(),
                'annonces_en_ligne' => Annonce::where('verification', Annonce::VERIF_VERIFIEE)->count(),
                'en_attente' => Propriete::where('verification', Propriete::VERIF_EN_ATTENTE)->count(),
                'par_type' => [
                    'maison' => Propriete::where('type', Propriete::TYPE_MAISON)->count(),
                    'appartement' => Propriete::where('type', Propriete::TYPE_APPARTEMENT)->count(),
                    'terrain' => Propriete::where('type', Propriete::TYPE_TERRAIN)->count(),
                ],
            ],
            'locations' => [
                'actives' => Location::where('statut', Location::STATUT_ACTIF)->count(),
                'terminees' => Location::where('statut', Location::STATUT_TERMINE)->count(),
            ],
            'contrats' => [
                'total' => ContratBail::count(),
                'signes' => ContratBail::where('statut', ContratBail::STATUT_SIGNE)->count(),
            ],
            'candidatures' => [
                'total' => Candidature::count(),
                'en_attente' => Candidature::where('statut', Candidature::STATUT_EN_ATTENTE)->count(),
            ],
            'paiements' => [
                'total' => PaiementLoyer::sum('montant'),
                'confirme' => PaiementLoyer::where('statut', PaiementLoyer::STATUT_CONFIRME)->sum('montant'),
                'en_attente' => PaiementLoyer::where('statut', PaiementLoyer::STATUT_EN_ATTENTE)->sum('montant'),
            ],
            'litiges' => [
                'ouverts' => Litige::whereIn('statut', [Litige::STATUT_OUVERT, Litige::STATUT_EN_COURS])->count(),
                'resolus' => Litige::where('statut', Litige::STATUT_RESOLU)->count(),
            ],
        ]);
    }

    /**
     * Statistiques de l'espace propriétaire (revenus, occupation, impayés).
     */
    public function proprietaire(): JsonResponse
    {
        $user = request()->user();
        $proprietes = $user->proprietes()->pluck('id');
        $locations = Location::where('proprietaire_id', $user->id);

        $revenus = PaiementLoyer::whereHas('location', fn ($q) => $q->where('proprietaire_id', $user->id))
            ->where('statut', PaiementLoyer::STATUT_CONFIRME)
            ->sum('montant');

        return response()->json([
            'proprietes' => [
                'total' => $proprietes->count(),
                'annonces_en_ligne' => Annonce::whereIn('propriete_id', $proprietes)
                    ->where('verification', Annonce::VERIF_VERIFIEE)->count(),
                'en_attente' => Propriete::whereIn('id', $proprietes)
                    ->where('verification', Propriete::VERIF_EN_ATTENTE)->count(),
            ],
            'locations' => [
                'actives' => (clone $locations)->where('statut', Location::STATUT_ACTIF)->count(),
                'locataires' => (clone $locations)->where('statut', Location::STATUT_ACTIF)->distinct('locataire_id')->count('locataire_id'),
            ],
            'finances' => [
                'revenus_total' => $revenus,
                'impayes' => $this->impayes($locations),
            ],
            'candidatures_en_attente' => Candidature::whereHas('annonce', fn ($q) => $q->whereIn('propriete_id', $proprietes))
                ->where('statut', Candidature::STATUT_EN_ATTENTE)
                ->count(),
        ]);
    }

    private function impayes($locations): float
    {
        $total = 0.0;

        foreach ((clone $locations)->where('statut', Location::STATUT_ACTIF)->get() as $location) {
            $moisImpayes = \Carbon\Carbon::parse($location->date_debut)->startOfMonth();
            $fin = min(now()->startOfMonth()->subMonth(), \Carbon\Carbon::parse($location->date_fin ?? now())->startOfMonth());

            while ($moisImpayes->lte($fin)) {
                $paye = PaiementLoyer::where('location_id', $location->id)
                    ->where('statut', PaiementLoyer::STATUT_CONFIRME)
                    ->where('mois', $moisImpayes->toDateString())
                    ->exists();

                if (! $paye) {
                    $total += $location->montant_loyer;
                }

                $moisImpayes->addMonth();
            }
        }

        return $total;
    }
}