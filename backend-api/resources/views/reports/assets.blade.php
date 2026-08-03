<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Aset Inventaris</title>
    <style>
        body {
            font-family: sans-serif;
            font-size: 11px;
            color: #18181b;
        }
        h2 {
            text-align: center;
            margin-bottom: 5px;
            font-size: 16px;
        }
        p.subtitle {
            text-align: center;
            color: #71717a;
            margin-top: 0;
            margin-bottom: 20px;
            font-size: 10px;
        }
        table {
            width: 100%;
            border-collapse: collapse;
        }
        th, td {
            border: 1px solid #e4e4e7;
            padding: 8px 10px;
            text-align: left;
        }
        th {
            background-color: #f4f4f5;
            font-weight: bold;
            color: #27272a;
            text-transform: uppercase;
            font-size: 9px;
        }
        .text-center {
            text-align: center;
        }
    </style>
</head>
<body>

    <h2>LAPORAN INVENTARIS ASET SARPRAS</h2>
    <p class="subtitle">Dicetak pada: {{ date('d-m-Y H:i') }} WIB</p>

    <table>
        <thead>
            <tr>
                <th class="text-center" width="5%">No</th>
                <th width="35%">Nama Aset</th>
                <th width="20%">Merek</th>
                <th width="20%">Kategori</th>
                <th class="text-center" width="10%">Tahun</th>
                <th class="text-center" width="10%">Status</th>
            </tr>
        </thead>
        <tbody>
            @forelse($assets as $index => $item)
                <tr>
                    <td class="text-center">{{ $index + 1 }}</td>
                    <td><strong>{{ $item->name }}</strong></td>
                    <td>{{ $item->brand ?? '-' }}</td>
                    <td>{{ $item->category->name ?? 'Tanpa Kategori' }}</td>
                    <td class="text-center">{{ $item->purchase_year }}</td>
                    <td class="text-center">
                        @if($item->status == 'available') Tersedia
                        @elseif($item->status == 'borrowed') Dipinjam
                        @elseif($item->status == 'in_repair') Perbaikan
                        @else {{ $item->status }}
                        @endif
                    </td>
                </tr>
            @empty
                <tr>
                    <td colspan="6" class="text-center">Belum ada data aset terdaftar.</td>
                </tr>
            @endforelse
        </tbody>
    </table>

</body>
</html>