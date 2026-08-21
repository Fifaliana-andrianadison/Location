<!DOCTYPE html>
<html lang="fr">
<head>
    <meta charset="UTF-8">
    <title>Facture {{ $invoice->month }}/{{ $invoice->year }}</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body {
            font-family: 'DejaVu Sans', Helvetica, Arial, sans-serif;
            color: #1e293b;
            font-size: 12px;
            line-height: 1.5;
        }
        .invoice {
            padding: 34px 38px;
        }
        .header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 18px;
            margin-bottom: 22px;
        }
        .brand {
            display: flex;
            align-items: center;
            gap: 12px;
        }
        .logo {
            width: 44px;
            height: 44px;
            border-radius: 10px;
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            font-weight: 800;
            font-size: 18px;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        .brand h1 { font-size: 17px; color: #111827; }
        .brand p { font-size: 11px; color: #6b7280; }
        .doc-title { text-align: right; }
        .doc-title h2 {
            font-size: 22px;
            color: #4f46e5;
            letter-spacing: 1px;
            text-transform: uppercase;
        }
        .doc-title .period {
            display: inline-block;
            margin-top: 4px;
            background: #eef2ff;
            color: #4338ca;
            padding: 3px 10px;
            border-radius: 20px;
            font-size: 11px;
            font-weight: 600;
        }
        .status {
            display: inline-block;
            margin-top: 8px;
            padding: 3px 12px;
            border-radius: 20px;
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .status.paid { background: #d1fae5; color: #065f46; }
        .status.partial { background: #fef3c7; color: #92400e; }
        .status.unpaid { background: #fee2e2; color: #991b1b; }
        .sections {
            display: flex;
            gap: 18px;
            margin-bottom: 22px;
        }
        .box {
            flex: 1;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            padding: 12px 14px;
        }
        .box h3 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #6b7280;
            margin-bottom: 8px;
        }
        .box .row { font-size: 11.5px; margin-bottom: 2px; }
        .box .row span { color: #6b7280; }
        .box .row strong { color: #111827; }
        table.lines {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
        }
        table.lines th {
            background: #f8fafc;
            color: #64748b;
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.05em;
            text-align: left;
            padding: 8px 10px;
            border-bottom: 1px solid #e5e7eb;
        }
        table.lines td {
            padding: 9px 10px;
            border-bottom: 1px solid #f1f5f9;
            font-size: 11.5px;
        }
        table.lines td.amount { text-align: right; font-weight: 600; }
        table.lines tr.total-row td {
            background: #eef2ff;
            font-weight: 800;
            font-size: 13px;
            color: #4338ca;
        }
        .total-box {
            margin-left: auto;
            width: 320px;
            border: 1px solid #e5e7eb;
            border-radius: 10px;
            overflow: hidden;
            margin-bottom: 22px;
        }
        .total-box .line {
            display: flex;
            justify-content: space-between;
            padding: 8px 14px;
            font-size: 12px;
        }
        .total-box .line.total {
            background: linear-gradient(135deg, #6366f1, #4f46e5);
            color: #fff;
            font-weight: 800;
            font-size: 14px;
        }
        .payments { margin-bottom: 24px; }
        .payments h3 {
            font-size: 10px;
            text-transform: uppercase;
            letter-spacing: 0.06em;
            color: #6b7280;
            margin-bottom: 6px;
        }
        .footer {
            border-top: 1px solid #e5e7eb;
            padding-top: 12px;
            font-size: 10px;
            color: #9ca3af;
            text-align: center;
        }
    </style>
</head>
<body>
    <div class="invoice">
        <div class="header">
            <div class="brand">
                <div class="logo">GL</div>
                <div>
                    <h1>Gestion des Loyers</h1>
                    <p>Antananarivo, Madagascar</p>
                </div>
            </div>
            <div class="doc-title">
                <h2>Facture</h2>
                <span class="period">{{ $invoice->month }} — {{ $months[$invoice->month] ?? '' }} {{ $invoice->year }}</span>
                <br>
                <span class="status {{ $invoice->status }}">{{ $invoice->status }}</span>
            </div>
        </div>

        <div class="sections">
            <div class="box">
                <h3>Locataire</h3>
                @if ($invoice->tenant)
                    <div class="row"><strong>{{ $invoice->tenant->full_name }}</strong></div>
                    @if ($invoice->tenant->cin)<div class="row"><span>CIN :</span> <strong>{{ $invoice->tenant->cin }}</strong></div>@endif
                    @if ($invoice->tenant->phone)<div class="row"><span>Tél :</span> <strong>{{ $invoice->tenant->phone }}</strong></div>@endif
                    @if ($invoice->tenant->email)<div class="row"><span>Email :</span> <strong>{{ $invoice->tenant->email }}</strong></div>@endif
                    @if ($invoice->tenant->contract_start)<div class="row"><span>Arrivé le :</span> <strong>{{ $invoice->tenant->contract_start }}</strong></div>@endif
                @else
                    <div class="row">Locataire n°{{ $invoice->tenant_id }}</div>
                @endif
            </div>
            <div class="box">
                <h3>Bien loué</h3>
                @if ($invoice->tenant && $invoice->tenant->bien)
                    <div class="row"><strong>{{ $invoice->tenant->bien->titre }}</strong></div>
                    <div class="row"><span>Type :</span> <strong>{{ $invoice->tenant->bien->type_bien }}</strong></div>
                    <div class="row">
                        <span>Adresse :</span> <strong>
                            {{ collect([$invoice->tenant->bien->quartier, $invoice->tenant->bien->adresse, $invoice->tenant->bien->ville])->filter()->join(' — ') }}
                        </strong>
                    </div>
                @endif
            </div>
            <div class="box">
                <h3>Référence</h3>
                <div class="row"><span>Facture n° :</span> <strong>{{ str_pad((string) $invoice->id, 6, '0', STR_PAD_LEFT) }}</strong></div>
                <div class="row"><span>Échéance :</span> <strong>{{ $invoice->due_date }}</strong></div>
                <div class="row"><span>Famille :</span> <strong>{{ ($invoice->tenant->adults_count ?? 1) + ($invoice->tenant->children_count ?? 0) }} personne(s)</strong></div>
            </div>
        </div>

        <table class="lines">
            <thead>
                <tr>
                    <th>Désignation</th>
                    <th style="text-align:right">Montant</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>Loyer — {{ $invoice->tenant?->bien?->titre ?: 'Bien loué' }} ({{ $months[$invoice->month] ?? $invoice->month }} {{ $invoice->year }})</td>
                    <td class="amount">{{ number_format((float) $invoice->rent_amount, 2, ',', ' ') }} Ar</td>
                </tr>
                <tr>
                    <td>Autres charges</td>
                    <td class="amount">{{ number_format((float) $invoice->other_charges_amount, 2, ',', ' ') }} Ar</td>
                </tr>
                <tr class="total-row">
                    <td>Total à payer</td>
                    <td class="amount">{{ number_format((float) $invoice->total_amount, 2, ',', ' ') }} Ar</td>
                </tr>
            </tbody>
        </table>

        <div class="total-box">
            <div class="line"><span>Total facturé</span><span>{{ number_format((float) $invoice->total_amount, 2, ',', ' ') }} Ar</span></div>
            @php $paid = $invoice->payments->sum(fn ($p) => (float) $p->amount); @endphp
            <div class="line"><span>Total payé</span><span>{{ number_format($paid, 2, ',', ' ') }} Ar</span></div>
            <div class="line total"><span>Reste à payer</span><span>{{ number_format(max(0, (float) $invoice->total_amount - $paid), 2, ',', ' ') }} Ar</span></div>
        </div>

        @if ($invoice->payments->count() > 0)
            <div class="payments">
                <h3>Paiements reçus</h3>
                <table class="lines">
                    <thead>
                        <tr><th>Date</th><th>À compte du</th><th>Montant</th><th>Méthode</th></tr>
                    </thead>
                    <tbody>
                        @foreach ($invoice->payments as $payment)
                            <tr>
                                <td>{{ $payment->payment_date }}</td>
                                <td>{{ $payment->paid_from_date ?? '—' }}</td>
                                <td class="amount">{{ number_format((float) $payment->amount, 2, ',', ' ') }} Ar</td>
                                <td>{{ $payment->method ?? '—' }}</td>
                            </tr>
                        @endforeach
                    </tbody>
                </table>
            </div>
        @endif

        <div class="footer">
            Merci de votre confiance. Cette facture a été générée le {{ now()->format('d/m/Y à H:i') }}.
        </div>
    </div>
</body>
</html>
