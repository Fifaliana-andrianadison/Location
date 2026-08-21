<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CandidatureResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'annonce_id' => $this->annonce_id,
            'annonce' => new AnnonceResource($this->whenLoaded('annonce')),
            'locataire' => $this->whenLoaded('locataire', fn () => [
                'id' => $this->locataire->id,
                'name' => $this->locataire->name,
                'email' => $this->locataire->email,
                'telephone' => $this->locataire->telephone,
            ]),
            'message' => $this->message,
            'budget' => $this->budget ? (float) $this->budget : null,
            'statut' => $this->statut,
            'documents' => $this->whenLoaded('documents', fn () => $this->documents->map(fn ($d) => [
                'id' => $d->id,
                'type' => $d->type,
                'path' => $d->path,
            ])),
            'created_at' => $this->created_at,
        ];
    }
}