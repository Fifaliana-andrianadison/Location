<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ContratResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'annonce_id' => $this->annonce_id,
            'annonce' => $this->whenLoaded('annonce', fn () => [
                'id' => $this->annonce->id,
                'titre' => $this->annonce->titre,
                'prix' => (float) $this->annonce->prix,
                'type' => $this->annonce->type,
                'mode' => $this->annonce->mode,
            ]),
            'proprietaire' => $this->whenLoaded('proprietaire', fn () => [
                'id' => $this->proprietaire->id,
                'name' => $this->proprietaire->name,
                'email' => $this->proprietaire->email,
                'telephone' => $this->proprietaire->telephone,
            ]),
            'locataire' => $this->whenLoaded('locataire', fn () => [
                'id' => $this->locataire->id,
                'name' => $this->locataire->name,
                'email' => $this->locataire->email,
                'telephone' => $this->locataire->telephone,
            ]),
            'date_debut' => $this->date_debut,
            'date_fin' => $this->date_fin,
            'loyer_mensuel' => (float) $this->loyer_mensuel,
            'caution' => (float) $this->caution,
            'pdf_path' => $this->pdf_path,
            'statut' => $this->statut,
            'conditions' => $this->conditions,
            'modifiable' => $this->estModifiable(),
            'signe_proprietaire' => ! empty($this->signature_proprietaire),
            'signe_locataire' => ! empty($this->signature_locataire),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}