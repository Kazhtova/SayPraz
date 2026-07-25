<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Factories\HasFactory;


class Category extends Model
{
    use HasFactory;
    protected $fillable = ['name', 'slug', 'description'];

    // Relasi One-to-Many ke tabel assets
    public function assets(): HasMany
    {
        return $this->hasMany(Asset::class);
    }
}