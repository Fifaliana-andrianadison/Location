<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class PaiementLoyer extends Model
{
    use HasFactory;

    protected $table = 'paiements_loyer';

    public const METHODE_MVOLA = 'mvola';
    public const METHODE_ORANGE_MONEY = 'orange_money';
    public const METHODE_AIRTEL_MONEY = 'airtel_money';
    public const METHODE_ESPECES = 'especes';
    public const METHODE_VIREMENT = 'virement';

    public const STATUT_EN_ATTENTE = 'en_attente';
    public const STATUT_CONFIRME = 'confirme';
    public const STATUT_REJETE = 'rejete';

    protected $fillable = [
        'location_id', 'mois', 'montant', 'methode', 'reference',
        'statut', 'recu_path', 'paye_le',
    ];

    protected function casts(): array
    {
        return [
            'mois' => 'date',
            'montant' => 'float',
            'paye_le' => 'datetime',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }
}