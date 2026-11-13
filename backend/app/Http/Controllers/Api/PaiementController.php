<?php

namespace App\Http\Controllers\Api;

use App\Events\PaiementEffectue;
use App\Http\Controllers\Controller;
use App\Http\Requests\StorePaiementRequest;
use App\Models\Location;
use App\Models\PaiementLoyer;
use App\Services\NotificationService;
use App\Services\PaiementMobileMoneyService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class PaiementController extends Controller
{
    public function __construct(
        private PaiementMobileMoneyService $mobileMoney,
        private NotificationService $notifications,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = PaiementLoyer::query()
            ->with(['location.locataire', 'location.proprietaire'])
            ->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->whereHas('location', fn ($q) => $q->where('proprietaire_id', $user->id));
        } elseif (! $user->isAdmin()) {
            $query->whereHas('location', fn ($q) => $q->where('locataire_id', $user->id));
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        return $this->paginated($query->paginate(12));
    }

    /**
     * Paiement via Mobile Money (Mvola / Orange / Airtel) ou espèces.
     */
    public function store(StorePaiementRequest $request, Location $location): JsonResponse
    {
        $methode = $request->methode;
        $reference = null;

        if (in_array($methode, PaiementMobileMoneyService::OPERATEURS, true)) {
            $resultat = $this->mobileMoney->initierPaiement(
                $methode,
                $request->telephone,
                (float) $request->montant,
                'Loyer '.$request->mois
            );
            $reference = $resultat['reference'];
        } else {
            $reference = ($methode === 'virement' ? 'VIR-' : 'ESP-').strtoupper(uniqid());
        }

        $paiement = PaiementLoyer::create([
            'location_id' => $location->id,
            'mois' => $request->mois.'-01',
            'montant' => $request->montant,
            'methode' => $methode,
            'reference' => $reference,
            'statut' => PaiementLoyer::STATUT_EN_ATTENTE,
        ]);

        PaiementEffectue::dispatch($paiement);

        if ($location->proprietaire) $this->notifications->envoyer(
            $location->proprietaire,
            \App\Models\Notification::TYPE_PAIEMENT,
            'Paiement reçu',
            "Un paiement de {$request->montant} Ar ({$request->mois}) a été enregistré par {$location->locataire?->name}.",
            '/mes-paiements'
        );

        return response()->json($paiement->load('location'), 201);
    }

    /**
     * Confirmation (admin/propriétaire) d'un paiement Mobile Money.
     */
    public function confirmer(Request $request, PaiementLoyer $paiement): JsonResponse
    {
        if (! $request->user()?->isAdmin()
            && $paiement->location?->proprietaire_id !== $request->user()?->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        if ($paiement->statut === PaiementLoyer::STATUT_CONFIRME) {
            return response()->json(['message' => 'Paiement déjà confirmé.'], 422);
        }

        $paiement->update([
            'statut' => PaiementLoyer::STATUT_CONFIRME,
            'paye_le' => now(),
        ]);

        $this->notifications->envoyer(
            $paiement->location->locataire,
            \App\Models\Notification::TYPE_PAIEMENT,
            'Paiement confirmé',
            "Votre loyer de {$paiement->mois->translatedFormat('F Y')} est confirmé.",
            '/mes-paiements'
        );

        return response()->json($paiement->load('location'));
    }

    public function destroy(Request $request, PaiementLoyer $paiement): JsonResponse
    {
        if (! $request->user()?->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $paiement->delete();

        return response()->json(['message' => 'Paiement supprimé.']);
    }
}