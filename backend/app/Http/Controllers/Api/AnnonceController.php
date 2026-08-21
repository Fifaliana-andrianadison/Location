<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AnnonceResource;
use App\Models\Annonce;
use App\Services\RechercheBudgetService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AnnonceController extends Controller
{
    public function __construct(private RechercheBudgetService $recherche)
    {
    }

    /**
     * Recherche unifiée par budget sur la table pivot `annonces`.
     * GET /api/annonces?budget_min=X&budget_max=Y&type=...&mode=...&ville=...&quartier=...
     */
    public function index(Request $request): JsonResponse
    {
        $annonces = $this->recherche->search($request->only([
            'budget_min', 'budget_max', 'type', 'mode', 'ville', 'quartier', 'per_page',
        ]));

        return $this->paginated($annonces, AnnonceResource::class);
    }

    /**
     * Détail public d'une annonce vérifiée.
     */
    public function show(Request $request, Annonce $annonce): JsonResponse
    {
        if ($annonce->verification !== Annonce::VERIF_VERIFIEE
            && ! $request->user()?->isAdmin()) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        $annonce->load(['propriete.proprietaire', 'localisation', 'images', 'appartement']);

        return response()->json(new AnnonceResource($annonce));
    }
}