<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\FavoriResource;
use App\Models\Favori;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class FavoriController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $favoris = Favori::where('user_id', $request->user()->id)
            ->with(['annonce.propriete.proprietaire', 'annonce.localisation', 'annonce.images'])
            ->latest()
            ->paginate(12);

        return $this->paginated($favoris, FavoriResource::class);
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate(['annonce_id' => 'required|exists:annonces,id']);

        $favori = Favori::firstOrCreate([
            'user_id' => $request->user()->id,
            'annonce_id' => $request->annonce_id,
        ]);

        return response()->json($favori->load('annonce'), 201);
    }

    public function destroy(Request $request, int $annonce_id): JsonResponse
    {
        Favori::where('user_id', $request->user()->id)
            ->where('annonce_id', $annonce_id)
            ->delete();

        return response()->json(['message' => 'Retiré des favoris.']);
    }

    public function isFavori(Request $request, int $annonce_id): JsonResponse
    {
        $exists = Favori::where('user_id', $request->user()->id)
            ->where('annonce_id', $annonce_id)
            ->exists();

        return response()->json(['favori' => $exists]);
    }
}