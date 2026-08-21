<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreProprieteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()?->isProprietaire() || $this->user()?->isAdmin();
    }

    public function rules(): array
    {
        return [
            'type' => 'required|in:maison,appartement,terrain',
            'mode' => 'required|in:location,vente',
            'titre' => 'required|string|max:255',
            'description' => 'nullable|string',
            'prix' => 'required|numeric|min:0',
            'type_loyer' => 'nullable|in:mensuel,journalier,annuel',
            'adresse' => 'nullable|string|max:255',
            'quartier' => 'nullable|string|max:255',
            'ville' => 'nullable|string|max:255',
            'region' => 'nullable|string|max:255',
            'latitude' => 'nullable|numeric|between:-90,90',
            'longitude' => 'nullable|numeric|between:-180,180',
            'nb_etages' => 'nullable|integer|min:0',
            'nb_pieces' => 'nullable|integer|min:1',
            'nb_chambres' => 'nullable|integer|min:1',
            'nb_salles_bain' => 'nullable|integer|min:0',
            'superficie' => 'nullable|numeric|min:0',
            'meuble' => 'nullable|boolean',
            'titre_foncier' => 'nullable|string|max:255',
            'images' => 'nullable|array',
            'images.*' => 'image|mimes:jpeg,png,jpg,webp|max:5120',
        ];
    }
}