<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <title>Contrat de bail CB-{{ $contrat->id }}</title>
    <style>
        @page { margin: 0; }
        body { font-family: DejaVu Sans, sans-serif; font-size: 11px; color: #1e293b; margin: 0; line-height: 1.55; }
        .bandeau { background: #0b1e3b; color: #fff; padding: 26px 42px 22px; }
        .bandeau .marque { font-size: 10px; letter-spacing: 2px; text-transform: uppercase; color: #fda4af; }
        .bandeau h1 { margin: 4px 0 2px; font-size: 24px; letter-spacing: 0.5px; }
        .bandeau .ref { font-size: 10px; color: #cbd5e1; }
        .liseré { height: 5px; background: #e4002b; }
        .contenu { padding: 24px 42px 30px; }
        .statut { float: right; margin-top: -54px; padding: 5px 12px; border-radius: 12px; font-size: 10px; font-weight: bold; }
        .statut.signe { background: #d1fae5; color: #065f46; }
        .statut.attente { background: #fef3c7; color: #92400e; }
        h2 { font-size: 12px; text-transform: uppercase; letter-spacing: 1px; color: #e4002b; margin: 20px 0 8px; padding-bottom: 4px; border-bottom: 1px solid #e5e7eb; }
        table.parties { width: 100%; border-collapse: separate; border-spacing: 8px 0; margin: 0 -8px; }
        table.parties td { width: 50%; vertical-align: top; background: #f8fafc; border: 1px solid #e5e7eb; border-radius: 6px; padding: 10px 12px; }
        .role { font-size: 9px; text-transform: uppercase; letter-spacing: 1px; color: #64748b; }
        .nom { font-size: 13px; font-weight: bold; margin: 2px 0 4px; }
        .detail { color: #475569; font-size: 10px; }
        table.termes { width: 100%; border-collapse: collapse; }
        table.termes td { padding: 7px 10px; border-bottom: 1px solid #f1f5f9; }
        table.termes td.lib { color: #64748b; width: 42%; }
        table.termes td.val { font-weight: bold; }
        .montant { color: #b00022; }
        .article { margin: 0 0 8px; text-align: justify; }
        .article strong { color: #0b1e3b; }
        .conditions { background: #fff7ed; border-left: 3px solid #f59e0b; padding: 8px 12px; white-space: pre-line; }
        table.signatures { width: 100%; border-collapse: separate; border-spacing: 10px 0; margin: 4px -10px 0; }
        table.signatures td { width: 50%; border: 1px dashed #cbd5e1; border-radius: 6px; padding: 10px; height: 110px; vertical-align: top; text-align: center; }
        table.signatures img { max-height: 70px; max-width: 220px; margin-top: 6px; }
        .non-signe { color: #94a3b8; margin-top: 28px; font-style: italic; }
        .pied { position: fixed; bottom: 0; left: 0; right: 0; padding: 10px 42px; font-size: 9px; color: #94a3b8; border-top: 1px solid #e5e7eb; }
    </style>
</head>
<body>
@php
    $signe = $contrat->signature_proprietaire && $contrat->signature_locataire;
    $ar = fn ($n) => number_format((float) $n, 0, ',', ' ').' Ar';
    $loc = $contrat->annonce?->localisation;
    $adresse = $loc ? collect([$loc->adresse ?? null, $loc->quartier ?? null, $loc->ville ?? null])->filter()->implode(', ') : null;
    $duree = ($contrat->date_debut && $contrat->date_fin) ? (int) round($contrat->date_debut->diffInMonths($contrat->date_fin)) : null;
@endphp

    <div class="bandeau">
        <div class="marque">Tany &amp; Toerana</div>
        <h1>Contrat de bail</h1>
        <div class="ref">Référence CB-{{ str_pad($contrat->id, 5, '0', STR_PAD_LEFT) }} · établi le {{ $contrat->created_at?->format('d/m/Y') }}</div>
    </div>
    <div class="liseré"></div>

    <div class="contenu">
        <div class="statut {{ $signe ? 'signe' : 'attente' }}">{{ $signe ? 'SIGNÉ PAR LES DEUX PARTIES' : 'EN ATTENTE DE SIGNATURE' }}</div>

        <h2>Entre les soussignés</h2>
        <table class="parties">
            <tr>
                <td>
                    <div class="role">Le bailleur</div>
                    <div class="nom">{{ $contrat->proprietaire?->name }}</div>
                    <div class="detail">{{ $contrat->proprietaire?->email }}</div>
                    @if($contrat->proprietaire?->telephone)<div class="detail">Tél. {{ $contrat->proprietaire->telephone }}</div>@endif
                </td>
                <td>
                    <div class="role">Le locataire</div>
                    <div class="nom">{{ $contrat->locataire?->name }}</div>
                    <div class="detail">{{ $contrat->locataire?->email }}</div>
                    @if($contrat->locataire?->telephone)<div class="detail">Tél. {{ $contrat->locataire->telephone }}</div>@endif
                </td>
            </tr>
        </table>

        <h2>Objet et conditions financières</h2>
        <table class="termes">
            <tr><td class="lib">Bien loué</td><td class="val">{{ $contrat->annonce?->titre }}</td></tr>
            @if($adresse)<tr><td class="lib">Adresse</td><td class="val">{{ $adresse }}</td></tr>@endif
            <tr><td class="lib">Prise d'effet</td><td class="val">{{ $contrat->date_debut?->format('d/m/Y') }}</td></tr>
            <tr><td class="lib">Échéance</td><td class="val">{{ $contrat->date_fin?->format('d/m/Y') }}@if($duree) ({{ $duree }} mois)@endif</td></tr>
            <tr><td class="lib">Loyer mensuel</td><td class="val montant">{{ $ar($contrat->loyer_mensuel) }}</td></tr>
            <tr><td class="lib">Dépôt de garantie (caution)</td><td class="val">{{ $ar($contrat->caution) }}</td></tr>
        </table>

        <h2>Clauses</h2>
        <p class="article"><strong>Article 1 — Objet.</strong> Le bailleur donne en location au locataire, qui accepte, le bien désigné ci-dessus, pour un usage d'habitation.</p>
        <p class="article"><strong>Article 2 — Durée.</strong> Le bail prend effet à la date indiquée et s'achève à son échéance. Il peut être renouvelé d'un commun accord entre les parties.</p>
        <p class="article"><strong>Article 3 — Loyer.</strong> Le locataire s'engage à régler le loyer chaque mois, par Mobile Money ou en espèces contre reçu, via la plateforme Tany &amp; Toerana.</p>
        <p class="article"><strong>Article 4 — Caution.</strong> La caution est restituée en fin de bail, déduction faite des éventuelles réparations constatées lors de l'état des lieux de sortie.</p>
        <p class="article"><strong>Article 5 — Obligations.</strong> Le bailleur maintient le bien en bon état d'usage ; le locataire en assure l'entretien courant et en jouit paisiblement.</p>

        @if($contrat->conditions)
            <h2>Conditions particulières</h2>
            <div class="conditions">{{ $contrat->conditions }}</div>
        @endif

        <h2>Signatures</h2>
        <table class="signatures">
            <tr>
                <td>
                    <div class="role">Le bailleur</div>
                    @if($contrat->signature_proprietaire)
                        <img src="{{ $contrat->signature_proprietaire }}" alt="Signature du bailleur">
                    @else
                        <div class="non-signe">Non signé</div>
                    @endif
                </td>
                <td>
                    <div class="role">Le locataire</div>
                    @if($contrat->signature_locataire)
                        <img src="{{ $contrat->signature_locataire }}" alt="Signature du locataire">
                    @else
                        <div class="non-signe">Non signé</div>
                    @endif
                </td>
            </tr>
        </table>
    </div>

    <div class="pied">Document généré électroniquement par Tany &amp; Toerana — CB-{{ str_pad($contrat->id, 5, '0', STR_PAD_LEFT) }} — {{ now()->format('d/m/Y H:i') }}</div>
</body>
</html>
