<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetLog;
use App\Models\Transaction;
use App\Enums\TransactionStatus;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rules\Enum;

class TransactionController extends Controller
{
    public function index(){

        $user = Auth::user();

        if($user->role === 'admin'){
            $query = Transaction::with(['user', 'asset'])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc');
        }else{
            $query = Transaction::where('user_id', $user->id)->with(['asset'])
            ->orderBy('created_at', 'desc')
            ->orderBy('id', 'desc');
        }

        $transactions = $query->paginate(15);

        return response()->json([
           'success'    => true,
           'data'       => $transactions->items(),
           'meta'       => [
                'current_page'  => $transactions->currentPage(),
                'last_page'     => $transactions->lastPage(),
                'total'         => $transactions->total()
           ]
        ]);
    }

    public function store(Request $request){
        $validator = Validator::make($request->all(), [
            'asset_id'                  =>  'required|exists:assets,id',
            'expected_returned_date'    =>  'required|date|after_or_equal:today'
        ]);

        if($validator->fails()){
            return response()->json(['success' => false, 'errors' => $validator->errors()], 422);
        }

        $asset = Asset::find($request->asset_id);

        if($asset->status !== 'available'){
            return response()->json([
               'success'    => false,
               'message'    => 'Asset Tidak Tersedia Untuk Dipinjam' 
            ], 400);
        }

        $transaction = Transaction::create([
            'asset_id'                  => $request->asset_id,
            'user_id'                   => Auth::id(),
            'borrowed_at'               => now(),
            'expected_returned_date'    => $request->expected_returned_date,
            'status'                    => TransactionStatus::PENDING
        ]);

        return response()->json([
            'success'       => true,
            'message'       => 'Pengajuan peminjaman berhasil dikirim',
            'data'          => $transaction
        ], 201);
    }

    public function updateStatus(Request $request, int $id){
        $validator = Validator::make($request->all(), [
            'status'    => ['required', new Enum(TransactionStatus::class)],
            'notes'     => 'nullable|string'
        ]);

        if($validator->fails()){
            return response()->json(['success'  => false, 'errors'  => $validator->errors()], 422);
        }

        $transaction = Transaction::findOrFail($id);
        $asset = Asset::findOrFail($transaction->asset_id);

        try {
            DB::beginTransaction();

            $oldStatus = $asset->status;
            $newStatus = $oldStatus;

            $requestedStatus = TransactionStatus::from($request->status);

            if($requestedStatus === TransactionStatus::APPROVED && $transaction->status === TransactionStatus::PENDING){
                $transaction->status = TransactionStatus::APPROVED;
                $newStatus = 'borrowed';
                $asset->update(['status' => $newStatus]);
            } 
            elseif ($requestedStatus === TransactionStatus::RETURNED && 
                   ($transaction->status === TransactionStatus::APPROVED || $transaction->status === TransactionStatus::OVERDUE)){
                
                $transaction->status = TransactionStatus::RETURNED;
                $transaction->returned_at = now(); 
                $newStatus = 'available';
                $asset->update(['status' => $newStatus]);
            } 
            elseif ($requestedStatus === TransactionStatus::REJECTED){
                $transaction->status = TransactionStatus::REJECTED;
            }

            $transaction->save();

            if($oldStatus !== $newStatus){
                AssetLog::create([
                    'asset_id'      => $asset->id,
                    'handle_by'     => Auth::id(),
                    'old_status'    => $oldStatus,
                    'new_status'    => $newStatus,
                    'notes'         => $request->notes ?? "Peminjaman di-" . $request->status
                ]); 
            }
            
            DB::commit();
            
            return response()->json([
                'success'   => true,
                'message'   => 'Status transaksi dan aset berhasil diperbarui',
            ]);
        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'success'   => false,
                'message'   => 'Terjadi kesalahan sistem ' . $e->getMessage()
            ], 500);
        }
    }
}