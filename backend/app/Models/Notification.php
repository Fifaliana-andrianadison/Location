<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Notification extends Model
{
    use HasFactory;

    public const TYPE_CANDIDATURE = 'candidature';
    public const TYPE_PAIEMENT = 'paiement';
    public const TYPE_CONTRAT = 'contrat';
    public const TYPE_MESSAGE = 'message';
    public const TYPE_SYSTEME = 'systeme';
    public const TYPE_RAPPEL = 'rappel';

    protected $fillable = [
        'user_id', 'type', 'titre', 'contenu', 'lien', 'lue', 'lue_at',
    ];

    protected function casts(): array
    {
        return [
            'lue' => 'boolean',
            'lue_at' => 'datetime',
        ];
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}