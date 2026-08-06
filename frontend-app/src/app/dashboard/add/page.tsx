/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  PackagePlus,
  QrCode,
  Type,
  Tag,
  FolderOpen,
  CalendarDays,
  ChevronDown,
  UploadCloud, 
  X,          
  ImageIcon,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface Category {
  id: number;
  name: string;
}

// ==========================================
// KOMPONEN SKELETON HALAMAN TAMBAH ASET (1:1 PRESISI)
// ==========================================
function AddFormSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-md bg-zinc-900 border border-zinc-800" />
          <div className="space-y-2">
            <div className="h-7 w-60 rounded-md bg-zinc-800" />
            <div className="h-4 w-80 rounded-md bg-zinc-900" />
          </div>
        </div>

        {/* Card Form Skeleton */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 animate-pulse space-y-8">
          
          <div className="space-y-6">
            {/* 1. Skeleton Foto Aset */}
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-zinc-800" />
              <div className="h-36 w-full rounded-xl bg-zinc-900/60 border-2 border-dashed border-zinc-800/80" />
            </div>

            {/* 2. Skeleton Nama & Merek */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-20 rounded bg-zinc-800" />
                <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
              </div>
            </div>

            {/* 3. Skeleton Kategori & Tahun Pembelian */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="h-3 w-24 rounded bg-zinc-800" />
                <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
              </div>
              <div className="space-y-2">
                <div className="h-3 w-32 rounded bg-zinc-800" />
                <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
              </div>
            </div>
          </div>

          {/* 4. Skeleton Sistem QR Otomatis Box */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-zinc-800" />
              <div className="h-3 w-64 rounded bg-zinc-900" />
            </div>
            <div className="h-11 w-full sm:w-56 rounded-md bg-zinc-950 border border-zinc-800" />
          </div>

          <hr className="border-zinc-800/60" />

          {/* 5. Skeleton Action Buttons */}
          <div className="flex items-center justify-end gap-3 pt-2">
            <div className="h-11 w-20 rounded-md bg-zinc-900 border border-zinc-800" />
            <div className="h-11 w-36 rounded-md bg-zinc-800" />
          </div>

        </div>
      </div>
    </div>
  );
}

export default function AddAssetPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoadingCategories, setIsLoadingCategories] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  // State File & Preview Gambar
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  // State Modal Lightbox Gambar Layar Lebar
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  const generateQRCode = () => {
    const timestamp = Date.now().toString().slice(-6);
    const randomNum = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `AST-${timestamp}-${randomNum}`;
  };

  const [formData, setFormData] = useState({
    name: "",
    brand: "",
    qr_code: "",
    category_id: "",
    status: "available",
    purchase_year: new Date().getFullYear().toString(),
  });

  useEffect(() => {
    setFormData((prev) => ({ ...prev, qr_code: generateQRCode() }));

    const fetchCategories = async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      try {
        const response = await fetch(`${API_URL}/api/categories`, {
          headers: {
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`,
          },
        });
        if (response.ok) {
          const result = await response.json();
          setCategories(result.data || []);
        }
      } catch (error) {
        console.error("Gagal memuat kategori:", error);
      } finally {
        setTimeout(() => setIsLoadingCategories(false), 300);
      }
    };

    fetchCategories();
  }, [router]);

  // Handler Tutup Modal Lightbox jika tombol ESC ditekan
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setIsLightboxOpen(false);
    };
    if (isLightboxOpen) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLightboxOpen]);

  // Handler Pilih Gambar & Generate URL Preview
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal adalah 5MB!");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  // Handler Hapus Gambar yang Dipilih
  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
    setIsLightboxOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const token = localStorage.getItem("token");

    // Gunakan FormData untuk mengirim file biner
    const payload = new FormData();
    payload.append("name", formData.name);
    payload.append("brand", formData.brand);
    payload.append("qr_code", formData.qr_code);
    payload.append("category_id", formData.category_id);
    payload.append("status", formData.status);
    payload.append("purchase_year", formData.purchase_year);

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    try {
      const response = await fetch(`${API_URL}/api/assets`, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: payload,
      });

      const result = await response.json();

      if (response.ok || response.status === 201) {
        router.push("/dashboard");
      } else if (response.status === 422) {
        setFormErrors(result.errors || {});
      } else {
        alert(result.message || "Terjadi kesalahan sistem.");
      }
    } catch (error) {
      alert("Gagal menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  if (isLoadingCategories) return <><FontKillerStyles /><AddFormSkeleton /></>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8">
      <FontKillerStyles />
      
      <div className="mx-auto max-w-2xl space-y-6">
        
        {/* Navigasi & Header */}
        <div className="flex items-center gap-4">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <PackagePlus className="h-6 w-6 text-zinc-400" />
              Penambahan Aset Baru
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Masukkan detail spesifikasi aset ke dalam sistem inventaris.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              
              {/* INPUT GAMBAR ASET WITH FULL-SCREEN LIGHTBOX PREVIEW */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-zinc-400" />
                  Foto Aset <span className="text-zinc-500 font-normal lowercase">(opsional)</span>
                </label>

                {!imagePreview ? (
                  <label className="flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-800 hover:border-zinc-700 bg-zinc-900/30 hover:bg-zinc-900/60 rounded-xl cursor-pointer transition-all">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <UploadCloud className="w-8 h-8 mb-2 text-zinc-400" />
                      <p className="text-sm text-zinc-300 font-medium">Klik untuk upload foto aset</p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP (Maksimal 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative w-full h-52 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer group transition-all hover:border-zinc-700"
                  >
                    <Image 
                      src={imagePreview} 
                      alt="Preview Foto Aset" 
                      fill 
                      className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    
                    {/* Subtle Overlay Badge Info saat Hover */}
                    <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-start p-3">
                      <span className="bg-zinc-900/80 backdrop-blur-md text-xs text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700/60 font-medium shadow-lg">
                        Klik untuk memperbesar gambar
                      </span>
                    </div>
                  </div>
                )}
                {formErrors.image && <p className="text-xs text-red-500 mt-1">{formErrors.image[0]}</p>}
              </div>

              {/* Baris 1: Nama & Merek */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Nama Aset <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      value={formData.name} 
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 text-zinc-100 h-11 transition-all" 
                      placeholder="Cth: Proyektor Epson EB-X51" 
                      required 
                    />
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-indigo-400 transition-colors" />
                  </div>
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name[0]}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Merek <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      value={formData.brand} 
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                      className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 text-zinc-100 h-11 transition-all" 
                      placeholder="Cth: Epson" 
                      required 
                    />
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-indigo-400 transition-colors" />
                  </div>
                  {formErrors.brand && <p className="text-xs text-red-500">{formErrors.brand[0]}</p>}
                </div>
              </div>

              {/* Baris 2: Kategori & Tahun Beli */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <select 
                      value={formData.category_id} 
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})}
                      className="peer appearance-none flex h-11 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pl-10 pr-8 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-indigo-500/50 cursor-pointer transition-all"
                      required
                    >
                      <option value="" className="bg-zinc-900">-- Pilih Kategori --</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>
                      ))}
                    </select>
                    <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-indigo-400 pointer-events-none transition-colors" />
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {formErrors.category_id && <p className="text-xs text-red-500">{formErrors.category_id[0]}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Tahun Pembelian <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Input 
                      type="number" 
                      value={formData.purchase_year} 
                      onChange={(e) => setFormData({...formData, purchase_year: e.target.value})}
                      className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-indigo-500/50 text-zinc-100 h-11 transition-all" 
                      min="1900" 
                      max={new Date().getFullYear()} 
                      required 
                    />
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-indigo-400 transition-colors" />
                  </div>
                  {formErrors.purchase_year && <p className="text-xs text-red-500">{formErrors.purchase_year[0]}</p>}
                </div>
              </div>
            </div>

            {/* Baris 3: Tampilan QR Code (Auto-generated & Read Only) */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2">
                  <QrCode className="h-4 w-4 text-zinc-400" />
                  Sistem QR Otomatis
                </label>
                <p className="text-sm text-zinc-500 max-w-sm">Kode ini di-generate secara cerdas untuk memastikan keunikan data di dalam sistem.</p>
              </div>
              <div className="w-full sm:w-auto text-right">
                <Input 
                  value={formData.qr_code} 
                  readOnly
                  className="appearance-none bg-zinc-950 border-zinc-800/80 text-zinc-100 h-11 font-mono uppercase font-bold text-center cursor-not-allowed select-none w-full sm:w-56 focus-visible:ring-0" 
                />
                {formErrors.qr_code && <p className="text-xs text-red-500 mt-1">{formErrors.qr_code[0]}</p>}
              </div>
            </div>

            <hr className="border-zinc-800/60" />

            {/* Action Buttons */}
            <div className="flex items-center justify-end gap-3 pt-2">
              <Button 
                type="button" 
                variant="ghost" 
                onClick={() => router.back()} 
                className="text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 h-11 px-6 rounded-md"
              >
                Batal
              </Button>
              <Button 
                type="submit" 
                disabled={isSubmitting} 
                className="bg-slate-600 hover:bg-slate-800 text-white gap-2 h-11 px-8 font-semibold rounded-md shadow-lg shadow-slate-900/40 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? "Menyimpan Data..." : "Tambah Aset"}
              </Button>
            </div>

          </form>
        </div>
      </div>

      {/* MODAL OVERLAY LIGHTBOX GAMBAR FULLSCREEN */}
      {isLightboxOpen && imagePreview && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
          {/* Header Action Bar Modal (Hapus Foto & Tutup Modal) */}
          <div 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              variant="destructive"
              size="sm"
              onClick={handleRemoveImage}
              className="gap-2 shadow-xl"
            >
              <Trash2 className="h-4 w-4" />
              Hapus Foto
            </Button>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsLightboxOpen(false)}
              className="h-9 w-9 rounded-full border-zinc-700 bg-zinc-900/80 text-zinc-300 hover:text-white hover:bg-zinc-800 shadow-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* Container Gambar Utama */}
          <div 
            className="relative w-full max-w-4xl max-h-[85vh] h-[80vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <Image 
              src={imagePreview} 
              alt="Detail Gambar Aset Fullscreen" 
              fill 
              className="object-contain"
              priority
            />
          </div>
        </div>
      )}

    </div>
  );
}