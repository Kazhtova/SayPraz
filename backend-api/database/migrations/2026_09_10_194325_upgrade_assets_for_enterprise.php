<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\DB;

return new class extends Migration
{
    public function up()
    {
        Schema::table('assets', function (Blueprint $table) {
            // Tambahkan kolom tanggal spesifik
            $table->date('purchase_date')->nullable()->after('status');
            
            // Kolom untuk modul Write-Off / Disposal
            $table->boolean('is_disposed')->default(false)->after('residual_value');
            $table->date('disposal_date')->nullable()->after('is_disposed');
            $table->decimal('disposal_value', 15, 2)->nullable()->after('disposal_date');
            $table->string('disposal_reason')->nullable()->after('disposal_value');
        });

        // Migrasi Data Otomatis: Ubah purchase_year lama menjadi purchase_date (1 Januari di tahun tersebut)
        DB::statement("UPDATE assets SET purchase_date = CONCAT(purchase_year, '-01-01') WHERE purchase_year IS NOT NULL");

        // Setelah data aman, hapus kolom purchase_year lama
        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn('purchase_year');
        });
    }

    public function down()
    {
        Schema::table('assets', function (Blueprint $table) {
            $table->integer('purchase_year')->nullable();
        });

        DB::statement("UPDATE assets SET purchase_year = YEAR(purchase_date) WHERE purchase_date IS NOT NULL");

        Schema::table('assets', function (Blueprint $table) {
            $table->dropColumn(['purchase_date', 'is_disposed', 'disposal_date', 'disposal_value', 'disposal_reason']);
        });
    }
};