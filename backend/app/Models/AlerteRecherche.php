<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AlerteRecherche extends Model
{
    use HasFactory;

    protected $table = 'alertes_recherche';

    protected $fillable = [
        'user_id', 'budget_min', 'budget_max', 'type', 'mode', 'ville', 'quartier', 'actif',
    ];

    protected function casts(): array
    {
        return [
            'budget_min' => 'float',
            'budget_max' => 'float',
            'actif' => 'boolean',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}