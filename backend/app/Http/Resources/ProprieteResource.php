<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ProprieteResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'type' => $this->type,
            'mode' => $this->mode,
            'statut' => $this->statut,
            'verification' => $this->verification,
            'titre' => $this->titre,
            'description' => $this->description,
            'prix' => (float) $this->prix,
            'type_loyer' => $this->type_loyer,
            'localisation' => new LocalisationResource($this->whenLoaded('localisation')),
            'images' => $this->whenLoaded('images', fn () => $this->images->map(fn ($i) => [
                'id' => $i->id,
                'path' => $i->path,
                'is_principale' => $i->is_principale,
            ])),
            'maison' => $this->whenLoaded('maison'),
            'appartements' => $this->whenLoaded('appartements'),
            'terrain' => $this->whenLoaded('terrain'),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}