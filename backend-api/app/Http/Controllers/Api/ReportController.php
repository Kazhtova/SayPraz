<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;
use Carbon\Carbon;

class ReportController extends Controller
{
    public function exportAssetPdf(){
        try {
            // PERBAIKAN 1: Tambahkan ->get() di akhir query
            // Saya juga mengubah nama variabel menjadi $assets (jamak) karena datanya lebih dari satu
            $assets = Asset::with('category')->orderBy('name', 'desc')->get();

            // PERBAIKAN 2: Kirim variabel $assets
            $pdf = Pdf::loadView('reports.assets', compact('assets'));

            // PERBAIKAN 3: Perbaiki typo 'potrait' menjadi 'portrait'
            $pdf->setPaper('A4', 'portrait');

            return $pdf->download('Laporan-Asset-Inventaris.pdf');

        } catch (\Exception $e) {
            // BEST PRACTICE: Tangkap error agar Laravel tidak melempar halaman HTML 500 yang merusak frontend
            return response()->json([
                'status' => 'error',
                'message' => 'Gagal membuat dokumen PDF: ' . $e->getMessage()
            ], 500);
        }
    }

    public function exportDepreciationPdf(){
        try {
            $assets = Asset::with('category')->orderBy('id', 'desc')->get();

            $summary = [
                'total_acquisition_cost'            => (float) $assets->sum('purchase_price'),
                'total_accumulated_depreciation'    => (float) $assets->sum('accumulated_depreciation'),
                'total_current_book_value'          => (float) $assets->sum('current_book_value'),
                'total_assets_count'                => $assets->count(),
            ];

            $pdf = Pdf::loadView('reports.depreciation', [
                'assets'    => $assets,
                'summary'   => $summary,
                'date'      => Carbon::now()->translatedFormat('d F Y')
            ]);

            $pdf->setPaper('A4', 'landscape');
            
            return $pdf->download('Laporan_Valuasi_Depresiasi_SayPraz.pdf');
        } catch (\Exception $e) {
            return response()->json([
                'status'    => 'error',
                'message'   => 'Gagal membuat dokumen PDF: ' . $e->getMessage()
            ], 500);
        }
    }
}