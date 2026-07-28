<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use Barryvdh\DomPDF\Facade\Pdf;
use Illuminate\Http\Request;

class ReportController extends Controller
{
    public function exportAssetPdf(){
        $asset = Asset::with('category')->orderBy('name', 'desc');

        $pdf = Pdf::loadView('reports.assets', compact('asset'));

        $pdf->setPaper('a4', 'potrait');

        return $pdf->download('Laporan-Asset-Inventaris.pdf');
    }
}