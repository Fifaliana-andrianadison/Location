<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Location extends Model
{
    use HasFactory;

    public const STATUT_ACTIF = 'actif';
    public const STATUT_TERMINE = 'termine';
    public const STATUT_RESILIE = 'resilie';

    protected $fillable = [
        'contrat_bail_id', 'appartement_id', 'locataire_id', 'proprietaire_id',
        'date_debut', 'date_fin', 'montant_loyer', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'montant_loyer' => 'float',
        ];
    }

    public function contratBail(): BelongsTo
    {
        return $this->belongsTo(ContratBail::class);
    }

    public function appartement(): BelongsTo
    {
        return $this->belongsTo(Appartement::class);
    }

    public function locataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locataire_id');
    }

    public function proprietaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proprietaire_id');
    }

    public function paiements(): HasMany
    {
        return $this->hasMany(PaiementLoyer::class);
    }

    public function etatsDesLieux(): HasMany
    {
        return $this->hasMany(EtatDesLieux::class);
    }

    public function facturesElectricite(): HasMany
    {
        return $this->hasMany(FactureElectricite::class);
    }

    public function colocataires(): HasMany
    {
        return $this->hasMany(Colocataire::class);
    }

    public function messages(): HasMany
    {
        return $this->hasMany(Message::class);
    }
}