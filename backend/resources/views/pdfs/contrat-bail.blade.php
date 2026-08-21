<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="utf-8">
    <style>
        body { font-family: DejaVu Sans, sans-serif; font-size: 13px; color: #1f2937; }
        h1 { text-align: center; font-size: 20px; margin-bottom: 4px; }
        h2 { font-size: 15px; border-bottom: 1px solid #ccc; padding-bottom: 4px; }
        .sous-titre { text-align: center; color: #6b7280; margin-bottom: 24px; }
        .section { margin-bottom: 20px; }
        table { width: 100%; border-collapse: collapse; }
        td, th { border: 1px solid #d1d5db; padding: 6px 8px; text-align: left; }
        .signatures { margin-top: 40px; }
        .signature { width: 45%; display: inline-block; vertical-align: top; }
        .signature img { max-height: 80px; }
    </style>
</head>
<body>
    <h1>Contrat de Bail</h1>
    <p class="sous-titre">Tany &amp; Toerana — Réf. CB-{{ $contrat->id }}</p>

    <div class="section">
        <h2>Parties</h2>
        <table>
            <tr><td><strong>Bailleur :</strong></td><td>{{ $contrat->proprietaire?->name }}</td></tr>
            <tr><td><strong>Locataire :</strong></td><td>{{ $contrat->locataire?->name }}</td></tr>
            <tr><td><strong>Bien :</strong></td><td>{{ $contrat->annonce?->titre }}</td></tr>
        </table>
    </div>

    <div class="section">
        <h2>Conditions</h2>
        <table>
            <tr><td><strong>Début du bail :</strong></td><td>{{ $contrat->date_debut?->format('d/m/Y') }}</td></tr>
            <tr><td><strong>Fin du bail :</strong></td><td>{{ $contrat->date_fin?->format('d/m/Y') }}</td></tr>
            <tr><td><strong>Loyer mensuel :</strong></td><td>{{ number_format($contrat->loyer_mensuel, 0, ',', ' ') }} Ar</td></tr>
            <tr><td><strong>Caution :</strong></td><td>{{ number_format($contrat->caution, 0, ',', ' ') }} Ar</td></tr>
        </table>
    </div>

    <p>Le présent contrat est conclu entre les parties ci-dessus. Le locataire s'engage à payer le loyer
    mensuellement, et le bailleur s'engage à maintenir le bien en bon état pendant toute la durée du bail.
    Les états des lieux d'entrée et de sortie font foi pour la restitution de la caution.</p>

    <div class="signatures">
        <h2>Signatures</h2>
        <div class="signature">
            <p><strong>Le Bailleur</strong></p>
            @if($contrat->signature_proprietaire)
                <img src="{{ $contrat->signature_proprietaire }}" alt="Signature bailleur">
            @else
                <p style="color:#9ca3af">Non signé</p>
            @endif
        </div>
        <div class="signature">
            <p><strong>Le Locataire</strong></p>
            @if($contrat->signature_locataire)
                <img src="{{ $contrat->signature_locataire }}" alt="Signature locataire">
            @else
                <p style="color:#9ca3af">Non signé</p>
            @endif
        </div>
    </div>
</body>
</html>
