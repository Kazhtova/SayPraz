<?php

namespace App\Console\Commands;

use App\Enums\TransactionStatus;
use App\Models\Transaction;
use Carbon\Carbon;
use Illuminate\Console\Attributes\Description;
use Illuminate\Console\Attributes\Signature;
use Illuminate\Console\Command;
use Illuminate\Support\Facades\Log;


class CheckOverdueTransactions extends Command
{
    /**
     * Execute the console command.
     */
    protected $signature = "transactions:check-overdue";

    protected $description = 'Mengecek dan mengubah status transaksi menjadi overdue jika melewati batas waktu';

    public function handle()
    {
        $today = Carbon::today();

        $overdueTransactions = Transaction::where('status', TransactionStatus::APPROVED)
        ->whereDate('expected_returned_date', '<', $today)
        ->get();
        
        if($overdueTransactions->isEmpty()){
            $this->info('Aman: Tidak ada transaksi yang terlambat hari ini.');
            return;
        }
        
        $count = 0;
        foreach($overdueTransactions as $transaction){
            $transaction->update(['status' => TransactionStatus::OVERDUE]);
            
            $count++;

            // Best Practice: Catat di file log (storage/logs/laravel.log) untuk audit
            Log::warning("Auto-Update: Transaksi ID {$transaction->id} (Asset ID: {$transaction->asset_id}) ditandai sebagai TERLAMBAT.");
        }

        $this->info("Sukses: {$count} transaksi telah diubah menjadi overdue.");
    }

}