<?php

namespace Database\Seeders;

use App\Models\Asset;
use App\Models\Category;
use App\Models\User;
use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    use WithoutModelEvents;

    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // User::factory(10)->create();

        User::factory()->create([
            'name' => 'Admin',
            'email' => 'Admin@example.com',
            'password' => Hash::make('password123'),
            'role' => 'admin',
        ]);

        User::factory(10)->create();
        
        Category::factory(5)->has(Asset::factory()->count(10))->create();
    }
}