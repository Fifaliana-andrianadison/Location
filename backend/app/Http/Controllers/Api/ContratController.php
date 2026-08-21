<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContratRequest;
use App\Http\Requests\SignContratRequest;
use App\Http\Resources\ContratResource;
use App\Models\ContratBail;
use App\Models\Location;
use App\Services\ContratPdfService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContratController extends Controller
{
    public function __construct(
        private ContratPdfService $pdf,
        private NotificationService $notifications,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ContratBail::query()
            ->with(['annonce', 'proprietaire', 'locataire'])
            ->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->where('proprietaire_id', $user->id);
        } elseif (! $user->isAdmin()) {
            $query->where('locataire_id', $user->id);
        }

        return $this->paginated($query->paginate(12), ContratResource::class);
    }

    public function store(StoreContratRequest $request): JsonResponse
    {
        $annonce = \App\Models\Annonce::find($request->annonce_id);

        if (! $annonce) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        $user = $request->user();

        if ($annonce->propriete->user_id !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Vous ne pouvez créer un contrat que sur vos propres biens.'], 403);
        }

        $contrat = ContratBail::create([
            'annonce_id' => $annonce->id,
            'proprietaire_id' => $annonce->propriete->user_id,
            'locataire_id' => $request->locataire_id,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'loyer_mensuel' => $request->loyer_mensuel,
            'caution' => $request->caution ?? 0,
            'statut' => ContratBail::STATUT_EN_ATTENTE,
        ]);

        // Génération du PDF du contrat.
        $contrat->update(['pdf_path' => $this->pdf->generer($contrat)]);

        $this->notifications->envoyer(
            $contrat->locataire,
            \App\Models\Notification::TYPE_CONTRAT,
            'Contrat de bail prêt à signer',
            "Le contrat pour « {$annonce->titre} » vous attend.",
            "/contrats/{$contrat->id}"
        );

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])), 201);
    }

    public function show(Request $request, ContratBail $contrat): JsonResponse
    {
        if (! $this->canAccess($request, $contrat)) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])));
    }

    /**
     * Signature électronique (donnée en base64, conservée sous forme de trace).
     */
    public function signer(SignContratRequest $request, ContratBail $contrat): JsonResponse
    {
        $user = $request->user();

        if ($contrat->proprietaire_id === $user->id) {
            $contrat->update(['signature_proprietaire' => $request->signature]);
        } elseif ($contrat->locataire_id === $user->id) {
            $contrat->update(['signature_locataire' => $request->signature]);
        } else {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $contrat->refresh();

        if ($contrat->signature_proprietaire && $contrat->signature_locataire) {
            $contrat->update(['statut' => ContratBail::STATUT_SIGNE]);

            Location::create([
                'contrat_bail_id' => $contrat->id,
                'appartement_id' => $contrat->annonce?->appartement_id,
                'locataire_id' => $contrat->locataire_id,
                'proprietaire_id' => $contrat->proprietaire_id,
                'date_debut' => $contrat->date_debut,
                'date_fin' => $contrat->date_fin,
                'montant_loyer' => $contrat->loyer_mensuel,
                'statut' => Location::STATUT_ACTIF,
            ]);

            $annonce = $contrat->annonce;
            if ($annonce) {
                $annonce->update(['statut' => \App\Models\Annonce::STATUT_OCCUPE]);
                $annonce->propriete?->update(['statut' => \App\Models\Propriete::STATUT_OCCUPE]);
                $annonce->appartement?->update(['statut' => \App\Models\Appartement::STATUT_OCCUPE]);
            }
        }

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])));
    }

    public function pdf(Request $request, ContratBail $contrat): JsonResponse
    {
        if (! $this->canAccess($request, $contrat) || ! $contrat->pdf_path) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json([
            'url' => Storage::disk('public')->url($contrat->pdf_path),
        ]);
    }

    private function canAccess(Request $request, ContratBail $contrat): bool
    {
        $user = $request->user();

        return $user->isAdmin()
            || $contrat->proprietaire_id === $user->id
            || $contrat->locataire_id === $user->id;
    }
}