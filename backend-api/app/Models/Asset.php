<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Casts\Attribute; 
use Illuminate\Support\Facades\Storage;
use Carbon\Carbon;

class Asset extends Model
{
    use HasFactory;

    protected $fillable = ['category_id', 'name', 'brand', 'qr_code', 'status', 'purchase_year', 'image', 'purchase_price', 'useful_life', 'residual_value',];

    protected $appends = ['image_url', 'annual_depreciation', 'accumulated_depreciation', 'current_book_value', 'depreciation_percentage', 'is_fully_depreciated'];

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

    public function getAnnualDepreciationAttribute(): float
    {
        $usefulLife = (int) ($this->useful_life ?? 5);
        if ($usefulLife <=0) return 0.0;
        
        $purchusePrice = (float) ($this->purchase_price ?? 0);
        $residualValue = (float) ($this->residual_value ?? 0);

        $depreciableBase = max(0, $purchusePrice - $residualValue);
        return round($depreciableBase / $usefulLife, 2);
    }

    public function getAccumulatedDepreciationAttribute(): float
    {
        $currentYear = (int) Carbon::now()->year;
        $purchaseYear = (int) ($this->purchase_year ?: $currentYear);
        $usefulLife = (int) ($this->useful_life ?? 5);

        $yearInUse = max(0, $currentYear - $purchaseYear);
        $effectiveYear = min($yearInUse, $usefulLife);

        return round($this->annual_depreciation * $effectiveYear, 2);
    }

    public function getCurrentBookValueAttribute(): float
    {
        $purchasePrice = (float) ($this->purchase_price ?? 0);
        $residualValue = (float) ($this->residual_value ?? 0);

        $calculatedValue = $purchasePrice - $this->accumulated_depreciation;
        return max($residualValue, round($calculatedValue, 2));
    }

    public function getDepreciationPercentageAttribute(): float
    {
        $purchasePrice = (float) ($this->purchase_price ?? 0);
        if ($purchasePrice <= 0) return 0.0;

        return round(($this->accumulated_depreciation / $purchasePrice) * 100, 1);
    }

    public function getIsFullyDepreciatedAttribute(): bool
    {
        $currentYear = (int) Carbon::now()->year;
        $purchaseYear = (int) ($this->purchase_year ?: $currentYear);
        $usefulLife = (int) ($this->useful_life ?? 5);

        return ($currentYear - $purchaseYear) >= $usefulLife;
    }
}