<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifiedOwnerOnly
{
    public function handle(Request $request, Closure $next): Response
    {
        $user = $request->user();

        if (! $user || ! $user->isProprietaire()) {
            return response()->json(['message' => 'Réservé aux propriétaires.'], 403);
        }

        if (! $user->isVerified()) {
            return response()->json([
                'message' => 'Votre identité doit être vérifiée avant de publier une annonce.',
                'verification_status' => $user->verification_status,
            ], 403);
        }

        return $next($request);
    }
}