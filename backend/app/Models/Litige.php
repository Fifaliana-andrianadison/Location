<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Litige extends Model
{
    use HasFactory;

    public const STATUT_OUVERT = 'ouvert';
    public const STATUT_EN_COURS = 'en_cours';
    public const STATUT_RESOLU = 'resolu';
    public const STATUT_REJETE = 'rejete';

    protected $fillable = [
        'location_id', 'auteur_id', 'motif', 'description', 'statut', 'resolution',
    ];

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function auteur(): BelongsTo
    {
        return $this->belongsTo(User::class, 'auteur_id');
    }
}