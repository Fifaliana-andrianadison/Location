<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AnnonceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'mode' => $this->mode,
            'titre' => $this->titre,
            'description' => $this->description,
            'prix' => (float) $this->prix,
            'type_loyer' => $this->type_loyer,
            'nb_pieces' => $this->nb_pieces,
            'superficie' => $this->superficie ? (float) $this->superficie : null,
            'meuble' => $this->meuble,
            'verification' => $this->verification,
            'statut' => $this->statut,
            'created_at' => $this->created_at,
            'localisation' => new LocalisationResource($this->whenLoaded('localisation')),
            'image_principale' => $this->imagePrincipale(),
            'images' => $this->whenLoaded('images', fn () => $this->images->pluck('path')),
            'proprietaire' => $this->whenLoaded('propriete', fn () => [
                'id' => $this->propriete?->proprietaire?->id,
                'name' => $this->propriete?->proprietaire?->name,
                'telephone' => $this->propriete?->proprietaire?->telephone,
            ]),
        ];
    }
}