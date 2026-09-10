<?php

namespace App\Providers;

use App\Models\Asset; 
use App\Observers\AssetObserver; 
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Asset::observe(AssetObserver::class);
    }
}