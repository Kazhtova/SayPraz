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
        get: function () {
            if (!$this->image) return null;

            // Jika nilai kolom sudah berupa URL utuh
            if (filter_var($this->image, FILTER_VALIDATE_URL)) {
                return $this->image;
            }

            // Cek apakah file benar-benar ada di Supabase S3
            if (!Storage::disk('s3')->exists($this->image)) {
                return null;
            }

            $endpoint = config('filesystems.disks.s3.endpoint');
            $bucket   = config('filesystems.disks.s3.bucket');

            if (!$endpoint || !$bucket) return null;

            $domain = parse_url($endpoint, PHP_URL_HOST);
            $cleanDomain = str_replace('.storage.', '.', $domain);
            $path = ltrim($this->image, '/');

            return "https://{$cleanDomain}/storage/v1/object/public/{$bucket}/{$path}";
        }
    );
}

    public function category(): BelongsTo
    {
        return $this->belongsTo(Category::class);
    }

    public function transactions(): HasMany
    {
        return $this->hasMany(Transaction::class);
    }

    public function logs(): HasMany
    {
        return $this->hasMany(AssetLog::class);
    }
}