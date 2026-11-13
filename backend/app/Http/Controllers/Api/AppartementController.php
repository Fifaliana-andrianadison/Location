<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appartement;
use App\Models\HistoriquePrix;
use App\Models\Maison;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppartementController extends Controller
{
    /**
     * Appartements d'une maison (pour un propriétaire via sa propriété).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Appartement::query()
            ->with(['propriete.proprietaire', 'propriete.localisation', 'propriete.images'])
            ->latest();

        if ($request->user()?->isProprietaire()) {
            $query->whereHas('propriete', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        if ($request->has('maison_id')) {
            $query->where('maison_id', $request->maison_id);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        if (! $request->user()) {
            $query->where('statut', Appartement::STATUT_DISPONIBLE);
        }

        return response()->json($query->paginate(12));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'maison_id' => 'nullable|exists:maisons,id',
            'nb_pieces' => 'nullable|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:1',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|numeric|min:0',
            'meuble' => 'nullable|boolean',
            'prix' => 'required|numeric|min:0',
        ]);

        if (! $this->ownsPropriete($request, \App\Models\Propriete::find($request->propriete_id))) {
            return $this->forbidden();
        }

        $appartement = Appartement::create($request->only([
            'propriete_id', 'nb_pieces', 'nb_chambres',
            'nb_salles_bain', 'superficie', 'meuble', 'prix',
        ]) + ['statut' => Appartement::STATUT_EN_ATTENTE]);

        $maisonId = $request->maison_id;
        if ($maisonId && $request->user()?->isProprietaire()) {
            $maison = Maison::find($maisonId);
            if ($maison && $maison->propriete?->user_id === $request->user()->id) {
                $appartement->update(['maison_id' => $maisonId]);
            }
        }

        // Synchronise l'annonce de la propriété parente.
        $appartement->propriete->refresh();

        return response()->json($appartement->load('propriete'), 201);
    }

    public function update(Request $request, Appartement $appartement): JsonResponse
    {
        if (! $this->ownsPropriete($request, $appartement->propriete)) {
            return $this->forbidden();
        }

        $request->validate([
            'nb_pieces' => 'nullable|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:1',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|numeric|min:0',
            'meuble' => 'nullable|boolean',
            'prix' => 'sometimes|numeric|min:0',
            'statut' => 'sometimes|in:disponible,en_attente,occupe,indisponible',
        ]);

        $ancienPrix = $appartement->prix;

        $appartement->update($request->only([
            'nb_pieces', 'nb_chambres', 'nb_salles_bain', 'superficie', 'meuble', 'prix', 'statut',
        ]));

        if ($request->has('prix') && (float) $ancienPrix !== (float) $request->prix) {
            HistoriquePrix::create([
                'appartement_id' => $appartement->id,
                'ancien_prix' => $ancienPrix,
                'nouveau_prix' => $request->prix,
                'date_changement' => now(),
            ]);
        }

        $appartement->propriete->refresh();

        return response()->json($appartement->load('propriete'));
    }

    public function destroy(Request $request, Appartement $appartement): JsonResponse
    {
        if (! $request->user()?->isAdmin() && $appartement->propriete?->user_id !== $request->user()?->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $appartement->delete();

        return response()->json(['message' => 'Appartement supprimé.']);
    }
}