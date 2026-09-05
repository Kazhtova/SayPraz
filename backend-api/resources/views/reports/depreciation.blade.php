<!DOCTYPE html>
<html lang="id">
<head>
    <meta charset="UTF-8">
    <title>Laporan Valuasi & Depresiasi Aset</title>
    <style>
        body { font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; font-size: 11px; color: #333; }
        .kop-surat { width: 100%; border-bottom: 3px solid #000; padding-bottom: 10px; margin-bottom: 20px; }
        .kop-surat td { vertical-align: middle; }
        .logo { width: 70px; }
        .teks-kop { text-align: center; width: 100%; }
        .teks-kop h1 { margin: 0; font-size: 18px; font-weight: bold; text-transform: uppercase; }
        .teks-kop h2 { margin: 2px 0; font-size: 14px; font-weight: bold; }
        .teks-kop p { margin: 0; font-size: 10px; }
        
        .title { text-align: center; margin-bottom: 20px; font-size: 14px; font-weight: bold; text-decoration: underline; text-transform: uppercase; }
        
        .summary-box { width: 100%; margin-bottom: 20px; border-collapse: collapse; }
        .summary-box td { border: 1px solid #ddd; padding: 10px; text-align: center; background-color: #f9fafb; width: 33.33%; }
        .summary-box .label { font-size: 10px; color: #6b7280; text-transform: uppercase; display: block; margin-bottom: 5px; }
        .summary-box .value { font-size: 14px; font-weight: bold; color: #111827; }
        
        .table-data { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .table-data th, .table-data td { border: 1px solid #000; padding: 6px 8px; text-align: left; }
        .table-data th { background-color: #f3f4f6; font-weight: bold; text-align: center; text-transform: uppercase; font-size: 10px; }
        .table-data td { font-size: 10px; }
        .text-right { text-align: right !important; }
        .text-center { text-align: center !important; }
        
        .footer { width: 100%; margin-top: 30px; }
        .footer td { width: 50%; text-align: center; vertical-align: bottom; height: 100px; }
    </style>
</head>
<body>

    <!-- KOP SURAT -->
    <table class="kop-surat">
        <tr>
            <!-- Hapus atau ubah src logo sesuai lokasi file kamu jika ada logo dinas/sekolah -->
            <td width="15%" class="text-center"></td> 
            <td width="70%" class="teks-kop">
                <h2>PEMERINTAH PROVINSI JAWA TIMUR</h2>
                <h2>DINAS PENDIDIKAN</h2>
                <h1>SMK NEGERI 10 SURABAYA</h1>
                <p>Jl. Keputih Tegal, Keputih, Kec. Sukolilo, Kota SBY, Jawa Timur 60111</p>
                <p>Email: info@smkn10surabaya.sch.id | Website: www.smkn10surabaya.sch.id</p>
            </td>
            <td width="15%"></td>
        </tr>
    </table>

    <div class="title">
        LAPORAN VALUASI DAN DEPRESIASI ASET (EAM)<br>
        <span style="font-size: 10px; font-weight: normal; text-decoration: none;">Dicetak pada: {{ $date }}</span>
    </div>

    <!-- RINGKASAN FINANSIAL -->
    <table class="summary-box">
        <tr>
            <td>
                <span class="label">Total Harga Perolehan ({{ $summary['total_assets_count'] }} Aset)</span>
                <span class="value">Rp {{ number_format($summary['total_acquisition_cost'], 0, ',', '.') }}</span>
            </td>
            <td>
                <span class="label">Total Akumulasi Penyusutan</span>
                <span class="value" style="color: #dc2626;">- Rp {{ number_format($summary['total_accumulated_depreciation'], 0, ',', '.') }}</span>
            </td>
            <td>
                <span class="label">Total Nilai Buku Terkini</span>
                <span class="value" style="color: #059669;">Rp {{ number_format($summary['total_current_book_value'], 0, ',', '.') }}</span>
            </td>
        </tr>
    </table>

    <!-- DATA TABEL ASET -->
    <table class="table-data">
        <thead>
            <tr>
                <th width="3%">No</th>
                <th width="15%">QR Code</th>
                <th width="22%">Nama Aset / Merek</th>
                <th width="12%">Kategori</th>
                <th width="15%">Harga Perolehan</th>
                <th width="18%">Penyusutan Berjalan</th>
                <th width="15%">Nilai Buku Saat Ini</th>
            </tr>
        </thead>
        <tbody>
            @forelse($assets as $index => $asset)
            <tr>
                <td class="text-center">{{ $index + 1 }}</td>
                <td class="text-center font-bold">{{ $asset->qr_code }}</td>
                <td>
                    <strong>{{ $asset->name }}</strong><br>
                    <span style="color: #666; font-size: 9px;">Thn Beli: {{ $asset->purchase_year }} | Umur: {{ $asset->useful_life }} Thn</span>
                </td>
                <td class="text-center">{{ $asset->category ? $asset->category->name : '-' }}</td>
                <td class="text-right">Rp {{ number_format($asset->purchase_price, 0, ',', '.') }}</td>
                <td class="text-right">
                    - Rp {{ number_format($asset->accumulated_depreciation, 0, ',', '.') }}<br>
                    <span style="font-size: 8px; color: #666;">({{ $asset->is_fully_depreciated ? 'Habis Manfaat' : $asset->depreciation_percentage.'% Tersusut' }})</span>
                </td>
                <td class="text-right"><strong>Rp {{ number_format($asset->current_book_value, 0, ',', '.') }}</strong></td>
            </tr>
            @empty
            <tr>
                <td colspan="7" class="text-center">Tidak ada data aset untuk dihitung.</td>
            </tr>
            @endforelse
        </tbody>
    </table>

    <!-- TANDA TANGAN -->
    <table class="footer">
        <tr>
            <td>
                Mengetahui,<br>
                Kepala Tata Usaha / Sarpras<br><br><br><br><br>
                <strong>_________________________</strong><br>
                NIP.
            </td>
            <td>
                Surabaya, {{ $date }}<br>
                Administrator EAM<br><br><br><br><br>
                <strong>_________________________</strong><br>
                Sistem SayPraz
            </td>
        </tr>
    </table>

</body>
</html>