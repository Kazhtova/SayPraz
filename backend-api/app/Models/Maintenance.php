<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class Maintenance extends Model
{
    protected $fillable = [
        'asset_id',
        'user_id',
        'title',
        'issue_description',
        'action_taken',
        'vendor_name',
        'cost',
        'status',
        'start_date',
        'completion_date',
    ];

    protected $casts = [
        'cost'            => 'decimal:2',
        'start_date'      => 'date',
        'completion_date' => 'date',
    ];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function user(): BelongsTo
    {
        return $this->BelongsTo(User::class);
    }
}