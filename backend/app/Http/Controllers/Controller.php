<?php

namespace App\Http\Controllers;

use Illuminate\Contracts\Pagination\LengthAwarePaginator;
use Illuminate\Foundation\Auth\Access\AuthorizesRequests;
use Illuminate\Http\JsonResponse;

abstract class Controller
{
    use AuthorizesRequests;

    /**
     * L'utilisateur est-il admin ou propriétaire de ce bien ?
     */
    protected function ownsPropriete(\Illuminate\Http\Request $request, ?\App\Models\Propriete $propriete): bool
    {
        $user = $request->user();

        return $user && $propriete && ($user->isAdmin() || $propriete->user_id === $user->id);
    }

    protected function forbidden(): JsonResponse
    {
        return response()->json(['message' => 'Accès refusé.'], 403);
    }

    protected function paginated(LengthAwarePaginator $paginator, ?string $resource = null): JsonResponse
    {
        return response()->json([
            'data' => $resource ? $resource::collection($paginator->items()) : $paginator->items(),
            'meta' => [
                'current_page' => $paginator->currentPage(),
                'last_page' => $paginator->lastPage(),
                'total' => $paginator->total(),
                'per_page' => $paginator->perPage(),
            ],
        ]);
    }
}