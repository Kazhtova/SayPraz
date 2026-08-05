<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute; 
use Illuminate\Support\Facades\Storage;

class Asset extends Model
{
    use HasFactory;
    protected $fillable = ['category_id', 'name', 'brand', 'qr_code', 'status', 'purchase_year', 'image'];

    protected $appends = ['image_url'];

    protected function imageUrl(): Attribute
    {
        return Attribute::make(
            get: function (){
                /** @var \Illuminate\Contracts\Filesystem\Cloud $disk */
                $disk = Storage::disk('s3');
                return $this->image ? $disk->url($this->image) : null;
            }
        );
    }

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