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
            ->filter(fn ($id) => (int) $id !== $user->id)
            ->unique()
            ->values();

        $conversations = \App\Models\User::whereIn('id', $ids)->get()->map(function ($interlocuteur) use ($user) {
            $dernier = Message::where(function ($q) use ($user, $interlocuteur) {
                $q->where('sender_id', $user->id)->where('receiver_id', $interlocuteur->id);
            })->orWhere(function ($q) use ($user, $interlocuteur) {
                $q->where('sender_id', $interlocuteur->id)->where('receiver_id', $user->id);
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
        })->sortByDesc('dernier_a')->values();

        return response()->json($conversations);
    }

    /**
     * Fils de messages avec un interlocuteur.
     */
    public function index(Request $request): JsonResponse
    {
        $user = $request->user();

        $query = Message::where(function ($q) use ($user, $request) {
            $q->where('sender_id', $user->id)->where('receiver_id', $request->with_user);
        })->orWhere(function ($q) use ($user, $request) {
            $q->where('sender_id', $request->with_user)->where('receiver_id', $user->id);
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
        $message = Message::create([
            'sender_id' => $request->user()->id,
            'receiver_id' => $request->receiver_id,
            'location_id' => $request->location_id,
            'contenu' => $request->contenu,
        ]);

        return response()->json($message->load(['sender', 'receiver']), 201);
    }
}