<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\AssetResource;
use App\Models\Asset;
use App\Models\AssetLog;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use App\Models\Transaction; 
use Carbon\Carbon;

class AssetController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        $query = Asset::with('category')
            ->latest()
            ->orderBy('id', 'desc');

        if($request->filled('search')) {
            $search = $request->search;
            $query->where(function($q) use ($search){
                $q->where('name', 'like', "%{$search}%")
                ->orWhere('brand', 'like', "%{$search}%"); 
            });
        }

        if($request->filled('category')){
            if($request->category === 'Tanpa Kategori'){
                $query->whereNull('category_id');
            } else {
                $query->whereHas('category', function($q) use ($request) {
                   $q->where('name', $request->category); 
                });
            }
        }

        if($request->filled('status')){
            $query->where('status', $request->status);
        }
        
        $assets = $query->paginate(15);

        $assetsThisMonth = Asset::whereMonth('created_at', Carbon::now()->month)->count();
        $assetsLastMonth = Asset::whereMonth('created_at', Carbon::now()->subMonth()->month)->count();

        $totalGrowth = 0;
        if($assetsLastMonth > 0){
            $totalGrowth = (($assetsThisMonth - $assetsLastMonth) / $assetsLastMonth) * 100;
        }else{
            $totalGrowth = $assetsThisMonth > 0 ? 100 : 0;
        }

        $borrowThisMonth = Transaction::whereMonth('created_at', Carbon::now()->month)->count();
        $borrowLastMonth = Transaction::whereMonth('created_at', Carbon::now()->subMonth()->month)->count();

        $borrowGrowth = 0;
        if($borrowLastMonth > 0){
            $borrowGrowth = (($borrowThisMonth - $borrowLastMonth) / $borrowLastMonth) * 100;
        } else {
            $borrowGrowth = $borrowThisMonth > 0 ? 100 : 0;
        }

        $chartData = [];
        for($i = 5; $i >= 0; $i--){
            $targetMonth = Carbon::now()->subMonths($i);
            $monthlyCount = Transaction::whereMonth('created_at', $targetMonth->month)
            ->whereYear('created_at', $targetMonth->year)
            ->count();

            $chartData[] = [
              'name'        => $targetMonth->translatedFormat('M'),
              'peminjaman'  => $monthlyCount,
            ];
        }

        $stats = [
            'total'         => Asset::count(),
            'available'     => Asset::where('status', 'available')->count(),
            'in_repair'     => Asset::where('status', 'in_repair')->count(),
            'borrowed'      => Asset::where('status', 'borrowed')->count(),
            'pending_transactions'   => Transaction::where('status', 'pending')->count(),
            'total_growth'          => round($totalGrowth, 1),
            'borrow_growth'         => round($borrowGrowth, 1)
        ];

        return AssetResource::collection($assets)->additional([
            'stats'      => $stats,
            'chart_data' => $chartData
        ]);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'nullable|exists:categories,id',
            'name' => 'required|string|max:255',
            'brand' => 'required|string|max:255',
            'qr_code' => 'required|string|unique:assets,qr_code',
            'status' => 'required|in:available,borrowed,in_repair',
            'purchase_year' => 'required|integer|min:1900|max:' . date('Y'),
        ]);

        if($validator->fails()) {
            return response()->json([
                'success' => false,
                'message' => 'Validasi Error',
                'errors' => $validator->errors()
            ], 422);
        }

        $asset = Asset::create($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Asset berhasil ditambahkan',
            'data' => new AssetResource($asset)
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Asset $asset)
    {
        return response()->json([
            'success' => true,
            'data' => new AssetResource($asset->load('category'))
        ]);   
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Asset $asset)
    {
        $validator = Validator::make($request->all(), [
            'category_id' => 'sometimes|required|exists:categories,id',
            'name' => 'sometimes|required|string|max:255',
            'brand' => 'sometimes|required|string|max:255',
            'qr_code' => 'sometimes|required|string|unique:assets,qr_code,' . $asset->id,
            'status' => 'sometimes|required|in:available,borrowed,in_repair',
            'purchase_year' => 'sometimes|required|integer|min:2000|max:' . date('Y'),
        ]);

        if($validator->fails()) {
            return response()->json([
                'success' => false,
                'errors' => $validator->errors()
            ], 422);
        }

        $asset->update($request->all());

        return response()->json([
            'success' => true,
            'message' => 'Asset berhasil diperbarui',
            'data' => new AssetResource($asset)
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Asset $asset)
    {
        $asset->delete();

        return response()->json([
            'success' => true,
            'message' => 'Asset berhasil dihapus'
        ]);
    }

    public function logs(int $id){
        $logs = AssetLog::with('admin:id,name,role')
        ->where('asset_id', $id)
        ->orderBy('created_at', 'desc')
        ->get();

        return response()->json([
            'success'   => true,
            'message'   => 'Riwayat Aset Berhasil Diambil',
            'data'      => $logs
        ]);
    }
}