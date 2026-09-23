<div align="center">

# SayPraz
### Enterprise Asset Management (EAM), Accounting Ledger & Stock Circulation Platform

[![Laravel 13](https://img.shields.io/badge/Laravel%2013-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com)
[![Next.js 16](https://img.shields.io/badge/Next.js%2016-000000?style=for-the-badge&logo=next.js&logoColor=white)](https://nextjs.org)
[![Supabase S3](https://img.shields.io/badge/Supabase%20S3-3ECF8E?style=for-the-badge&logo=supabase&logoColor=white)](https://supabase.com)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS_v4-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![MySQL 8](https://img.shields.io/badge/MySQL%208-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](LICENSE)

<p align="center">
  Platform EAM modern berbasis arsitektur <i>Decoupled</i> (Headless API) untuk mengotomatisasi siklus hidup sarana-prasarana: perhitungan depresiasi finansial aset riil (Metode Garis Lurus), pembukuan buku besar otomatis (<i>Double-Entry Journal</i>), tiket perbaikan & kalkulasi TCO, scanner QR kamera web, cetak label massal A4, serta laporan PDF resmi siap audit.
</p>

[Gambaran Proyek](#-gambaran-proyek) •
[Arsitektur Sistem](#-arsitektur-sistem) •
[Siklus Hidup Aset (EAM Lifecycle)](#-siklus-hidup-aset-eam-lifecycle) •
[Mesin Finansial & Akuntansi](#-mesin-finansial--akuntansi) •
[Matriks Hak Akses](#-matriks-hak-akses-rbac) •
[Struktur Basis Data](#-struktur-basis-data) •
[Panduan Instalasi](#-panduan-instalasi)

</div>

---

## Gambaran Proyek

**SayPraz** dirancang untuk mentransformasi tata kelola logistik sekolah dan institusi pendidikan dari pembukuan manual menjadi ekosistem *Enterprise Resource Planning* (ERP) mini yang tangguh. Sistem ini menjawab tantangan utama pengelolaan sarpras:

1. **Discrepancy Fisik & Administratif:** Hilangnya jejak peminjaman dan sirkulasi liar diselesaikan melalui verifikasi QR Code terintegrasi via kamera browser langsung.
2. **Ketiadaan Valuasi Riil & Degradasi Nilai:** Nilai aset tidak lagi statis pada harga beli awal, melainkan terdepresiasi proporsional setiap bulan menggunakan metode akuntansi garis lurus.
3. **Dokumentasi Kerusakan & Beban Biaya:** Rekam jejak servis internal maupun vendor luar dicatat rapi ke dalam tiket kerja (*work orders*), menghitung akumulasi biaya riil kepemilikan aset (*Total Cost of Ownership*).
4. **Audit Finansial Terbuka:** Setiap aksi pelepasan aset (*disposal*) dan servis memicu penerbitan jurnal penutup berimbang (Debit/Kredit) secara otomatis yang siap dicetak ke format PDF berstandar resmi.

---

## Arsitektur Sistem

Platform mengadopsi arsitektur *decoupled* berkinerja tinggi yang memisahkan *presentation layer* modern dengan backend transaksional:

```mermaid
graph TD
    classDef client fill:#09090b,stroke:#27272a,stroke-width:2px,color:#f4f4f5;
    classDef backend fill:#18181b,stroke:#dc2626,stroke-width:2px,color:#f4f4f5;
    classDef storage fill:#18181b,stroke:#059669,stroke-width:2px,color:#f4f4f5;
    classDef db fill:#18181b,stroke:#2563eb,stroke-width:2px,color:#f4f4f5;

    Frontend["<b>Frontend Client (Next.js 16)</b><br/>• React Server Components (RSC)<br/>• Tailwind CSS Dark Architecture<br/>• In-Browser QR Scanner (Camera API)<br/>• Recharts Visual Engine & 1:1 Skeletons"]:::client
    Backend["<b>Backend Core API (Laravel 13)</b><br/>• RESTful Architecture & Sanctum Auth<br/>• Eloquent Dynamic Accessors & Casts<br/>• Monthly Cron Job Task Scheduler<br/>• DOMPDF Official Report Generator"]:::backend
    ObjectStorage[("<b>Object Storage (Supabase S3)</b><br/>• Direct Asset Photos Upload<br/>• Presigned MIME Distribution")]:::storage
    RelationalDB[("<b>Relational Database (MySQL 8)</b><br/>• Strict Foreign Key Integrity<br/>• ACID Transactional Commit")]:::db

    Frontend -->|"HTTPS / JSON API (Bearer Token)"| Backend
    Backend -->|"AWS S3 SDK (Flysystem Driver)"| ObjectStorage
    Backend -->|"PDO / Eloquent Queries"| RelationalDB

```

[ Pengadaan Aset ]
       │
       ▼
[ Registrasi & Valuasi ] ──────► [ Generate QR Unik ] ───► [ Cetak Satuan / Massal A4 ]
       │                                                              │
       ▼                                                              ▼
[ Operasional Inventaris ] ◄─────────────────────────────── [ Web Camera Scanner ]
   ├─ Tersedia (Available)
   ├─ Dipinjam (Borrowed) ──────► [ Transaksi & Riwayat Pengembalian ]
   ├─ Servis (In Repair) ───────► [ Tiket Perbaikan & Total Cost of Ownership (TCO) ]
   │                                  │
   │                                  ▼
   ├─ Depresiasi Bulanan (Cron) ──► [ Jurnal Beban Penyusutan (Buku Besar) ]
   │                                  │
   ▼                                  ▼
[ Pelepasan Aset (Disposal) ] ──► [ Jurnal Pengakuan Laba / Rugi Pelepasan ]
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

## Mesin Perhitungan Finansial (EAM)

SayPraz mengimplementasikan standar akuntansi **Metode Garis Lurus (*Straight-Line Depreciation Method*)** secara dinamis menggunakan accessor model Eloquent di backend.

### Formula Matematika

* **Beban Penyusutan Tahunan ($D$):**
  $$D = \frac{\text{Harga Perolehan} - \text{Nilai Residu}}{\text{Masa Manfaat}}$$

* **Akumulasi Penyusutan ($AD$):**
  $$AD = D \times \min\Big(\max(0, \text{Tahun Berjalan} - \text{Tahun Pembelian}), \text{Masa Manfaat}\Big)$$

* **Nilai Asset Bersih Terkini ($NBV$):**
  $$NBV = \max(\text{Nilai Residu}, \text{Harga Perolehan} - AD)$$

* **Persentase Tersusut:**
  $$\% \text{ Tersusut} = \left(\frac{AD}{\text{Harga Perolehan}}\right) \times 100\%$$

---

## Matriks Hak Akses (RBAC)

Pemisahan tanggung jawab diatur secara terstruktur melalui sistem peran:

| Fitur / Akses | Administrator | Staf Sarpras | Siswa / Guru |
| :--- | :---: | :---: | :---: |
| **Registrasi & Edit Master Aset** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Konfigurasi Parameter Finansial** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Monitoring Valuasi & Laporan Depresiasi** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Persetujuan & Mutasi Peminjaman Fisik** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Pencetakan Label QR Code Unit** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Inspeksi Rekam Jejak Audit (Logs)** | ✅ Ya | ❌ Tidak | ❌ Tidak |
| **Akses E-Catalog & Pengajuan Pinjam** | ❌ Tidak | ✅ Ya | ✅ Ya |

---

## Struktur Basis Data

Skema database dirancang menggunakan relasi integritas referensial penuh:

```text
categories (1) ────< (N) assets (1) ────< (N) asset_logs (N) >──── (1) users
                            │
                            └────< (N) transactions (N) >──── (1) users
```

Panduan Instalasi
1. Kebutuhan Sistem
```
PHP 8.2 atau 8.3 dengan ekstensi PDO, OpenSSL, BCMath, cURL

Node.js 20+ & npm / pnpm

MySQL 8.0+

Composer 2+
```

2. Konfigurasi Backend (Laravel 13)
~~~
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
~~~
3. Konfigurasi Frontend (Next.js 16)
~~~
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
~~~

~~~
Aplikasi dapat diakses melalui browser pada http://localhost:3000.
~~~
