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
     * Liste de tous les propriétaires (avec ou sans annonce) pour la vérification d'identité.
     */
    public function proprietaires(Request $request): JsonResponse
    {
        $query = User::query()
            ->where('role', User::ROLE_PROPRIETAIRE)
            ->withCount('proprietes')
            ->latest();

        if ($request->filled('statut')) {
            $query->where('verification_status', $request->statut);
        }

        if ($request->filled('q')) {
            $q = '%'.$request->q.'%';
            $query->where(fn ($w) => $w->where('name', 'like', $q)->orWhere('email', 'like', $q)->orWhere('telephone', 'like', $q));
        }

        $data = $query->get()->map(fn (User $u) => [
            'id' => $u->id,
            'name' => $u->name,
            'email' => $u->email,
            'telephone' => $u->telephone,
            'photo' => $u->photo,
            'document_path' => $u->document_path,
            'verification_status' => $u->verification_status ?? 'en_attente',
            'document_verifie' => (bool) $u->document_verifie,
            'nb_proprietes' => $u->proprietes_count,
            'created_at' => $u->created_at,
        ]);

        return response()->json(['data' => $data]);
    }

    /**
     * Vérification de l'identité d'un propriétaire.
     */
    public function verifierProprietaire(Request $request, User $user): JsonResponse
    {
        $request->validate(['action' => 'required|in:valider,rejeter']);

        if (! $user->isProprietaire()) {
            return response()->json(['message' => "Cet utilisateur n'est pas un propriétaire."], 422);
        }

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