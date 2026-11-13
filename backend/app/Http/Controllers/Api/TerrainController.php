<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Terrain;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TerrainController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Terrain::query()
            ->with(['propriete.proprietaire', 'propriete.localisation', 'propriete.images'])
            ->latest();

        if ($request->user()?->isProprietaire()) {
            $query->whereHas('propriete', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        if (! $request->user()) {
            $query->where('statut', Terrain::STATUT_DISPONIBLE);
        }

        return response()->json($query->paginate(12));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'superficie' => 'required|numeric|min:0',
            'titre_foncier' => 'nullable|string|max:255',
        ]);

        if (! $this->ownsPropriete($request, \App\Models\Propriete::find($request->propriete_id))) {
            return $this->forbidden();
        }

        $terrain = Terrain::create($request->only([
            'propriete_id', 'superficie', 'titre_foncier',
        ]) + ['statut' => Terrain::STATUT_EN_ATTENTE]);

        $terrain->propriete->refresh();

        return response()->json($terrain->load('propriete'), 201);
    }

    public function update(Request $request, Terrain $terrain): JsonResponse
    {
        if (! $this->ownsPropriete($request, $terrain->propriete)) {
            return $this->forbidden();
        }

        $request->validate([
            'superficie' => 'nullable|numeric|min:0',
            'titre_foncier' => 'nullable|string|max:255',
            'statut' => 'sometimes|in:disponible,en_attente,vendu,indisponible',
        ]);

        $terrain->update($request->only(['superficie', 'titre_foncier', 'statut']));
        $terrain->propriete->refresh();

        return response()->json($terrain->load('propriete'));
    }

    public function destroy(Request $request, Terrain $terrain): JsonResponse
    {
        if (! $this->ownsPropriete($request, $terrain->propriete)) {
            return $this->forbidden();
        }

        $terrain->delete();

        return response()->json(['message' => 'Terrain supprimé.']);
    }
}
