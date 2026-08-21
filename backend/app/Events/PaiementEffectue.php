<?php

namespace App\Events;

use App\Models\PaiementLoyer;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class PaiementEffectue
{
    use Dispatchable, SerializesModels;

    public function __construct(public PaiementLoyer $paiement)
    {
    }
}