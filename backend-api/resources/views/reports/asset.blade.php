<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Data Aset</title>
    <style>
        /* CSS khusus untuk DomPDF agar rapi saat dicetak ke A4 */
        body {
            font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif;
            font-size: 12px;
            color: #333;
        }
        .header {
            text-align: center;
            margin-bottom: 20px;
            border-bottom: 2px solid #333;
            padding-bottom: 10px;
        }
        .header h2 {
            margin: 0;
            font-size: 18px;
            text-transform: uppercase;
        }
        .header p {
            margin: 5px 0 0;
            font-size: 12px;
            color: #666;
        }
        table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
        }
        th, td {
            border: 1px solid #999;
            padding: 8px;
            text-align: left;
        }
        th {
            background-color: #f4f4f5;
            font-weight: bold;
            text-transform: uppercase;
            font-size: 11px;
        }
        .text-center {
            text-align: center;
        }
        .footer {
            margin-top: 30px;
            text-align: right;
            font-size: 11px;
        }
    </style>
</head>
<body>

    <div class="header">
        <h2>Laporan Inventaris Aset Sarpras</h2>
        <p>Aplikasi Invenkoryz - Dicetak pada: {{ \Carbon\Carbon::now()->format('d M Y, H:i') }}</p>
    </div>

    <table>
        <thead>
            <tr>
                <th class="text-center" style="width: 5%">No</th>
                <th style="width: 15%">QR Code</th>
                <th style="width: 30%">Nama Aset</th>
                <th style="width: 15%">Kategori</th>
                <th class="text-center" style="width: 15%">Tahun Beli</th>
                <th class="text-center" style="width: 20%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse ($assets as $index => $asset)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td style="font-family: monospace;">{{ $asset->qr_code }}</td>
                <td>
                    <strong>{{ $asset->name }}</strong><br>
                    <span style="font-size: 10px; color: #666;">{{ $asset->brand }}</span>
                </td>
                <td>{{ $asset->category ? $asset->category->name : '-' }}</td>
                <td class="text-center">{{ $asset->purchase_year }}</td>
                <td class="text-center">
                    @if($asset->status == 'available')
                        Tersedia
                    @elseif($asset->status == 'borrowed')
                        Dipinjam
                    @else
                        Perbaikan
                    @endif
                </td>
            </tr>
            @empty
            <tr>
                <td colspan="6" class="text-center">Belum ada data aset.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <div class="footer">
        <p>Mengetahui,</p>
        <br><br><br>
        <p><strong>Admin Sarpras</strong></p>
    </div>

</body>
</html>