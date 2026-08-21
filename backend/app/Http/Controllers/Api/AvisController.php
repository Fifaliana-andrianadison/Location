<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAvisRequest;
use App\Models\Avis;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AvisController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Avis::query()->with(['auteur', 'cible'])->latest();

        if ($request->has('user_id')) {
            $query->where('cible_user_id', $request->user_id);
        }

        $avis = $query->paginate(12);

        return response()->json([
            'data' => $avis,
            'note_moyenne' => $request->has('user_id')
                ? round(Avis::where('cible_user_id', $request->user_id)->avg('note') ?? 0, 1)
                : null,
        ]);
    }

    public function store(StoreAvisRequest $request): JsonResponse
    {
        $avis = Avis::create([
            'auteur_id' => $request->user()->id,
            'cible_user_id' => $request->cible_user_id,
            'location_id' => $request->location_id,
            'note' => $request->note,
            'commentaire' => $request->commentaire,
        ]);

        return response()->json($avis->load(['auteur', 'cible']), 201);
    }
}