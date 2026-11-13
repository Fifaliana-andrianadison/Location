<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\ProprieteResource;
use App\Models\Propriete;
use App\Models\User;
use App\Services\NotificationService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ValidationController extends Controller
{
    public function __construct(private NotificationService $notifications)
    {
    }

    /**
     * Propriétés en attente de validation.
     */
    public function index(Request $request): JsonResponse
    {
        $query = Propriete::with(['localisation', 'images', 'proprietaire'])
            ->where('verification', Propriete::VERIF_EN_ATTENTE)
            ->latest();

        return $this->paginated($query->paginate(12), ProprieteResource::class);
    }

    /**
     * Validation / rejet d'une propriété → synchronise l'annonce (via observer).
     */
    public function valider(Request $request, Propriete $propriete): JsonResponse
    {
        if ($propriete->verification === Propriete::VERIF_VERIFIEE) {
            return response()->json(['message' => 'Ce bien est déjà validé.'], 422);
        }

        $propriete->update([
            'verification' => Propriete::VERIF_VERIFIEE,
            'statut' => Propriete::STATUT_DISPONIBLE,
        ]);

        $this->notifications->envoyer(
            $propriete->proprietaire,
            \App\Models\Notification::TYPE_SYSTEME,
            'Annonce validée',
            "Votre annonce « {$propriete->titre} » est maintenant en ligne.",
            "/mes-proprietes/{$propriete->id}"
        );

        return response()->json(new ProprieteResource($propriete->load(['localisation', 'images'])));
    }

    public function rejeter(Request $request, Propriete $propriete): JsonResponse
    {
        $request->validate(['motif' => 'nullable|string|max:500']);

        $propriete->update(['verification' => Propriete::VERIF_REJETEE]);

        $this->notifications->envoyer(
            $propriete->proprietaire,
            \App\Models\Notification::TYPE_SYSTEME,
            'Annonce rejetée',
            $request->motif ?? "Votre annonce « {$propriete->titre} » a été rejetée.",
            "/mes-proprietes/{$propriete->id}"
        );

        return response()->json(new ProprieteResource($propriete->load(['localisation', 'images'])));
    }

    /**
     * Vérification de l'identité d'un propriétaire.
     */
    public function verifierProprietaire(Request $request, User $user): JsonResponse
    {
        $request->validate(['action' => 'required|in:valider,rejeter']);

        $user->update([
            'verification_status' => $request->action === 'valider' ? 'verifiee' : 'rejetee',
            'document_verifie' => $request->action === 'valider',
        ]);

        $this->notifications->envoyer(
            $user,
            \App\Models\Notification::TYPE_SYSTEME,
            $request->action === 'valider' ? 'Identité vérifiée' : 'Identité rejetée',
            $request->action === 'valider'
                ? 'Vous pouvez maintenant publier vos annonces.'
                : 'Votre dossier de vérification a été rejeté. Contactez le support.',
            '/profil'
        );

        return response()->json($user);
    }
}