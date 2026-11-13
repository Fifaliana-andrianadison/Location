<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreAlerteRequest;
use App\Models\AlerteRecherche;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AlerteRechercheController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        return response()->json(
            AlerteRecherche::where('user_id', $request->user()->id)->latest()->get()
        );
    }

    public function store(StoreAlerteRequest $request): JsonResponse
    {
        $alerte = AlerteRecherche::create(
            $request->validated() + ['user_id' => $request->user()->id]
        );

        return response()->json($alerte, 201);
    }

    public function update(StoreAlerteRequest $request, AlerteRecherche $alerte): JsonResponse
    {
        if ($alerte->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $alerte->update($request->validated());

        return response()->json($alerte);
    }

    public function destroy(Request $request, AlerteRecherche $alerte): JsonResponse
    {
        if ($alerte->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $alerte->delete();

        return response()->json(['message' => 'Alerte supprimée.']);
    }
}