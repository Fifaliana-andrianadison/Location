<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\EtatDesLieux;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class EtatDesLieuxController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = EtatDesLieux::query()
            ->with('location')
            ->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->whereHas('location', fn ($q) => $q->where('proprietaire_id', $user->id));
        } elseif (! $user->isAdmin()) {
            $query->whereHas('location', fn ($q) => $q->where('locataire_id', $user->id));
        }

        return response()->json($query->paginate(12));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'location_id' => 'required|exists:locations,id',
            'type' => 'required|in:entree,sortie',
            'date' => 'required|date',
            'notes' => 'nullable|string',
            'photos' => 'nullable|array',
            'photos.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ]);

        $location = \App\Models\Location::find($request->location_id);
        $user = $request->user();
        if (! $user->isAdmin() && $location->proprietaire_id !== $user->id && $location->locataire_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $photos = [];
        if ($request->hasFile('photos')) {
            foreach ($request->file('photos') as $photo) {
                $photos[] = $photo->store('etats_des_lieux', 'public');
            }
        }

        $etat = EtatDesLieux::create([
            'location_id' => $request->location_id,
            'type' => $request->type,
            'date' => $request->date,
            'notes' => $request->notes,
            'photos' => $photos ?: null,
        ]);

        return response()->json($etat->load('location'), 201);
    }

    public function signer(Request $request, EtatDesLieux $etat): JsonResponse
    {
        $request->validate(['signature' => 'required|string']);

        $user = $request->user();

        if ($etat->location?->locataire_id === $user->id) {
            $etat->update(['signature_locataire' => $request->signature]);
        } elseif ($etat->location?->proprietaire_id === $user->id || $user->isAdmin()) {
            $etat->update(['signature_proprietaire' => $request->signature]);
        } else {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json($etat->load('location'));
    }
}