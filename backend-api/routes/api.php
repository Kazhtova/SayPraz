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
// GRUP 1: BISA DIAKSES OLEH SEMUA USER YANG LOGIN (Termasuk Siswa)
// =================================================================
Route::middleware('auth:sanctum')->group(function () {
    Route::get('/user', function (Request $request) {
        return $request->user();
    });
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('assets', AssetController::class)->only(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->only(['index', 'show']); 

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
});

// =================================================================
// GRUP 2: KHUSUS ADMIN & STAFF (Membutuhkan role: admin atau staff)
// =================================================================
Route::middleware(['auth:sanctum', 'role:admin,staff'])->group(function () {
    Route::apiResource('assets', AssetController::class)->except(['index', 'show']);
    Route::apiResource('categories', CategoryController::class)->except(['index', 'show']); 

    Route::patch('/transaction/{id}/status', [TransactionController::class, 'updateStatus']);

    Route::get('/asset/{id}/logs', [AssetController::class, 'logs']);
    Route::get('/reports/asset/pdf', [ReportController::class, 'exportAssetPdf']);
});