<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AssetResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id'                        => $this->id,
            'name'                      => $this->name,
            'brand'                     => $this->brand,
            'qr_code'                   => $this->qr_code,
            'status'                    => $this->status,
            
            // Format tanggal enterprise
            'purchase_date'             => $this->purchase_date ? $this->purchase_date->format('Y-m-d') : null,
            // Ekstrak tahun dari date untuk mencegah error di komponen frontend lama
            'purchase_year'             => $this->purchase_date ? (int) $this->purchase_date->format('Y') : null,
            
            'category_id'               => $this->category_id,
            'category_name'             => $this->category?->name ?? 'Tanpa Kategori',
            'image'                     => $this->image,
            'image_url'                 => $this->image_url,
            'purchase_price'            => (float) $this->purchase_price,
            'useful_life'               => (int) $this->useful_life,
            'residual_value'            => (float) $this->residual_value,
            
            // Valuasi & Depresiasi Terkini
            'monthly_depreciation'      => $this->monthly_depreciation,
            'annual_depreciation'       => $this->annual_depreciation,
            'current_asset_value'       => $this->current_asset_value,
            'accumulated_depreciation'  => $this->accumulated_depreciation,
            'depreciation_percentage'   => $this->depreciation_percentage,
            'is_fully_depreciated'      => $this->is_fully_depreciated,
            
            // Data Disposal
            'is_disposed'               => (bool) $this->is_disposed,
            'disposal_date'             => $this->disposal_date ? $this->disposal_date->format('Y-m-d') : null,
            'disposal_value'            => $this->disposal_value ? (float) $this->disposal_value : null,
            'disposal_reason'           => $this->disposal_reason,
            
            'created_at'                => $this->created_at?->format('Y-m-d H:i:s'),
        ];
    }
}