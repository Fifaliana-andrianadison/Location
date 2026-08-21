<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class ContratBail extends Model
{
    use HasFactory;

    protected $table = 'contrats_bail';

    public const STATUT_BROUILLON = 'brouillon';
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_SIGNE = 'signe';
    public const STATUT_ACTIF = 'actif';
    public const STATUT_TERMINE = 'termine';
    public const STATUT_RESILIE = 'resilie';

    protected $fillable = [
        'annonce_id', 'proprietaire_id', 'locataire_id',
        'date_debut', 'date_fin', 'loyer_mensuel', 'caution',
        'pdf_path', 'signature_proprietaire', 'signature_locataire', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'date_debut' => 'date',
            'date_fin' => 'date',
            'loyer_mensuel' => 'float',
            'caution' => 'float',
        ];
    }

    public function annonce(): BelongsTo
    {
        return $this->belongsTo(Annonce::class);
    }

    public function proprietaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'proprietaire_id');
    }

    public function locataire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locataire_id');
    }

    public function location(): HasOne
    {
        return $this->hasOne(Location::class);
    }
}