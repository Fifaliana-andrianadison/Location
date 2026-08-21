<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Colocataire extends Model
{
    use HasFactory;

    protected $fillable = [
        'location_id', 'user_id', 'part_loyer', 'part_facture',
    ];

    protected function casts(): array
    {
        return [
            'part_loyer' => 'float',
            'part_facture' => 'float',
        ];
    }

    public function location(): BelongsTo
    {
        return $this->belongsTo(Location::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}