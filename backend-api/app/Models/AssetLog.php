<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class AssetLog extends Model
{
    use HasFactory;
    protected $fillable = ['asset_id', 'handled_by', 'old_status', 'new_status', 'notes'];

    public function asset(): BelongsTo
    {
        return $this->belongsTo(Asset::class);
    }

    // Custom Foreign Key: Kita beritahu Laravel bahwa kolomnya adalah 'handled_by'
    public function admin(): BelongsTo
    {
        return $this->belongsTo(User::class, 'handled_by');
    }
}