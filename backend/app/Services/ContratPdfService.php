<?php

namespace App\Services;

use App\Models\ContratBail;

class ContratPdfService
{
    public function generer(ContratBail $contrat): string
    {
        $pdf = \Barryvdh\DomPDF\Facade\Pdf::loadView('pdfs.contrat-bail', ['contrat' => $contrat]);
        $filename = 'contrat-'.$contrat->id.'-'.now()->format('YmdHis').'.pdf';
        $path = 'contrats/'.$filename;
        \Storage::disk('public')->put($path, $pdf->output());

        return $path;
    }
}