<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up()
    {
        Schema::create('financial_journals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('asset_id')->constrained('assets')->onDelete('cascade');
            $table->date('transaction_date');
            
            // Tipe Akun (misal: 'Aset Tetap', 'Kas', 'Beban Depresiasi', 'Akumulasi Depresiasi')
            $table->string('account_name');
            
            // Posisi Jurnal
            $table->enum('entry_type', ['debit', 'credit']);
            $table->decimal('amount', 15, 2);
            
            // Konteks transaksi (misal: 'purchase', 'monthly_depreciation', 'maintenance', 'disposal')
            $table->string('reference_type');
            $table->text('description')->nullable();
            
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('financial_journals');
    }
};