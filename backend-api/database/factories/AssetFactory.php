<?php

namespace Database\Factories;

use App\Models\Category;
use Illuminate\Database\Eloquent\Factories\Factory;
use App\Models\Asset;
use Illuminate\Support\Str;

/**
 * @extends Factory<Asset>
 */
class AssetFactory extends Factory
{
    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        return [
            'category_id' => Category::factory(),
            'name' => 'Alat Praktik ' . fake()->word(),
            'brand' => fake()->randomElement(['Epson', 'Canon', 'Mikrotik', 'Bosch', 'Lenovo']),
            'qr_code' => strtoupper(Str::random(10)),
            'status' => fake()->randomElement(['available', 'borrowed', 'in_repair']),
            'purchase_year' => fake()->numberBetween(2020, 2026),
        ];
    }
}