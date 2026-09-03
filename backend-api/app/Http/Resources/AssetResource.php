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
            'purchase_year'             => $this->purchase_year,
            'category_id'               => $this->category_id,
            'category_name'             => $this->category?->name ?? 'Tanpa Kategori',
            'image'                     => $this->image,
            'image_url'                 => $this->image_url,
            'purchase_price'            => (float) $this->purchase_price,
            'useful_life'               => (int) $this->useful_life,
            'residual_value'            => (float) $this->residual_value,
            'current_book_value'        => $this->current_book_value,
            'accumulated_depreciation'  => $this->accumulated_depreciation,
            'depreciation_percentage'   => $this->depreciation_percentage,
            'is_fully_depreciated'      => $this->is_fully_depreciated,
            'created_at'                => $this->created_at?->format('Y-m-d H:i:s'),
];
}
}