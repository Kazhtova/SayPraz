<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class FinancialJournal extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id',
        'transaction_date',
        'account_name',
        'entry_type', // debit / credit
        'amount',
        'reference_type', // purchase, maintenance, disposal
        'description'
    ];

    protected $casts = [
        'transaction_date' => 'date',
        'amount' => 'decimal:2',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }
}