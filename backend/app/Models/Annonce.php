<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Annonce extends Model
{
    use HasFactory;

    public const TYPE_MAISON = 'maison';
    public const TYPE_APPARTEMENT = 'appartement';
    public const TYPE_TERRAIN = 'terrain';

    public const MODE_LOCATION = 'location';
    public const MODE_VENTE = 'vente';

    public const STATUT_DISPONIBLE = 'disponible';
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_OCCUPE = 'occupe';
    public const STATUT_VENDU = 'vendu';
    public const STATUT_INDISPONIBLE = 'indisponible';

    public const VERIF_EN_ATTENTE = 'en_attente';
    public const VERIF_VERIFIEE = 'verifiee';
    public const VERIF_REJETEE = 'rejetee';

    protected $fillable = [
        'propriete_id', 'appartement_id', 'type', 'mode', 'titre', 'description',
        'prix', 'type_loyer', 'nb_pieces', 'superficie', 'meuble',
        'verification', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'float',
            'superficie' => 'float',
            'meuble' => 'boolean',
            'nb_pieces' => 'integer',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function appartement(): BelongsTo
    {
        return $this->belongsTo(Appartement::class);
    }

    public function localisation(): HasOne
    {
        return $this->hasOne(Localisation::class, 'propriete_id', 'propriete_id');
    }

    public function images(): HasMany
    {
        return $this->hasMany(ImagePropriete::class, 'propriete_id', 'propriete_id');
    }

    public function candidatures(): HasMany
    {
        return $this->hasMany(Candidature::class);
    }

    public function favoris(): HasMany
    {
        return $this->hasMany(Favori::class);
    }

    public function imagePrincipale(): string|null
    {
        $img = $this->images()->where('is_principale', true)->first()
            ?? $this->images()->first();

        return $img?->path;
    }
}