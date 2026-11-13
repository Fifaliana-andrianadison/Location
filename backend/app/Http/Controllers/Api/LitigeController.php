<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreLitigeRequest;
use App\Models\Litige;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class LitigeController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Litige::query()->with(['auteur', 'location'])->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->where(function ($q) use ($user) {
                $q->where('auteur_id', $user->id)
                    ->orWhereHas('location', fn ($l) => $l->where('proprietaire_id', $user->id));
            });
        } elseif (! $user->isAdmin()) {
            $query->where('auteur_id', $user->id);
        }

        return $this->paginated($query->paginate(12));
    }

    public function store(StoreLitigeRequest $request): JsonResponse
    {
        if ($request->location_id) {
            $location = \App\Models\Location::find($request->location_id);
            $user = $request->user();
            if (! $user->isAdmin() && $location->proprietaire_id !== $user->id && $location->locataire_id !== $user->id) {
                return response()->json(['message' => 'Accès refusé.'], 403);
            }
        }

        $litige = Litige::create([
            'location_id' => $request->location_id,
            'auteur_id' => $request->user()->id,
            'motif' => $request->motif,
            'description' => $request->description,
            'statut' => Litige::STATUT_OUVERT,
        ]);

        return response()->json($litige->load(['auteur', 'location']), 201);
    }

    public function show(Request $request, Litige $litige): JsonResponse
    {
        $user = $request->user();
        if (! $user?->isAdmin() && $litige->auteur_id !== $user?->id
            && $litige->location?->proprietaire_id !== $user?->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json($litige->load(['auteur', 'location']));
    }
}