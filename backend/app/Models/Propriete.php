<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;

class Propriete extends Model
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
        'user_id', 'type', 'mode', 'statut', 'verification',
        'titre', 'description', 'prix', 'type_loyer',
    ];

    protected function casts(): array
    {
        return [
            'prix' => 'float',
        ];
    }

    public function proprietaire(): BelongsTo
    {
        return $this->belongsTo(User::class, 'user_id');
    }

    public function localisation(): HasOne
    {
        return $this->hasOne(Localisation::class);
    }

    public function images(): HasMany
    {
        return $this->hasMany(ImagePropriete::class);
    }

    public function maison(): HasOne
    {
        return $this->hasOne(Maison::class);
    }

    public function appartements(): HasMany
    {
        return $this->hasMany(Appartement::class);
    }

    public function terrain(): HasOne
    {
        return $this->hasOne(Terrain::class);
    }

    public function annonce(): HasOne
    {
        return $this->hasOne(Annonce::class);
    }

    public function historiquePrix(): HasMany
    {
        return $this->hasMany(HistoriquePrix::class);
    }

    public function imagePrincipale(): string|null
    {
        $img = $this->images()->where('is_principale', true)->first()
            ?? $this->images()->first();

        return $img?->path;
    }
}
