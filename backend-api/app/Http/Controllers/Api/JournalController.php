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

        
    }
}