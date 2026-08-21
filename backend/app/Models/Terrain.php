<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Terrain extends Model
{
    use HasFactory;

    public const STATUT_DISPONIBLE = 'disponible';
    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_VENDU = 'vendu';
    public const STATUT_INDISPONIBLE = 'indisponible';

    protected $fillable = [
        'propriete_id', 'superficie', 'titre_foncier', 'statut',
    ];

    protected function casts(): array
    {
        return [
            'superficie' => 'float',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }
}
