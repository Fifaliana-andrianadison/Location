<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Requests\StoreMessageRequest;
use App\Models\Message;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class MessageController extends Controller
{
    /**
     * Conversations de l'utilisateur connecté (avec dernier message par interlocuteur).
     */
    public function conversations(Request $request): JsonResponse
    {
        $user = $request->user();

        $ids = Message::where('sender_id', $user->id)
            ->orWhere('receiver_id', $user->id)
            ->pluck('sender_id')
            ->merge(Message::where('sender_id', $user->id)
                ->orWhere('receiver_id', $user->id)
                ->pluck('receiver_id'))
            ->filter(fn ($id) => (int) $id !== $user->id);

        // Contacts par défaut : interlocuteurs liés par une location, un contrat ou une candidature.
        if ($user->isAdmin()) {
            $ids = $ids->merge(\App\Models\User::where('role', \App\Models\User::ROLE_PROPRIETAIRE)->pluck('id'));
        } else {
            $ids = $ids->merge(\App\Models\User::where('role', \App\Models\User::ROLE_ADMIN)->pluck('id'));
            $ids = $ids->merge($user->locationsAsLocataire()->pluck('proprietaire_id'))
                ->merge($user->locationsAsProprietaire()->pluck('locataire_id'))
                ->merge($user->contrats()->pluck('proprietaire_id'))
                ->merge($user->contratsProprietaire()->pluck('locataire_id'));
            if ($user->isProprietaire()) {
                $ids = $ids->merge(\App\Models\Candidature::whereHas('annonce.propriete', fn ($q) => $q->where('user_id', $user->id))->pluck('locataire_id'));
            } else {
                $ids = $ids->merge(\App\Models\Propriete::whereHas('annonce.candidatures', fn ($q) => $q->where('locataire_id', $user->id))->pluck('user_id'));
            }
        }

        // Interlocuteur explicitement demandé (ex. depuis une annonce).
        if ($request->filled('with_user')) {
            $ids->push((int) $request->with_user);
        }

        $ids = $ids->filter(fn ($id) => (int) $id !== $user->id)
            ->unique()
            ->values();

        $conversations = \App\Models\User::whereIn('id', $ids)->get()->map(function ($interlocuteur) use ($user) {
            $dernier = Message::where(function ($outer) use ($user, $interlocuteur) {
                $outer->where(function ($q) use ($user, $interlocuteur) {
                    $q->where('sender_id', $user->id)->where('receiver_id', $interlocuteur->id);
                })->orWhere(function ($q) use ($user, $interlocuteur) {
                    $q->where('sender_id', $interlocuteur->id)->where('receiver_id', $user->id);
                });
            })->latest()->first();

            $nonLus = Message::where('sender_id', $interlocuteur->id)
                ->where('receiver_id', $user->id)
                ->where('lu', false)
                ->count();

            return [
                'user' => ['id' => $interlocuteur->id, 'name' => $interlocuteur->name, 'photo' => $interlocuteur->photo],
                'dernier_message' => $dernier?->contenu,
                'dernier_a' => $dernier?->created_at,
                'non_lus' => $nonLus,
            ];
        })->sortByDesc(fn ($c) => $c['dernier_a']?->timestamp ?? 0)->values();

        return response()->json($conversations);
    }

    /**
     * Fils de messages avec un interlocuteur.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $request->validate(['with_user' => 'required|integer|exists:users,id']);

        $query = Message::where(function ($outer) use ($user, $request) {
            $outer->where(function ($q) use ($user, $request) {
                $q->where('sender_id', $user->id)->where('receiver_id', $request->with_user);
            })->orWhere(function ($q) use ($user, $request) {
                $q->where('sender_id', $request->with_user)->where('receiver_id', $user->id);
            });
        });

        if ($request->has('location_id')) {
            $query->where('location_id', $request->location_id);
        }

        $messages = $query->with(['sender', 'receiver'])->orderBy('created_at')->paginate(50);

        Message::where('receiver_id', $user->id)
            ->where('sender_id', $request->with_user)
            ->where('lu', false)
            ->update(['lu' => true, 'lu_at' => now()]);

        return $this->paginated($messages);
    }

    public function store(StoreMessageRequest $request): JsonResponse
    {
        $attachmentPath = null;
        if ($request->hasFile('attachment')) {
            $attachmentPath = $request->file('attachment')->store('messages', 'public');
        }

        $contenu = $request->contenu;
        if ($contenu === null && $attachmentPath === null) {
            return response()->json(['message' => 'Message ou fichier requis.'], 422);
        }

        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'location_id' => $request->location_id,
            'contenu' => $contenu ?? '',
            'attachment' => $attachmentPath,
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }

    public function react(Request $request, Message $message): JsonResponse
    {
        $user = $request->user();
        if ($message->sender_id !== $user->id && $message->receiver_id !== $user->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $request->validate(['emoji' => 'required|string|max:8']);
        $emoji = $request->emoji;
        $reactions = $message->reactions ?? [];

        // toggle reaction for this user
        $found = false;
        foreach ($reactions as $i => $r) {
            if (($r['user_id'] ?? null) === $user->id && ($r['emoji'] ?? null) === $emoji) {
                unset($reactions[$i]);
                $found = true;
                break;
            }
        }
        if (! $found) {
            $reactions[] = ['user_id' => $user->id, 'emoji' => $emoji];
        }
        $message->update(['reactions' => array_values($reactions)]);

        return response()->json($message->load(['sender', 'receiver']));
    }
}