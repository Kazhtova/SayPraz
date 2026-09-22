<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Jurnal Finansial & Buku Besar</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 12px; color: #333; }
        .header { text-align: center; border-bottom: 2px solid #333; padding-bottom: 10px; margin-bottom: 20px; }
        .header h2 { margin: 0; font-size: 18px; text-transform: uppercase; }
        .header p { margin: 5px 0 0; font-size: 12px; color: #666; }
        table { w-full; border-collapse: collapse; margin-bottom: 20px; width: 100%; }
        th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
        th { background-color: #f4f4f4; font-weight: bold; font-size: 11px; text-transform: uppercase; text-align: center;}
        .text-right { text-align: right; }
        .text-center { text-align: center; }
        .font-bold { font-weight: bold; }
        .summary-box { float: right; width: 300px; border: 1px solid #333; padding: 10px; margin-bottom: 30px; }
        .summary-row { clear: both; overflow: hidden; padding: 4px 0; }
        .summary-label { float: left; font-weight: bold; }
        .summary-value { float: right; }
        .signature-section { margin-top: 50px; width: 100%; clear: both; }
        .signature-box { float: right; width: 250px; text-align: center; }
        .signature-space { height: 80px; }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Jurnal Finansial & Mutasi Aset</h2>
        <p>Sistem Informasi Manajemen Aset (EAM) - Dicetak pada: {{ $printDate }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th width="15%">Tanggal</th>
                <th width="25%">Nama Akun</th>
                <th width="30%">Keterangan / Referensi</th>
                <th width="15%">Debit (Rp)</th>
                <th width="15%">Kredit (Rp)</th>
            </tr>
        </thead>
        <tbody>
            @forelse($journals as $journal)
            <tr>
                <td class="text-center">{{ \Carbon\Carbon::parse($journal->transaction_date)->format('d/m/Y') }}</td>
                <td>{{ $journal->account_name }}</td>
                <td>
                    {{ $journal->description }}<br>
                    <small style="color: #666;">Ref: #{{ strtoupper($journal->reference_type) }}</small>
                </td>
                <td class="text-right">{{ $journal->entry_type === 'debit' ? number_format($journal->amount, 0, ',', '.') : '-' }}</td>
                <td class="text-right">{{ $journal->entry_type === 'credit' ? number_format($journal->amount, 0, ',', '.') : '-' }}</td>
            </tr>
            @empty
            <tr>
                <td colspan="5" class="text-center">Belum ada catatan jurnal transaksi.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="summary-box">
        <div class="summary-row">
            <div class="summary-label">Total Debit:</div>
            <div class="summary-value">Rp {{ number_format($totalDebit, 0, ',', '.') }}</div>
        </div>
        <div class="summary-row" style="border-top: 1px solid #ddd; padding-top: 8px;">
            <div class="summary-label">Total Kredit:</div>
            <div class="summary-value">Rp {{ number_format($totalCredit, 0, ',', '.') }}</div>
        </div>
        <div class="summary-row" style="border-top: 2px solid #333; padding-top: 8px; margin-top: 4px;">
            <div class="summary-label">Status Neraca:</div>
            <div class="summary-value font-bold {{ $isBalanced ? '' : 'text-danger' }}">
                {{ $isBalanced ? 'SEIMBANG (BALANCED)' : 'TIDAK SEIMBANG' }}
            </div>
        </div>
    </div>

    <div class="signature-section">
        <div class="signature-box">
            <p>Mengetahui,<br>Kepala Tata Usaha / Sarpras</p>
            <div class="signature-space"></div>
            <p class="font-bold">( .......................................... )</p>
            <p style="font-size: 11px; margin-top: 0;">NIP: ....................................</p>
        </div>
    </div>

</body>
</html>