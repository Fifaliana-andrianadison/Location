<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Appartement extends Model
{
    use HasFactory;

    public const STATUT_DISPONIBLE = 'disponible';
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_OCCUPE = 'occupe';
    public const STATUT_INDISPONIBLE = 'indisponible';

    protected $fillable = [
        'propriete_id', 'maison_id', 'nb_pieces', 'nb_chambres', 'nb_salles_bain',
        'superficie', 'meuble', 'prix', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'nb_pieces' => 'integer',
            'nb_chambres' => 'integer',
            'nb_salles_bain' => 'integer',
            'superficie' => 'float',
            'prix' => 'float',
            'meuble' => 'boolean',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function maison(): BelongsTo
    {
        return $this->belongsTo(Maison::class);
    }

    public function annonce(): HasOne
    {
        return $this->hasOne(Annonce::class);
    }

    public function historiquePrix(): HasMany
    {
        return $this->hasMany(HistoriquePrix::class);
    }
}
