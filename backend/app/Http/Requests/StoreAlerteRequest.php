<?php

namespace App\Http\Requests;

use Illuminate\Foundation\Http\FormRequest;

class StoreAlerteRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user() !== null;
    }

    public function rules(): array
    {
        return [
            'budget_min' => 'nullable|numeric|min:0',
            'budget_max' => ['nullable', 'numeric', 'min:0', $this->isMethod('POST') ? 'gte:budget_min' : 'gte:0'],
            'type' => 'nullable|in:maison,appartement,terrain',
            'mode' => 'nullable|in:location,vente',
            'ville' => 'nullable|string|max:255',
            'quartier' => 'nullable|string|max:255',
            'actif' => 'nullable|boolean',
        ];
    }
}