<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Location;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LocationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Location::query()
            ->with(['locataire', 'proprietaire', 'appartement', 'paiements'])
            ->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->where('proprietaire_id', $user->id);
        } elseif (! $user->isAdmin()) {
            $query->where('locataire_id', $user->id);
        }

        return $this->paginated($query->paginate(12));
    }

    public function show(Request $request, Location $location): JsonResponse
    {
        if (! $this->canAccess($request, $location)) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json($location->load([
            'locataire', 'proprietaire', 'appartement', 'paiements', 'etatsDesLieux', 'facturesElectricite',
        ]));
    }

    public function update(Request $request, Location $location): JsonResponse
    {
        if (! $this->canAccess($request, $location) && ! $request->user()?->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate([
            'date_fin' => ['nullable', 'date', 'after:'.$location->date_debut->toDateString()],
            'statut' => 'sometimes|in:actif,termine,resilie',
        ]);

        $location->update($request->only(['date_fin', 'statut']));

        return response()->json($location->load(['locataire', 'proprietaire', 'paiements']));
    }

    private function canAccess(Request $request, Location $location): bool
    {
        $user = $request->user();

        return $user->isAdmin()
            || $location->proprietaire_id === $user->id
            || $location->locataire_id === $user->id;
    }
}