<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetLog;
use App\Models\FinancialJournal;
use App\Models\Maintenance;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Validator;

class MaintenanceController extends Controller
{
    public function index(){
        $maintenances = Maintenance::with(['asset', 'user'])->latest('id')->get();

        return response()->json([
            'status'    => 'success',
            'message'   => 'Daftar tiket servis berhasil diambil',
            'data'      => $maintenances,
        ], 200);
    }

    public function store(Request $request){
        $input = $request->json()->all() ?: $request->all();

        $validator = Validator::make($input, [
            'asset_id'          => 'required|exists:assets,id',
            'title'             => 'required|string|max:255',
            'issue_description' => 'required|string',
            'vendor_name'       => 'nullable|string|max:255',
            'start_date'        => 'required|date', 
        ]);

        if($validator->fails()){
            return response()->json([
                'status'    => 'error',
                'errors'    => $validator->errors(),
            ], 422);
        }

        $asset = Asset::findOrFail($input['asset_id']);

        if($asset->is_disposed){
            return response()->json([
                'status'    => 'error',
                'message' => 'Aset yang telah dihapusbukukan (disposed) tidak dapat diservis.',
            ], 422);
        }

        $maintenance = DB::transaction(function() use ($input, $asset){
            $record = Maintenance::create([
                'asset_id'             => $asset->id,
                'user_id'           => Auth::id() ?? 1,
                'title'             => $input['title'],
                'issue_description' => $input['issue_description'],
                'vendor_name'       => $input['vendor_name'] ?? null,
                'cost'              => 0,
                'status'            => 'in_progress',
                'start_date'        => $input['start_date'],
            ]);
           
            $oldStatus = $asset->status;
            $asset->update(['status'    => 'in_repair']);

            AssetLog::create([
                'asset_id'      => $asset->id,
                'admin_id'      => Auth::id() ?? 1,
                'old_status'    => $oldStatus,
                'new_status'    => 'in_repair',
                'handle_by'     => Auth::id() ?? 1,
                'notes'      => "Aset masuk perbaikan: {$input['title']}",
            ]);

            return $record;
        });
        
        return response()->json([
            'status'    => 'success',
            'message'   => 'Tiket perbaikan berhasil dibuka.',
            'data'      => $maintenance->load('asset'),
        ], 201);
    }

    public function complete(Request $request, Maintenance $maintenance){
        if($maintenance->status === 'completed'){
            return response()->json([
                'status'        => 'error',
                'message'       => 'Tiket perbaikan ini sudah diselesaikan sebelumnya.',
            ], 422);
        }

        $input = $request->json()->all() ?: $request->all();

        $validator = Validator::make($input, [
            'action_taken'    => 'required|string',
            'completion_date' => 'required|date',
            'final_cost'      => 'required|numeric|min:0',
        ]);

        if($validator->fails()){
            return response()->json([
                'status'    => 'error',
                'errors'    => $validator->errors()    
            ], 422);
        }

        DB::transaction(function () use ($maintenance, $input){
           $finalCost = (float) $input['final_cost'];
           
           $maintenance->update([
                'action_taken'    => $input['action_taken'],
                'completion_date' => $input['completion_date'],
                'cost'            => $finalCost,
                'status'          => 'completed'
           ]);

           $asset = $maintenance->asset;
           if($asset && !$asset->is_disposed){
            $oldStatus = $asset->status;
            $asset->update(['status'    => 'available']);

            AssetLog::create([
                'asset_id'      => $asset->id,
                'admin_id'      => Auth::id() ?? 1,
                'old_status'    => $oldStatus,
                'new_status'    => 'available',
                'handle_by'     => Auth::id() ?? 1,
                'notes'         => "Perbaikan selesai: {$input['action_taken']} (Biaya: Rp " . number_format($finalCost, 0, ',', '.') . ")",               
            ]);
           }

           if($finalCost > 0){
            FinancialJournal::create([
                'asset_id'         => $maintenance->asset_id,
                'transaction_date' => $input['completion_date'],
                'account_name'     => 'Beban Pemeliharaan & Perbaikan',
                'entry_type'       => 'debit',
                'amount'           => $finalCost,
                'reference_type'   => 'maintenance',
                'description'      => "Biaya perbaikan aset {$asset?->name}: {$maintenance->title}",
            ]);

            FinancialJournal::create([
                'asset_id'         => $maintenance->asset_id,
                'transaction_date' => $input['completion_date'],
                'account_name'     => 'Kas / Bank',
                'entry_type'       => 'credit',
                'amount'           => $finalCost,
                'reference_type'   => 'maintenance',
                'description'      => "Pembayaran servis tiket #{$maintenance->id}",
            ]);
           }
        });

        return response([
            'status'    => 'success',
            'message'   => 'Tiket perbaikan berhasil diselesaikan dan dicatat ke jurnal keuangan.',
            'data'      => $maintenance->fresh(['asset']),
        ], 200);
    }
}