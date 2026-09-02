<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->decimal('purchase_price', 15, 2)->default(0)->after('purchase_year');
            $table->unsignedInteger('useful_life')->default(5)->after('purchase_price');
            $table->decimal('residual_value', 15, 2)->default(0)->after('useful_life');
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['purchase_price', 'useful_life', 'residual_value']);
        });
    }
};