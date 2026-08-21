<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Notification;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class NotificationController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $notifications = Notification::where('user_id', $request->user()->id)
            ->latest()
            ->paginate(20);

        return $this->paginated($notifications);
    }

    public function nonLus(Request $request): JsonResponse
    {
        $count = Notification::where('user_id', $request->user()->id)
            ->where('lue', false)
            ->count();

        return response()->json(['count' => $count]);
    }

    public function marquerLue(Request $request, Notification $notification): JsonResponse
    {
        if ($notification->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Accès refusé.'], 403);
        }

        $notification->update(['lue' => true, 'lue_at' => now()]);

        return response()->json($notification);
    }

    public function toutMarquerLue(Request $request): JsonResponse
    {
        Notification::where('user_id', $request->user()->id)
            ->where('lue', false)
            ->update(['lue' => true, 'lue_at' => now()]);

        return response()->json(['message' => 'Toutes les notifications sont lues.']);
    }
}