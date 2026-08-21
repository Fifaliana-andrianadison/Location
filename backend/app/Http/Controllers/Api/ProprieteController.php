<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreProprieteRequest;
use App\Http\Requests\UpdateProprieteRequest;
use App\Http\Resources\ProprieteResource;
use App\Models\Appartement;
use App\Models\HistoriquePrix;
use App\Models\Localisation;
use App\Models\Maison;
use App\Models\Propriete;
use App\Models\Terrain;
use App\Services\PexelsService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ProprieteController extends Controller
{
    public function __construct(private PexelsService $pexels)
    {
    }

    /**
     * Liste des propriétés (propriétaire connecté, ou toutes si admin).
     */
    public function index(Request $request): JsonResponse
    {
        $query = Propriete::query()
            ->with(['localisation', 'images', 'maison', 'appartements', 'terrain', 'proprietaire'])
            ->latest();

        if ($request->user()?->isProprietaire()) {
            $query->where('user_id', $request->user()->id);
        }

        if ($request->has('type')) {
            $query->where('type', $request->type);
        }

        if ($request->has('statut')) {
            $query->where('statut', $request->statut);
        }

        return $this->paginated($query->paginate(12), ProprieteResource::class);
    }

    public function store(StoreProprieteRequest $request): JsonResponse
    {
        $data = $request->validated();
        $userId = $request->user()->isProprietaire() ? $request->user()->id : ($data['user_id'] ?? $request->user()->id);

        $propriete = Propriete::create([
            'user_id' => $userId,
            'type' => $data['type'],
            'mode' => $data['mode'],
            'statut' => Propriete::STATUT_EN_ATTENTE,
            'verification' => Propriete::VERIF_EN_ATTENTE,
            'titre' => $data['titre'],
            'description' => $data['description'] ?? null,
            'prix' => $data['prix'],
            'type_loyer' => $data['type_loyer'] ?? null,
        ]);

        $this->storeDetails($propriete, $data);
        $this->storeLocalisation($propriete, $data);
        $this->storeImages($propriete, $request);

        if ($propriete->images()->count() === 0) {
            $this->attachPexels($propriete, $data);
        }

        return response()->json(new ProprieteResource($propriete->load(['maison', 'appartements', 'terrain', 'localisation', 'images'])), 201);
    }

    private function attachPexels(Propriete $propriete, array $data): void
    {
        $query = match ($propriete->type) {
            Propriete::TYPE_MAISON => 'house exterior',
            Propriete::TYPE_APPARTEMENT => 'apartment interior',
            Propriete::TYPE_TERRAIN => 'land plot',
            default => 'real estate',
        };

        if (! empty($data['ville'])) {
            $query .= ' ' . $data['ville'];
        }

        $photos = $this->pexels->search($query, 4);

        if (empty($photos)) {
            return;
        }

        $first = true;
        foreach ($photos as $photo) {
            $propriete->images()->create([
                'path' => $photo['url'],
                'is_principale' => $first,
                'ordre' => $propriete->images()->count(),
            ]);
            $first = false;
        }
    }

    public function show(Request $request, Propriete $propriete): JsonResponse
    {
        if (! $request->user()?->isAdmin() && $propriete->user_id !== $request->user()?->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $propriete->load(['localisation', 'images', 'maison', 'appartements', 'terrain', 'proprietaire', 'historiquePrix']);

        return response()->json(new ProprieteResource($propriete));
    }

    public function update(UpdateProprieteRequest $request, Propriete $propriete): JsonResponse
    {
        $data = $request->validated();

        $propriete->update(collect($data)->only([
            'mode', 'titre', 'description', 'prix', 'type_loyer',
        ])->toArray());

        if (collect($data)->has(['nb_etages', 'nb_chambres', 'nb_salles_bain', 'superficie', 'meuble', 'titre_foncier'])) {
            $this->storeDetails($propriete, $data);
        }

        if (collect($data)->has(['adresse', 'quartier', 'ville', 'region', 'latitude', 'longitude'])) {
            $this->storeLocalisation($propriete, $data);
        }

        if ($request->hasFile('images')) {
            $this->storeImages($propriete, $request);
        }

        $propriete->load(['localisation', 'images', 'maison', 'appartements', 'terrain']);

        return response()->json(new ProprieteResource($propriete));
    }

    public function destroy(Request $request, Propriete $propriete): JsonResponse
    {
        if (! $request->user()?->isAdmin() && $propriete->user_id !== $request->user()?->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $propriete->delete();

        return response()->json(['message' => 'Propriété supprimée.']);
    }

    public function changerPrix(Request $request, Propriete $propriete): JsonResponse
    {
        if ($propriete->user_id !== $request->user()?->id && ! $request->user()?->isAdmin()) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate(['prix' => 'required|numeric|min:0']);

        $ancienPrix = $propriete->prix;
        $propriete->update(['prix' => $request->prix]);

        HistoriquePrix::create([
            'propriete_id' => $propriete->id,
            'ancien_prix' => $ancienPrix,
            'nouveau_prix' => $request->prix,
            'date_changement' => now(),
        ]);

        return response()->json(['message' => 'Prix mis à jour.', 'prix' => $propriete->prix]);
    }

    private function storeDetails(Propriete $propriete, array $data): void
    {
        match ($propriete->type) {
            Propriete::TYPE_MAISON => Maison::updateOrCreate(
                ['propriete_id' => $propriete->id],
                [
                    'nb_etages' => $data['nb_etages'] ?? 0,
                    'nb_chambres' => $data['nb_chambres'] ?? 1,
                    'nb_salles_bain' => $data['nb_salles_bain'] ?? 1,
                    'superficie' => $data['superficie'] ?? null,
                    'meuble' => $data['meuble'] ?? false,
                ]
            ),
            Propriete::TYPE_TERRAIN => Terrain::updateOrCreate(
                ['propriete_id' => $propriete->id],
                [
                    'superficie' => $data['superficie'] ?? 0,
                    'titre_foncier' => $data['titre_foncier'] ?? null,
                ]
            ),
            Propriete::TYPE_APPARTEMENT => Appartement::updateOrCreate(
                ['propriete_id' => $propriete->id],
                [
                    'nb_pieces' => $data['nb_pieces'] ?? 1,
                    'nb_chambres' => $data['nb_chambres'] ?? 1,
                    'nb_salles_bain' => $data['nb_salles_bain'] ?? 1,
                    'superficie' => $data['superficie'] ?? null,
                    'meuble' => $data['meuble'] ?? false,
                    'prix' => $data['prix'],
                ]
            ),
            default => null,
        };
    }

    private function storeLocalisation(Propriete $propriete, array $data): void
    {
        Localisation::updateOrCreate(
            ['propriete_id' => $propriete->id],
            [
                'adresse' => $data['adresse'] ?? null,
                'quartier' => $data['quartier'] ?? null,
                'ville' => $data['ville'] ?? null,
                'region' => $data['region'] ?? null,
                'latitude' => $data['latitude'] ?? null,
                'longitude' => $data['longitude'] ?? null,
            ]
        );
    }

    private function storeImages(Propriete $propriete, Request $request): void
    {
        if (! $request->hasFile('images')) {
            return;
        }

        $first = ! $propriete->images()->exists();

        foreach ($request->file('images') as $image) {
            $path = $image->store('images_proprietes', 'public');
            $propriete->images()->create([
                'path' => $path,
                'is_principale' => $first,
                'ordre' => $propriete->images()->count(),
            ]);
            $first = false;
        }
    }
}