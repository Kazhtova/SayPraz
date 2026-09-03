<div align="center">

# SayPraz
### Enterprise Asset Management (EAM) & Stock Circulation Platform

[![Laravel 13](https://img.shields.io/badge/Laravel%2013-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Supabase S3](https://img.shields.io/badge/Supabase%20S3-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL 8](https://img.shields.io/badge/MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  Platform EAM modern berbasis arsitektur <i>Decoupled</i> (Headless API) untuk mengotomatisasi siklus hidup sarana-prasarana, perhitungan depresiasi finansial aset riil (Metode Garis Lurus), pelacakan sirkulasi berbasis QR Code, dan rekam jejak audit nir-ubah (<i>Immutable Audit Trail</i>).
</p>

[Gambaran Proyek](#-gambaran-proyek) •
[Arsitektur Sistem](#-arsitektur-sistem) •
[Alur Bisnis & Siklus Aset](#-alur-bisnis--siklus-aset) •
[Mesin Perhitungan Finansial](#-mesin-perhitungan-finansial-eam) •
[Matriks Hak Akses](#-matriks-hak-akses-rbac) •
[Struktur Basis Data](#-struktur-basis-data) •
[Panduan Instalasi](#-panduan-instalasi)

</div>

---

## 📌 Gambaran Proyek

**SayPraz** dirancang untuk mentransformasi tata kelola logistik sekolah dan institusi dari inventarisasi manual menjadi ekosistem digital enterprise. Sistem ini mengatasi tiga masalah krusial:

1. **Discrepancy Fisik & Administratif:** Hilangnya jejak peminjaman (*asset misplacement*) dan peminjaman liar tanpa persetujuan bertingkat.
2. **Ketiadaan Valuasi Riil:** Nilai aset yang tercatat sering kali statis pada harga beli awal, mengabaikan degradasi nilai barang seiring berjalannya tahun pemakaian.
3. **Dokumentasi Kerusakan Minim:** Peralatan fisik mengalami penurunan mutu tanpa adanya catatan rekam jejak perbaikan (*maintenance logs*) yang terpusat.

Dengan menggabungkan konsep **Enterprise Asset Management (EAM)** dan **Sirkulasi Peminjaman Bertingkat**, SayPraz mengawasi aset mulai dari pengadaan (*procurement*), pemanfaatan operasional (*active deployment*), siklus servis (*maintenance*), evaluasi nilai buku berkala, hingga penghapusan unit (*disposal*).

---

## Arsitektur Sistem

Platform mengadopsi arsitektur *decoupled* berkinerja tinggi yang memisahkan *client presentation* dengan backend komputasi transaksional:

```mermaid
graph TD
    classDef client fill:#09090b,stroke:#27272a,stroke-width:2px,color:#f4f4f5;
    classDef backend fill:#18181b,stroke:#dc2626,stroke-width:2px,color:#f4f4f5;
    classDef storage fill:#18181b,stroke:#059669,stroke-width:2px,color:#f4f4f5;
    classDef db fill:#18181b,stroke:#2563eb,stroke-width:2px,color:#f4f4f5;

    Frontend["<b>Frontend Client (Next.js 16)</b><br/>• React Server Components (RSC)<br/>• Tailwind CSS Dark-Mode Theme<br/>• Recharts Analytics Engine"]:::client
    Backend["<b>Backend Core API (Laravel 13)</b><br/>• RESTful API Architecture<br/>• Laravel Sanctum Auth<br/>• Eloquent Dynamic Accessors"]:::backend
    ObjectStorage[("<b>Object Storage (Supabase S3)</b><br/>• Direct Asset Images<br/>• Public Bucket Distribution")]:::storage
    RelationalDB[("<b>Relational Database (MySQL 8)</b><br/>• Strict Constraints & Foreign Keys<br/>• Transactional Acid Processing")]:::db

    Frontend -->|"HTTPS / JSON API (Bearer Token)"| Backend
    Backend -->|"AWS S3 SDK (Flysystem Driver)"| ObjectStorage
    Backend -->|"PDO / Eloquent Queries"| RelationalDB
```

```
[ Pengadaan Aset ]
       │
       ▼
[ Registrasi & Valuasi ] ──────► [ Auto-Generate QR Code ] ───► [ Sinkronisasi S3 Media ]
       │
       ▼
[ Operasional Inventaris ] ◄────► [ Mutasi Status & Immutable Audit Trail (AssetLog) ]
   ├─ Tersedia (Available)
   ├─ Dipinjam (Borrowed)
   └─ Perbaikan (In Repair)
       │
       ▼
[ Depresiasi Berkala ] ────────► [ Valuasi Nilai Buku Riil Tiap Tahun Buku ]
       │
       ▼
[ 100% Tersusut ] ─────────────► [ Rekomendasi Disposed / Afkir Barang ]
```

### Penjelasan Tahapan
* **Registrasi & Kodifikasi:** Aset baru didaftarkan ke sistem dengan membangkitkan kode unik berformat `AST-{timestamp}-{random}`. Foto aset diunggah ke bucket Supabase S3 dengan header tipe MIME yang presisi.
* **Sirkulasi Operasional:**
  * `available`: Unit berada di ruang penyimpanan dan siap diajukan untuk peminjaman.
  * `borrowed`: Unit sedang aktif digunakan; status ini mengunci aset agar tidak dapat dipinjam ganda.
  * `in_repair`: Unit mengalami kerusakan teknis dan dialihkan ke dalam antrean pemeliharaan.
  * `disposed`: Unit telah dihapus dari inventaris aktif karena rusak total atau dilelang.
* **Audit Trail Otomatis:** Setiap mutasi status dieksekusi dalam `DB::transaction` dan otomatis mencatat riwayat ke tabel `asset_logs` beserta catatan inspeksi dan identitas admin.

---

## 📈 Mesin Perhitungan Finansial (EAM)

SayPraz mengimplementasikan standar akuntansi **Metode Garis Lurus (*Straight-Line Depreciation Method*)** secara dinamis menggunakan accessor model Eloquent di backend.

### Formula Matematika

* **Beban Penyusutan Tahunan ($D$):**
  $$D = \frac{\text{Harga Perolehan} - \text{Nilai Residu}}{\text{Masa Manfaat}}$$

* **Akumulasi Penyusutan ($AD$):**
  $$AD = D \times \min\Big(\max(0, \text{Tahun Berjalan} - \text{Tahun Pembelian}), \text{Masa Manfaat}\Big)$$

* **Nilai Buku Bersih Terkini ($NBV$):**
  $$NBV = \max(\text{Nilai Residu}, \text{Harga Perolehan} - AD)$$

* **Persentase Tersusut:**
  $$\% \text{ Tersusut} = \left(\frac{AD}{\text{Harga Perolehan}}\right) \times 100\%$$

---

## 👥 Matriks Hak Akses (RBAC)

Pemisahan tanggung jawab diatur secara terstruktur melalui sistem peran:

| Fitur / Kemampuan | Administrator | Staf Sarpras | Siswa / Guru |
| :--- | :---: | :---: | :---: |
| **Registrasi & Edit Master Aset** | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Konfigurasi Parameter Finansial** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Monitoring Valuasi & Laporan Depresiasi** | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Persetujuan & Mutasi Peminjaman Fisik** | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Pencetakan Label QR Code Unit** | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Inspeksi Rekam Jejak Audit (Logs)** | ✅ Ya | ✅ Ya | ❌ Tidak |
| **Akses E-Catalog & Pengajuan Pinjam** | ❌ Tidak | ❌ Tidak | ✅ Ya |

---

## 🗄️ Struktur Basis Data

Skema database dirancang menggunakan relasi integritas referensial penuh:

```text
categories (1) ────< (N) assets (1) ────< (N) asset_logs (N) >──── (1) users
                            │
                            └────< (N) transactions (N) >──── (1) users
```

Panduan Instalasi
1. Kebutuhan Sistem
PHP 8.2 atau 8.3 dengan ekstensi PDO, OpenSSL, BCMath, cURL

Node.js 20+ & npm / pnpm

MySQL 8.0+

Composer 2+

2. Konfigurasi Backend (Laravel 13)
Bash
# Clone repository
git clone [https://github.com/your-username/saypraz-backend.git](https://github.com/your-username/saypraz-backend.git)
cd saypraz-backend

# Install dependensi PHP
composer install

# Siapkan environment file
cp .env.example .env

# Generate APP_KEY
php artisan key:generate

# Konfigurasikan file .env (Database & Supabase S3 Credentials)
# DB_DATABASE=peminjaman
# AWS_ACCESS_KEY_ID=your_supabase_key
# AWS_SECRET_ACCESS_KEY=your_supabase_secret
# AWS_DEFAULT_REGION=us-east-1
# AWS_BUCKET=assets
# AWS_ENDPOINT=[https://your-project.supabase.co/storage/v1/s3](https://your-project.supabase.co/storage/v1/s3)

# Jalankan migrasi dan seeder
php artisan migrate --seed

# Jalankan development server
php artisan serve
3. Konfigurasi Frontend (Next.js 16)
Bash
# Pindah ke direktori frontend
cd ../saypraz-frontend

# Install paket JavaScript
npm install

# Siapkan environment client
cp .env.example .env.local

# Sesuaikan endpoint API pada .env.local
# NEXT_PUBLIC_API_URL=http://localhost:8000

# Jalankan server Next.js
npm run dev
Aplikasi dapat diakses melalui browser pada http://localhost:3000.
