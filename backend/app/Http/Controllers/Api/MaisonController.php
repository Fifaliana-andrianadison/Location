<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Maison;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MaisonController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Maison::query()
            ->with(['propriete.proprietaire', 'propriete.localisation', 'appartements'])
            ->latest();

        if ($request->user()?->isProprietaire()) {
            $query->whereHas('propriete', fn ($q) => $q->where('user_id', $request->user()->id));
        }

        return response()->json($query->paginate(12));
    }

    public function store(Request $request): JsonResponse
    {
        $request->validate([
            'propriete_id' => 'required|exists:proprietes,id',
            'nb_etages' => 'nullable|integer|min:0',
            'nb_chambres' => 'nullable|integer|min:1',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|numeric|min:0',
            'meuble' => 'nullable|boolean',
        ]);

        $maison = Maison::create($request->only([
            'propriete_id', 'nb_etages', 'nb_chambres', 'nb_salles_bain', 'superficie', 'meuble',
        ]));

        $maison->propriete->refresh();

        return response()->json($maison->load('propriete'), 201);
    }

    public function show(Request $request, Maison $maison): JsonResponse
    {
        return response()->json($maison->load([
            'propriete.proprietaire', 'propriete.localisation', 'propriete.images', 'appartements',
        ]));
    }

    public function update(Request $request, Maison $maison): JsonResponse
    {
        $request->validate([
            'nb_etages' => 'nullable|integer|min:0',
            'nb_chambres' => 'nullable|integer|min:1',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|numeric|min:0',
            'meuble' => 'nullable|boolean',
        ]);

        $maison->update($request->only([
            'nb_etages', 'nb_chambres', 'nb_salles_bain', 'superficie', 'meuble',
        ]));

        $maison->propriete->refresh();

        return response()->json($maison->load('propriete'));
    }
}