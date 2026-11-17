<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreContratRequest;
use App\Http\Requests\SignContratRequest;
use App\Http\Requests\UpdateContratRequest;
use App\Http\Resources\ContratResource;
use App\Models\ContratBail;
use App\Models\Location;
use App\Services\ContratPdfService;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

class ContratController extends Controller
{
    public function __construct(
        private ContratPdfService $pdf,
        private NotificationService $notifications,
    ) {
    }

    public function index(Request $request): JsonResponse
    {
        $query = ContratBail::query()
            ->with(['annonce', 'proprietaire', 'locataire'])
            ->latest();

        $user = $request->user();

        if ($user->isProprietaire()) {
            $query->where('proprietaire_id', $user->id);
        } elseif (! $user->isAdmin()) {
            $query->where('locataire_id', $user->id);
        }

        if ($request->filled('statut')) {
            $query->where('statut', $request->statut);
        }

        $perPage = min(max((int) $request->input('per_page', 12), 1), 100);

        return $this->paginated($query->paginate($perPage), ContratResource::class);
    }

    public function store(StoreContratRequest $request): JsonResponse
    {
        $annonce = \App\Models\Annonce::find($request->annonce_id);

        if (! $annonce) {
            return response()->json(['message' => 'Annonce introuvable.'], 404);
        }

        $user = $request->user();

        if ($annonce->propriete->user_id !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Vous ne pouvez créer un contrat que sur vos propres biens.'], 403);
        }

        $locataire = \App\Models\User::find($request->locataire_id);
        if (! $locataire || ! $locataire->isLocataire()) {
            return response()->json(['message' => 'Le destinataire doit être un locataire.'], 422);
        }

        if ($annonce->statut === \App\Models\Annonce::STATUT_OCCUPE || $annonce->statut === \App\Models\Annonce::STATUT_VENDU) {
            return response()->json(['message' => 'Ce bien n\'est plus disponible.'], 422);
        }

        $contrat = ContratBail::create([
            'annonce_id' => $annonce->id,
            'proprietaire_id' => $annonce->propriete->user_id,
            'locataire_id' => $request->locataire_id,
            'date_debut' => $request->date_debut,
            'date_fin' => $request->date_fin,
            'loyer_mensuel' => $request->loyer_mensuel,
            'caution' => $request->caution ?? 0,
            'conditions' => $request->conditions,
            'statut' => ContratBail::STATUT_EN_ATTENTE,
        ]);

        // Génération du PDF du contrat.
        $this->regenererPdf($contrat);

        $this->notifications->envoyer(
            $contrat->locataire,
            \App\Models\Notification::TYPE_CONTRAT,
            'Contrat de bail prêt à signer',
            "Le contrat pour « {$annonce->titre} » vous attend.",
            "/contrats/{$contrat->id}"
        );

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])), 201);
    }

    public function show(Request $request, ContratBail $contrat): JsonResponse
    {
        if (! $this->canAccess($request, $contrat)) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])));
    }

    /**
     * Modification d'un contrat par le propriétaire tant qu'il n'est pas entièrement signé.
     * Toute modification annule les signatures déjà apposées : les deux parties doivent re-signer.
     */
    public function update(UpdateContratRequest $request, ContratBail $contrat): JsonResponse
    {
        $user = $request->user();

        if ($contrat->proprietaire_id !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Seul le propriétaire peut modifier ce contrat.'], 403);
        }

        if (! $contrat->estModifiable()) {
            return response()->json(['message' => 'Un contrat signé ne peut plus être modifié.'], 422);
        }

        $data = $request->validated();

        if (isset($data['locataire_id'])) {
            $locataire = \App\Models\User::find($data['locataire_id']);
            if (! $locataire || ! $locataire->isLocataire()) {
                return response()->json(['message' => 'Le destinataire doit être un locataire.'], 422);
            }
        }

        $contrat->fill($data);
        $contrat->fill([
            'signature_proprietaire' => null,
            'signature_locataire' => null,
            'statut' => ContratBail::STATUT_EN_ATTENTE,
        ]);
        $contrat->save();

        $this->regenererPdf($contrat);

        $this->notifications->envoyer(
            $contrat->locataire,
            \App\Models\Notification::TYPE_CONTRAT,
            'Contrat de bail modifié',
            "Le contrat #{$contrat->id} a été modifié. Merci de le relire et de le signer à nouveau.",
            '/mes-contrats'
        );

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])));
    }

    public function destroy(Request $request, ContratBail $contrat): JsonResponse
    {
        $user = $request->user();

        if ($contrat->proprietaire_id !== $user->id && ! $user->isAdmin()) {
            return response()->json(['message' => 'Seul le propriétaire peut supprimer ce contrat.'], 403);
        }

        if (! $contrat->estModifiable()) {
            return response()->json(['message' => 'Un contrat signé ne peut pas être supprimé.'], 422);
        }

        if ($contrat->pdf_path) {
            Storage::disk('public')->delete($contrat->pdf_path);
        }

        $contrat->delete();

        return response()->json(['message' => 'Contrat supprimé.']);
    }

    /**
     * Signature électronique (donnée en base64, conservée sous forme de trace).
     */
    public function signer(SignContratRequest $request, ContratBail $contrat): JsonResponse
    {
        $user = $request->user();

        if ($contrat->statut === ContratBail::STATUT_SIGNE) {
            return response()->json(['message' => 'Ce contrat est déjà signé.'], 422);
        }

        if ($contrat->proprietaire_id === $user->id) {
            if ($contrat->signature_proprietaire) {
                return response()->json(['message' => 'Vous avez déjà signé ce contrat.'], 422);
            }
            $contrat->update(['signature_proprietaire' => $request->signature]);
        } elseif ($contrat->locataire_id === $user->id) {
            if ($contrat->signature_locataire) {
                return response()->json(['message' => 'Vous avez déjà signé ce contrat.'], 422);
            }
            $contrat->update(['signature_locataire' => $request->signature]);
        } else {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $contrat->refresh();

        // Notifie l'autre partie que c'est à son tour de signer.
        $autre = $contrat->proprietaire_id === $user->id ? $contrat->locataire : $contrat->proprietaire;
        if ($autre && ! ($contrat->signature_proprietaire && $contrat->signature_locataire)) {
            $this->notifications->envoyer(
                $autre,
                \App\Models\Notification::TYPE_CONTRAT,
                'Contrat signé par '.$user->name,
                "{$user->name} a signé le contrat #{$contrat->id}. C'est à votre tour.",
                '/mes-contrats'
            );
        }

        if ($contrat->signature_proprietaire && $contrat->signature_locataire) {
            $contrat->update(['statut' => ContratBail::STATUT_SIGNE]);

            Location::firstOrCreate(['contrat_bail_id' => $contrat->id], [
                'contrat_bail_id' => $contrat->id,
                'appartement_id' => $contrat->annonce?->appartement_id,
                'locataire_id' => $contrat->locataire_id,
                'proprietaire_id' => $contrat->proprietaire_id,
                'date_debut' => $contrat->date_debut,
                'date_fin' => $contrat->date_fin,
                'montant_loyer' => $contrat->loyer_mensuel,
                'statut' => Location::STATUT_ACTIF,
            ]);

            $annonce = $contrat->annonce;
            if ($annonce) {
                $annonce->update(['statut' => \App\Models\Annonce::STATUT_OCCUPE]);
                $annonce->propriete?->update(['statut' => \App\Models\Propriete::STATUT_OCCUPE]);
                $annonce->appartement?->update(['statut' => \App\Models\Appartement::STATUT_OCCUPE]);
            }
        }

        // Le PDF reflète toujours l'état courant des signatures.
        $this->regenererPdf($contrat);

        return response()->json(new ContratResource($contrat->load(['annonce', 'proprietaire', 'locataire'])));
    }

    public function pdf(Request $request, ContratBail $contrat): JsonResponse
    {
        if (! $this->canAccess($request, $contrat) || ! $contrat->pdf_path) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        return response()->json([
            'url' => Storage::disk('public')->url($contrat->pdf_path),
        ]);
    }

    private function regenererPdf(ContratBail $contrat): void
    {
        $ancien = $contrat->pdf_path;
        $contrat->load(['annonce.localisation', 'proprietaire', 'locataire']);
        $contrat->update(['pdf_path' => $this->pdf->generer($contrat)]);

        if ($ancien && $ancien !== $contrat->pdf_path) {
            Storage::disk('public')->delete($ancien);
        }
    }

    private function canAccess(Request $request, ContratBail $contrat): bool
    {
        $user = $request->user();

        return $user->isAdmin()
            || $contrat->proprietaire_id === $user->id
            || $contrat->locataire_id === $user->id;
    }
}