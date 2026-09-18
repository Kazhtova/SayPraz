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
    }
}