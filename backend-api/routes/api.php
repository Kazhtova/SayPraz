<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use App\Http\Controllers\Api\ReportController;
use App\Http\Controllers\Api\TransactionController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

// =================================================================
// GRUP 1: BISA DIAKSES OLEH SEMUA USER YANG LOGIN (Siswa, Guru Dan Staff)
// =================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });

    Route::get('/assets/depreciation-summary', [AssetController::class, 'getDepreciationSummary']);

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('assets', AssetController::class)->only(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']); 

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
});

// =================================================================
// GRUP 2: KHUSUS ADMIN & STAFF (Membutuhkan role: admin)
// =================================================================
Route::middleware(['auth:sanctum', 'role:admin'])->group(function () {
    Route::apiResource('assets', AssetController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']); 

    Route::patch('/transactions/{id}/status', [TransactionController::class, 'updateStatus']);

    Route::get('/assets/{id}/logs', [AssetController::class, 'logs']);
    Route::get('/reports/assets/pdf', [ReportController::class, 'exportAssetPdf']);
});