<?php

namespace App\Http\Controllers\Api;

use App\Events\CandidatureRecue;
use App\Http\Controllers\Controller;
use App\Http\Requests\StoreCandidatureRequest;
use App\Http\Requests\UpdateCandidatureRequest;
use App\Http\Resources\CandidatureResource;
use App\Models\Candidature;
use App\Models\DocumentLocataire;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class CandidatureController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = Candidature::query()
            ->with(['annonce.propriete', 'locataire', 'documents'])
            ->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->whereHas('annonce', fn ($q) => $q->whereHas('propriete', fn ($p) => $p->where('user_id', $user->id)));
        } elseif ($user->isAdmin()) {
            // toutes
        } else {
            $query->where('locataire_id', $user->id);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        return $this->paginated($query->paginate(min(max((int) $request->input('per_page', 12), 1), 100)), CandidatureResource::class);
    }

    /**
     * Création d'une candidature (locataire) + upload documents.
     */
    public function store(StoreCandidatureRequest $request): JsonResponse
    {
        if (! $request->user()->isLocataire()) {
            return response()->json(['message' => 'Seuls les locataires peuvent postuler.'], 403);
        }

        $existant = Candidature::where('annonce_id', $request->annonce_id)
            ->where('locataire_id', $request->user()->id)
            ->first();

        if ($existant) {
            return response()->json([
                'message' => 'Vous avez déjà postulé pour cette annonce.',
                'candidature' => new CandidatureResource($existant->load(['annonce', 'locataire', 'documents'])),
            ], 200);
        }

        $candidature = Candidature::create([
            'annonce_id' => $request->annonce_id,
            'locataire_id' => $request->user()->id,
            'message' => $request->message,
            'budget' => $request->budget,
            'statut' => Candidature::STATUT_EN_ATTENTE,
        ]);

        if ($request->has('documents')) {
            foreach ($request->file('documents', []) as $doc) {
                $path = $doc->store('documents', 'public');
                DocumentLocataire::create([
                    'user_id' => $request->user()->id,
                    'candidature_id' => $candidature->id,
                    'type' => strtolower($doc->getClientOriginalExtension()) ?: 'autre',
                    'path' => $path,
                ]);
            }
        }

        CandidatureRecue::dispatch($candidature);

        return response()->json(new CandidatureResource($candidature->load(['annonce', 'locataire', 'documents'])), 201);
    }

    public function show(Request $request, Candidature $candidature): JsonResponse
    {
        if (! $this->canView($request, $candidature)) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $candidature->load(['annonce.propriete.proprietaire', 'locataire', 'documents']);

        return response()->json(new CandidatureResource($candidature));
    }

    public function update(UpdateCandidatureRequest $request, Candidature $candidature): JsonResponse
    {
        $candidature->update($request->only(['message', 'budget', 'statut']));

        return response()->json(new CandidatureResource($candidature->load(['annonce', 'locataire', 'documents'])));
    }

    public function destroy(Request $request, Candidature $candidature): JsonResponse
    {
        if (! $request->user()->isAdmin() && $candidature->locataire_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $candidature->delete();

        return response()->json(['message' => 'Candidature supprimée.']);
    }

    private function canView(Request $request, Candidature $candidature): bool
    {
        $user = $request->user();

        if ($user->isAdmin() || $candidature->locataire_id === $user->id) {
            return true;
        }

        return $user->isProprietaire()
            && $candidature->annonce?->propriete?->user_id === $user->id;
    }
}