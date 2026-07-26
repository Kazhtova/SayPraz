<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AssetLog extends Model
{
    use HasFactory;
    protected $fillable = ['asset_id', 'handle_by', 'old_status', 'new_status', 'notes'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handle_by');
    }
}