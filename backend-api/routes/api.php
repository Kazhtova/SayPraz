<?php

use App\Http\Controllers\Api\AssetController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\CategoryController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
   Route::get('/user', function (Request $request) {
    return $request->user();
    });

    Route::post('/logout', [AuthController::class, 'logout']);

    Route::apiResource('assets', AssetController::class);
    Route::apiResource('categories', CategoryController::class); 
});