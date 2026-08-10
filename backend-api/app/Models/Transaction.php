<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use App\Enums\TransactionStatus;

class Transaction extends Model
{
    use HasFactory;

    protected $fillable = [
        'asset_id', 
        'user_id', 
        'status',
        'expected_returned_date', 
        'borrowed_at', 
        'returned_at', 
    ];

    /**
     * Dapatkan aturan casting atribut.
     */
    protected function casts(): array
    {
        return [
            'status'                 => TransactionStatus::class,
            'expected_returned_date' => 'date',
            'borrowed_at'            => 'datetime',
            'returned_at'            => 'datetime',
        ];
    }

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}