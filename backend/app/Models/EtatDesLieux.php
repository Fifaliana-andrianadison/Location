<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class EtatDesLieux extends Model
{
    use HasFactory;

    protected $table = 'etats_des_lieux';

    public const TYPE_ENTREE = 'entree';
    public const TYPE_SORTIE = 'sortie';

    protected $fillable = [
        'location_id', 'type', 'date', 'notes', 'photos',
        'signature_locataire', 'signature_proprietaire',
    ];

    protected function casts(): array
    {
        return [
            'date' => 'date',
            'photos' => 'array',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}