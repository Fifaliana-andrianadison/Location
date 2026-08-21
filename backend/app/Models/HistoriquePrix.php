<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class HistoriquePrix extends Model
{
    use HasFactory;

    protected $table = 'historique_prix';

    protected $fillable = [
        'propriete_id', 'appartement_id', 'ancien_prix', 'nouveau_prix', 'date_changement',
    ];

    protected function casts(): array
    {
        return [
            'ancien_prix' => 'float',
            'nouveau_prix' => 'float',
            'date_changement' => 'date',
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
}