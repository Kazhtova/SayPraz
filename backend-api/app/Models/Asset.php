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

protected $fillable = [
        'category_id', 'name', 'brand', 'qr_code', 'status', 
        'purchase_date', 'image', 'purchase_price', 'useful_life', 'residual_value',
        'is_disposed', 'disposal_date', 'disposal_value', 'disposal_reason'
    ];

    // Casting tanggal dan boolean
    protected $casts = [
        'purchase_date' => 'date',
        'disposal_date' => 'date',
        'is_disposed'   => 'boolean',
    ];

    // Tetap sertakan annual_depreciation agar Frontend (tabel Next.js) tidak error
    protected $appends = [
        'image_url', 'monthly_depreciation', 'annual_depreciation', 
        'accumulated_depreciation', 'current_book_value', 
        'depreciation_percentage', 'is_fully_depreciated'
    ];
    
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

    public function getMonthlyDepreciationAttribute(): float
    {
        $usefulLife = (int) ($this->useful_life ?? 0);
        $totalMonths = $usefulLife * 12;
        
        if ($totalMonths <= 0) return 0.0;
        
        $purchasePrice = (float) ($this->purchase_price ?? 0);
        $residualValue = (float) ($this->residual_value ?? 0);

        $depreciableBase = max(0, $purchasePrice - $residualValue);
        return round($depreciableBase / $totalMonths, 2);
    }

    // Dipertahankan untuk tabel Next.js
    public function getAnnualDepreciationAttribute(): float
    {
        return round($this->monthly_depreciation * 12, 2);
    }

    // Perhitungan akumulasi menggunakan selisih bulan (Prorated)
    public function getAccumulatedDepreciationAttribute(): float
    {
        if (!$this->purchase_date) return 0.0;

        // Jika aset dijual/dihapus, nilai berhenti menyusut di tanggal pelepasan tersebut
        $endDate = ($this->is_disposed && $this->disposal_date) ? $this->disposal_date : Carbon::now();
        
        // Menghitung jumlah bulan yang sudah dilewati
        $monthsPassed = $this->purchase_date->diffInMonths($endDate);
        
        $calculatedAccumulation = $monthsPassed * $this->monthly_depreciation;
        
        $purchasePrice = (float) ($this->purchase_price ?? 0);
        $residualValue = (float) ($this->residual_value ?? 0);
        $maxDepreciable = max(0, $purchasePrice - $residualValue);

        // Jangan biarkan nilai penyusutan melebihi total maksimal yang boleh disusutkan
        return round(min($calculatedAccumulation, $maxDepreciable), 2);
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
        $residualValue = (float) ($this->residual_value ?? 0);
        $maxDepreciable = max(0, $purchasePrice - $residualValue);

        if ($maxDepreciable <= 0) return 0.0;

        return round(($this->accumulated_depreciation / $maxDepreciable) * 100, 1);
    }

    public function getIsFullyDepreciatedAttribute(): bool
    {
        return $this->depreciation_percentage >= 100;
    }
}