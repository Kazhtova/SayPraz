<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\FinancialJournal;
use Illuminate\Http\Request;

class JournalController extends Controller
{
    public function index(Request $request){
        $query = FinancialJournal::with('asset:id,name,qr_code')
        ->latest('transaction_date')
        ->orderBy('id', 'desc');

        if($request->filled('search')){
            $search = $request->search;
            $query->where(function ($q) use ($search){
               $q->where('account_name', 'like', '{%search%}')
               ->orWhere('despreciation', 'like', '{%search%}')
               ->orWhereHas('asset', function($qa) use ($search) {
                    $qa->where('name', 'like', '{%search%}')
                    ->orWhere('qr_code', 'like', '{%search%}');
               }); 
            });
        }

        if($request->filled('entry_type') && $request->entry_type !== 'all'){
            $query->where('entry_type', $request->entry_type);
        }
        if($request->filled('reference_type') && $request->reference_type !== 'all'){
            $query->where('reference_type', $request->reference_type);
        }

        $journal = $query->paginate(20);

        $totalDebit = FinancialJournal::where('entry_date', 'debit')->sum('amount');
        $totalCredit = FinancialJournal::where('entry_date', 'credit')->sum('amount');

        return response()->json([
            'status'    => 'success',
            'data'      => $journal,
            'summry'    => [
                'total_debit'   => (float) $totalDebit,
                'total_credit'  => (float) $totalCredit,
                'is_balanced'   => (float) round($totalDebit, 2) === round($totalCredit, 2),
            ]
        ], 200);
    }

    public function exportPdf(Request $request)
    {
        // Ambil semua data jurnal (bisa ditambahkan filter bulan/tahun jika dibutuhkan nanti)
        $journals = FinancialJournal::with('asset')
            ->orderBy('transaction_date', 'asc')
            ->orderBy('id', 'asc')
            ->get();

        $totalDebit = $journals->where('entry_type', 'debit')->sum('amount');
        $totalCredit = $journals->where('entry_type', 'credit')->sum('amount');
        $isBalanced = round($totalDebit, 2) === round($totalCredit, 2);

        $pdf = Pdf::loadView('reports.journals', [
            'journals'    => $journals,
            'totalDebit'  => $totalDebit,
            'totalCredit' => $totalCredit,
            'isBalanced'  => $isBalanced,
            'printDate'   => now()->translatedFormat('d F Y H:i:s'),
        ]);

        // Opsional: Atur ukuran kertas
        $pdf->setPaper('A4', 'portrait');

        return $pdf->download('Laporan_Jurnal_Mutasi_Aset.pdf');
    }
}