<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ImagePropriete extends Model
{
    use HasFactory;

    protected $table = 'images_proprietes';

    protected $fillable = [
        'propriete_id', 'path', 'is_principale', 'ordre',
    ];

    protected function casts(): array
    {
        return [
            'is_principale' => 'boolean',
            'ordre' => 'integer',
        ];
    }

    public function propriete(): BelongsTo
    {
        return $this->belongsTo(Propriete::class);
    }
}