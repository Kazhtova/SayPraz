<?php

namespace App\Observers;

use App\Models\Asset;
use App\Models\FinancialJournal;
use Carbon\Carbon;

class AssetObserver
{
    /**
     * Handle the Asset "created" event.
     * Menerbitkan jurnal ganda secara otomatis saat aset baru dibeli.
     */
    public function created(Asset $asset): void
    {
        $transactionDate = $asset->purchase_date ?? Carbon::now();

        // 1. Catat DEBIT (Bertambahnya Aset Tetap)
        FinancialJournal::create([
            'asset_id'         => $asset->id,
            'transaction_date' => $transactionDate,
            'account_name'     => 'Aset Tetap (Inventaris)',
            'entry_type'       => 'debit',
            'amount'           => $asset->purchase_price,
            'reference_type'   => 'purchase',
            'description'      => "Kapitalisasi awal aset: {$asset->name} ({$asset->qr_code})"
        ]);

        // 2. Catat KREDIT (Berkurangnya Kas / Bertambahnya Modal)
        FinancialJournal::create([
            'asset_id'         => $asset->id,
            'transaction_date' => $transactionDate,
            'account_name'     => 'Kas / Bank',
            'entry_type'       => 'credit',
            'amount'           => $asset->purchase_price,
            'reference_type'   => 'purchase',
            'description'      => "Pengeluaran dana pembelian aset: {$asset->name}"
        ]);
    }
}