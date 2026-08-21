<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Maison extends Model
{
    use HasFactory;

    protected $fillable = [
        'propriete_id', 'nb_etages', 'nb_chambres', 'nb_salles_bain', 'superficie', 'meuble',
    ];

    protected function casts(): array
    {
        return [
            'nb_etages' => 'integer',
            'nb_chambres' => 'integer',
            'nb_salles_bain' => 'integer',
            'superficie' => 'float',
            'meuble' => 'boolean',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }

    public function appartements(): HasMany
    {
        return $this->hasMany(Appartement::class);
    }
}
