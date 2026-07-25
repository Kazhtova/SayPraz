<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class Asset extends Model
{
    use HasFactory;
    protected $fillable = ['category_id', 'name', 'brand', 'qr_code', 'status', 'purchase_year'];

    // Milik satu kategori (Child)
    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    // Memiliki banyak riwayat peminjaman (Parent)
    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    // Memiliki banyak riwayat perubahan kondisi/log (Parent)
    public function logs(): HasMany
    {
        return $this->hasMany(AssetLog::class);
    }
}