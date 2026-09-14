<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Asset;
use App\Models\AssetLog;
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
                'asset'             => $asset->id,
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
        
    }
}