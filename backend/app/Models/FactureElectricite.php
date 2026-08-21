<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FactureElectricite extends Model
{
    use HasFactory;

    protected $table = 'factures_electricite';

    protected $fillable = [
        'location_id', 'mois', 'montant', 'payee', 'reference',
    ];

    protected function casts(): array
    {
        return [
            'mois' => 'date',
            'montant' => 'float',
            'payee' => 'boolean',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}