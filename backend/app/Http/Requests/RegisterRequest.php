<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class RegisterRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => 'required|string|max:255',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|string|min:8',
            'role' => 'required|in:proprietaire,locataire',
            'telephone' => 'nullable|string|max:20',
            // Photo de profil + pièce d'identité (CIN / passeport) pour la vérification du propriétaire.
            'photo' => 'nullable|image|mimes:jpeg,jpg,png,webp|max:5120',
            'document' => 'nullable|file|mimes:jpeg,jpg,png,webp,pdf|max:5120',
        ];
    }

    public function messages(): array
    {
        return [
            'photo.image' => 'La photo de profil doit être une image.',
            'photo.max' => 'La photo de profil ne doit pas dépasser 5 Mo.',
            'photo.uploaded' => "La photo n'a pas pu être envoyée (fichier trop lourd).",
            'document.mimes' => "La pièce d'identité doit être une image (JPG, PNG, WEBP) ou un PDF.",
            'document.max' => "La pièce d'identité ne doit pas dépasser 5 Mo.",
            'document.uploaded' => "La pièce d'identité n'a pas pu être envoyée (fichier trop lourd).",
            'email.unique' => 'Cet email est déjà utilisé.',
        ];
    }
}