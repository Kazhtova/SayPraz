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
            'id' => $this->id,
            'name' => $this->name,
            'brand' => $this->brand,
            'qr_code' => $this->qr_code,
            'status' => $this->status,
            'purchase_year' => $this->purchase_year,
            'category_id'   => $this->category_id,
            'category_name' => $this->category?->name ?? 'Tanpa Kategori',
            'created_at' => $this->created_at->format('Y-m-d H:i:s'),
        ];
    }
}