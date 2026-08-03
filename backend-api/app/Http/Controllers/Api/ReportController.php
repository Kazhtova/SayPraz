<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

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
}