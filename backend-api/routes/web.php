<?php

use App\Http\Controllers\Api\AssetController;
use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return view('welcome');
});

Route::apiResource('assets', AssetController::class);