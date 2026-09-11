/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Pencil, 
  QrCode, 
  Type, 
  Tag, 
  FolderOpen, 
  CalendarDays, 
  ChevronDown,
  UploadCloud,
  X,
  ImageIcon,
  DollarSign,
  Clock,
  Coins,
  ArchiveX,
  Trash2,
  FileText
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface Category { id: number; name: string; }

// Helper format tanggal lokal presisi (YYYY-MM-DD)
const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// ==========================================
// KOMPONEN SKELETON HALAMAN EDIT (1:1 PRESISI)
// ==========================================
function EditFormSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Header Skeleton */}
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-md bg-zinc-900 border border-zinc-800" />
          <div className="space-y-2">
            <div className="h-7 w-56 rounded-md bg-zinc-800" />
            <div className="h-4 w-72 rounded-md bg-zinc-900" />
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

            {/* 3. Skeleton Kategori & Tanggal Pembelian */}
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

            {/* 4. Skeleton Status Aset */}
            <div className="space-y-2">
              <div className="h-3 w-24 rounded bg-zinc-800" />
              <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
            </div>

            {/* 5. Skeleton Nilai Finansial */}
            <div className="space-y-4 pt-2 border-t border-zinc-800/60">
              <div className="h-4 w-44 rounded bg-zinc-800" />
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-zinc-800" />
                  <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-zinc-800" />
                  <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
                </div>
                <div className="space-y-2">
                  <div className="h-3 w-28 rounded bg-zinc-800" />
                  <div className="h-11 rounded-md bg-zinc-900 border border-zinc-800" />
                </div>
              </div>
            </div>
          </div>

          {/* 6. Skeleton QR Code Box */}
          <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="space-y-2">
              <div className="h-4 w-48 rounded bg-zinc-800" />
              <div className="h-3 w-72 rounded bg-zinc-900" />
            </div>
            <div className="h-11 w-full sm:w-48 rounded-md bg-zinc-950 border border-zinc-800" />
          </div>

          <hr className="border-zinc-800/60" />

          {/* 7. Skeleton Action Buttons (Presisi 3 Kiri, 1 Kanan) */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
            <div className="flex items-center gap-2.5 w-full sm:w-auto">
              <div className="h-10 w-full sm:w-36 rounded-md bg-zinc-900 border border-zinc-800" />
              <div className="h-10 w-full sm:w-36 rounded-md bg-zinc-900 border border-zinc-800" />
              <div className="h-10 w-full sm:w-32 rounded-md bg-zinc-900 border border-zinc-800" />
            </div>
            <div className="w-full sm:w-auto flex justify-end">
              <div className="h-10 w-full sm:w-44 rounded-md bg-zinc-800" />
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}

export default function EditAssetPage() {
  const router = useRouter();
  const params = useParams();
  const assetId = params.id;

  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [imageError, setImageError] = useState(false);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Modal State untuk Disposal (Pelepasan Aset)
  const [isDisposalModalOpen, setIsDisposalModalOpen] = useState(false);
  const [isDisposing, setIsDisposing] = useState(false);
  const [disposalData, setDisposalData] = useState({
    disposal_date: getTodayLocalDate(),
    disposal_value: "0",
    disposal_reason: ""
  });

  const [formData, setFormData] = useState({
    name: "", 
    brand: "", 
    qr_code: "", 
    category_id: "", 
    status: "available", 
    purchase_date: "",
    purchase_price: "",
    useful_life: "5",
    residual_value: "0",
    is_disposed: false
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      try {
        const catResponse = await fetch(`${API_URL}/api/categories`, { 
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } 
        });
        if (catResponse.ok) {
          const catResult = await catResponse.json();
          setCategories(catResult.data || []);
        }

        const assetResponse = await fetch(`${API_URL}/api/assets/${assetId}`, { 
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } 
        });

        if (assetResponse.ok) {
          const assetResult = await assetResponse.json();
          const asset = assetResult.data;
          
          setFormData({
            name: asset.name || "",
            brand: asset.brand || "",
            qr_code: asset.qr_code || "",
            category_id: asset.category_id ? asset.category_id.toString() : "",
            status: asset.status || "available",
            purchase_date: asset.purchase_date || "",
            purchase_price: asset.purchase_price !== null && asset.purchase_price !== undefined ? Math.round(Number(asset.purchase_price)).toString() : "",
            useful_life: asset.useful_life !== null && asset.useful_life !== undefined ? asset.useful_life.toString() : "5",
            residual_value: asset.residual_value !== null && asset.residual_value !== undefined ? Math.round(Number(asset.residual_value)).toString() : "0",
            is_disposed: asset.is_disposed || false
          });

          if (asset.image_url) {
            setImagePreview(asset.image_url);
            setImageError(false);
          }
        } else {
          alert("Gagal menemukan data aset.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setIsLoadingData(false), 300);
      }
    };

    if (assetId) fetchInitialData();
  }, [router, assetId]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setIsLightboxOpen(false);
        setIsDisposalModalOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("Ukuran gambar maksimal adalah 5MB!");
        return;
      }
      setSelectedFile(file);
      setImagePreview(URL.createObjectURL(file));
      setImageError(false);
    }
  };

  const handleRemoveImage = () => {
    setSelectedFile(null);
    if (imagePreview && imagePreview.startsWith("blob:")) {
      URL.revokeObjectURL(imagePreview);
    }
    setImagePreview(null);
    setImageError(false);
    setIsLightboxOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const token = localStorage.getItem("token");

    const payload = new FormData();
    payload.append("_method", "PUT");
    payload.append("name", formData.name);
    payload.append("brand", formData.brand);
    payload.append("qr_code", formData.qr_code);
    payload.append("category_id", formData.category_id);
    payload.append("status", formData.status);
    payload.append("purchase_date", formData.purchase_date);
    payload.append("purchase_price", formData.purchase_price);
    payload.append("useful_life", formData.useful_life);
    payload.append("residual_value", formData.residual_value || "0");

    if (selectedFile) {
      payload.append("image", selectedFile);
    }

    try {
      const response = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: "POST", 
        headers: { 
          "Accept": "application/json", 
          "Authorization": `Bearer ${token}` 
        },
        body: payload,
      });

      const result = await response.json();

      if (response.ok || response.status === 200) {
        router.push("/dashboard");
      } else if (response.status === 422) {
        setFormErrors(result.errors || {});
      } else {
        alert(result.message || "Terjadi kesalahan sistem.");
      }
    } catch {
      alert("Gagal menghubungi server.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Eksekusi Pelepasan Aset (Disposal)
  const handleDisposeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsDisposing(true);
    const token = localStorage.getItem("token");

    const resolvedDate = disposalData.disposal_date && disposalData.disposal_date.trim() !== "" 
      ? disposalData.disposal_date 
      : getTodayLocalDate();

    const payload = {
      disposal_date: resolvedDate,
      disposal_value: Number(disposalData.disposal_value) || 0,
      disposal_reason: disposalData.disposal_reason.trim()
    };

    try {
      const response = await fetch(`${API_URL}/api/assets/${assetId}/dispose`, {
        method: "POST",
        headers: { 
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}` 
        },
        body: JSON.stringify(payload)
      });

      const result = await response.json();

      if (response.ok) {
        alert("Aset berhasil dihapusbukukan (disposed) beserta seluruh jurnal penutupnya.");
        router.push("/dashboard");
      } else if (response.status === 422) {
        if (result.errors) {
          const firstError = Object.values(result.errors)[0] as string[];
          alert(`Validasi gagal: ${firstError[0]}`);
        } else {
          alert(result.message || "Data pelepasan tidak valid.");
        }
      } else {
        alert(result.message || "Gagal melakukan pelepasan aset.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsDisposing(false);
      setIsDisposalModalOpen(false);
    }
  };

  // Eksekusi Hard Delete (Hapus Permanen)
  const handleHardDelete = async () => {
    const confirmDelete = window.confirm(
      "PERINGATAN: Aset ini beserta seluruh riwayatnya akan dihapus permanen dari basis data. Tindakan ini tidak dapat dibatalkan. Apakah Anda yakin?"
    );
    if (!confirmDelete) return;

    setIsDeleting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: "DELETE",
        headers: {
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        }
      });

      const result = await response.json();

      if (response.ok) {
        alert("Aset berhasil dihapus permanen.");
        router.push("/dashboard");
      } else {
        alert(result.message || "Gagal menghapus aset.");
      }
    } catch {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsDeleting(false);
    }
  };

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
      
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.6);
        cursor: pointer;
      }
    `}} />
  );

  if (isLoadingData) return <><FontKillerStyles /><EditFormSkeleton /></>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8">
      <FontKillerStyles />
      <div className="mx-auto max-w-3xl space-y-6">
        
        {/* Navigasi & Header */}
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Pencil className="h-6 w-6 text-zinc-400" /> Kelola & Edit Aset
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Perbarui detail atau kelola penghapusan barang inventaris ini.</p>
          </div>
        </div>

        {formData.is_disposed && (
          <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 p-4 flex items-center gap-3">
            <ArchiveX className="h-5 w-5 text-rose-400" />
            <p className="text-sm font-medium text-rose-300">
              Aset ini telah berstatus Disposed (Dihapusbukukan). Seluruh pembaruan data dinonaktifkan.
            </p>
          </div>
        )}

        {/* Card Form */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className={`space-y-6 ${formData.is_disposed ? 'pointer-events-none' : ''}`}>
              
              {/* Foto Aset */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
                  <ImageIcon className="h-4 w-4 text-zinc-400" />
                  Foto Aset
                </label>

                {!imagePreview ? (
                  <label className={`flex flex-col items-center justify-center w-full h-36 border-2 border-dashed border-zinc-800 bg-zinc-900/30 rounded-xl transition-all ${formData.is_disposed ? 'cursor-not-allowed opacity-50' : 'hover:border-zinc-700 hover:bg-zinc-900/60 cursor-pointer'}`}>
                    <div className="flex flex-col items-center justify-center pt-5 pb-6 text-center px-4">
                      <UploadCloud className="w-8 h-8 mb-2 text-zinc-400" />
                      <p className="text-sm text-zinc-300 font-medium">Klik untuk upload foto aset baru</p>
                      <p className="text-xs text-zinc-500 mt-1">PNG, JPG, WEBP (Maksimal 5MB)</p>
                    </div>
                    <input 
                      type="file" 
                      accept="image/png, image/jpeg, image/jpg, image/webp"
                      onChange={handleFileChange}
                      disabled={formData.is_disposed}
                      className="hidden" 
                    />
                  </label>
                ) : (
                  <div 
                    onClick={() => setIsLightboxOpen(true)}
                    className="relative w-full h-52 rounded-xl overflow-hidden border border-zinc-800 bg-zinc-950 cursor-pointer group transition-all hover:border-zinc-700"
                  >
                    {!imageError ? (
                      <Image 
                        src={imagePreview} 
                        alt="Preview Foto Aset" 
                        fill 
                        unoptimized
                        onError={() => setImageError(true)}
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <img 
                        src={imagePreview} 
                        alt="Preview Foto Aset" 
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    )}
                    
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
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Aset <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input 
                      value={formData.name} 
                      readOnly={formData.is_disposed}
                      onChange={(e) => setFormData({...formData, name: e.target.value})} 
                      className={`peer pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 h-11 transition-all ${formData.is_disposed ? 'cursor-default focus-visible:ring-0' : 'focus-visible:ring-1 focus-visible:ring-zinc-500/50'}`} 
                      required 
                    />
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Merek <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input 
                      value={formData.brand} 
                      readOnly={formData.is_disposed}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})} 
                      className={`peer pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 h-11 transition-all ${formData.is_disposed ? 'cursor-default focus-visible:ring-0' : 'focus-visible:ring-1 focus-visible:ring-zinc-500/50'}`} 
                      required 
                    />
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {formErrors.brand && <p className="text-xs text-red-500">{formErrors.brand[0]}</p>}
                </div>
              </div>

              {/* Baris 2: Kategori & Tanggal Pembelian */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kategori</label>
                  <div className="relative">
                    <select 
                      value={formData.category_id} 
                      disabled={formData.is_disposed}
                      onChange={(e) => setFormData({...formData, category_id: e.target.value})} 
                      className={`peer appearance-none flex h-11 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pl-10 pr-8 text-sm text-zinc-100 transition-all ${formData.is_disposed ? 'cursor-default focus:ring-0' : 'focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer'}`}
                    >
                      <option value="" className="bg-zinc-900">-- Tanpa Kategori --</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>))}
                    </select>
                    <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 pointer-events-none" />
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {formErrors.category_id && <p className="text-xs text-red-500">{formErrors.category_id[0]}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tanggal Pembelian <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input 
                      type="date" 
                      value={formData.purchase_date} 
                      readOnly={formData.is_disposed}
                      onChange={(e) => setFormData({...formData, purchase_date: e.target.value})} 
                      className={`peer pl-10 bg-zinc-900/50 border-zinc-800 text-zinc-100 h-11 transition-all [color-scheme:dark] ${formData.is_disposed ? 'cursor-default focus-visible:ring-0' : 'focus-visible:ring-1 focus-visible:ring-zinc-500/50'}`} 
                      max={getTodayLocalDate()} 
                      required 
                    />
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {formErrors.purchase_date && <p className="text-xs text-red-500">{formErrors.purchase_date[0]}</p>}
                </div>
              </div>

              {/* Baris 3: Status Aset */}
              <div className="space-y-2">
                 <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status Aset <span className="text-red-500">*</span></label>
                 <div className="relative">
                   <select 
                     value={formData.status} 
                     disabled={formData.is_disposed}
                     onChange={(e) => setFormData({...formData, status: e.target.value})} 
                     className={`peer appearance-none flex h-11 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pl-3 pr-8 text-sm text-zinc-100 transition-all ${formData.is_disposed ? 'cursor-default focus:ring-0' : 'focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer'}`}
                     required
                   >
                      <option value="available" className="bg-zinc-900">Tersedia (Siap Dipinjam)</option>
                      <option value="borrowed" className="bg-zinc-900">Sedang Dipinjam</option>
                      <option value="in_repair" className="bg-zinc-900">Dalam Perbaikan</option>
                      {formData.is_disposed && <option value={formData.status} className="bg-zinc-900">Dihapusbukukan (Disposed)</option>}
                   </select>
                   <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                 </div>
                 {formErrors.status && <p className="text-xs text-red-500">{formErrors.status[0]}</p>}
              </div>

              {/* Baris 4: Modul Finansial */}
              <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-5 space-y-4">
                <div className="flex items-center gap-2">
                  <Coins className="h-4 w-4 text-zinc-400" />
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-300">
                    Data Finansial & Depresiasi Aset
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  {/* Harga Beli */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">
                      Harga Perolehan (Rp) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input 
                        type="number"
                        placeholder="Contoh: 15000000"
                        value={formData.purchase_price}
                        readOnly={formData.is_disposed}
                        onChange={(e) => setFormData({...formData, purchase_price: e.target.value})}
                        className={`peer pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 h-11 font-mono text-sm ${formData.is_disposed ? 'cursor-default focus-visible:ring-0' : 'focus-visible:ring-1 focus-visible:ring-zinc-500/50'}`}
                        min="0"
                        required
                      />
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                    {formErrors.purchase_price && <p className="text-xs text-red-500">{formErrors.purchase_price[0]}</p>}
                  </div>

                  {/* Masa Manfaat */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">
                      Masa Manfaat (Thn) <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <Input 
                        type="number"
                        placeholder="Contoh: 5"
                        value={formData.useful_life}
                        readOnly={formData.is_disposed}
                        onChange={(e) => setFormData({...formData, useful_life: e.target.value})}
                        className={`peer pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 h-11 font-mono text-sm ${formData.is_disposed ? 'cursor-default focus-visible:ring-0' : 'focus-visible:ring-1 focus-visible:ring-zinc-500/50'}`}
                        min="1"
                        max="50"
                        required
                      />
                      <Clock className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                    {formErrors.useful_life && <p className="text-xs text-red-500">{formErrors.useful_life[0]}</p>}
                  </div>

                  {/* Nilai Residu */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-zinc-400">
                      Nilai Residu / Sisa (Rp)
                    </label>
                    <div className="relative">
                      <Input 
                        type="number"
                        placeholder="Default: 0"
                        value={formData.residual_value}
                        readOnly={formData.is_disposed}
                        onChange={(e) => setFormData({...formData, residual_value: e.target.value})}
                        className={`peer pl-9 bg-zinc-950/60 border-zinc-800 text-zinc-100 h-11 font-mono text-sm ${formData.is_disposed ? 'cursor-default focus-visible:ring-0' : 'focus-visible:ring-1 focus-visible:ring-zinc-500/50'}`}
                        min="0"
                      />
                      <Coins className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-zinc-500 pointer-events-none" />
                    </div>
                    {formErrors.residual_value && <p className="text-xs text-red-500">{formErrors.residual_value[0]}</p>}
                  </div>
                </div>
              </div>

            </div>

            {/* QR Code */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2"><QrCode className="h-4 w-4 text-zinc-400" /> QR Code (Identitas Unik)</label>
                <p className="text-sm text-zinc-500">Kode ini bersifat unik dan tidak dapat diubah setelah aset didaftarkan.</p>
              </div>
              <div className="w-full sm:w-auto text-right">
                <Input value={formData.qr_code} readOnly className="appearance-none bg-zinc-950 border-zinc-800/80 text-zinc-100 h-11 font-mono font-bold text-center cursor-not-allowed select-none w-full sm:w-48 focus-visible:ring-0" />
              </div>
            </div>

            <hr className="border-zinc-800/60" />

            {/* Action Buttons: Presisi Rata Sejajar (3 Kiri, 1 Kanan) */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 pt-2">
              
              {/* KELOMPOK KIRI: Pelepasan Aset, Hapus Permanen, Cetak Label */}
              <div className="flex flex-wrap sm:flex-nowrap items-center gap-2.5 w-full sm:w-auto pointer-events-auto">
                {!formData.is_disposed && (
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={() => setIsDisposalModalOpen(true)} 
                    disabled={isSubmitting || isDeleting}
                    className="flex-1 sm:flex-initial border-amber-500/30 text-amber-400 hover:bg-amber-500 hover:text-black h-10 px-3.5 rounded-md gap-2 transition-all text-xs font-medium"
                  >
                    <ArchiveX className="h-4 w-4" />
                    Pelepasan Aset
                  </Button>
                )}

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={handleHardDelete} 
                  disabled={isSubmitting || isDeleting}
                  className="flex-1 sm:flex-initial border-rose-500/30 text-rose-400 hover:bg-rose-500 hover:text-white h-10 px-3.5 rounded-md gap-2 transition-all text-xs font-medium"
                >
                  {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                  Hapus Permanen
                </Button>

                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => router.push(`/dashboard/assets/print-qr/${assetId}`)}
                  disabled={isSubmitting || isDeleting}
                  className="flex-1 sm:flex-initial border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 hover:text-zinc-100 gap-2 h-10 px-3.5 rounded-md transition-all text-xs font-medium"
                >
                  <QrCode className="h-4 w-4 text-zinc-400" />
                  Cetak Label
                </Button>
              </div>

              {/* KELOMPOK KANAN: Simpan Perubahan */}
              <div className="w-full sm:w-auto flex justify-end pointer-events-auto">
                {!formData.is_disposed && (
                  <Button 
                    type="submit" 
                    disabled={isSubmitting || isDeleting} 
                    className="w-full sm:w-auto bg-zinc-100 hover:bg-white text-zinc-950 gap-2 h-10 px-7 font-semibold rounded-md shadow-lg shadow-black/40 transition-all text-xs"
                  >
                    {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                    Simpan Perubahan
                  </Button>
                )}
              </div>
            </div>

          </form>
        </div>
      </div>

      {/* MODAL OVERLAY PELEPASAN ASET (DISPOSAL) */}
      {isDisposalModalOpen && (
        <div 
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setIsDisposalModalOpen(false)}
        >
          <div 
            className="w-full max-w-md bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 sm:p-7 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-2 text-center">
              <div className="mx-auto w-12 h-12 bg-amber-500/10 rounded-full flex items-center justify-center border border-amber-500/20">
                <ArchiveX className="h-6 w-6 text-amber-500" />
              </div>
              <h2 className="text-xl font-bold text-zinc-100 tracking-tight">Pelepasan Aset (Disposal)</h2>
              <p className="text-xs text-zinc-400 max-w-xs mx-auto">
                Aset ini akan dihapusbukukan secara permanen dan sistem akan menerbitkan jurnal akuntansi penutup.
              </p>
            </div>

            <form onSubmit={handleDisposeSubmit} className="space-y-4">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">
                  Tanggal Pelepasan <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="date" 
                  required 
                  max={getTodayLocalDate()}
                  value={disposalData.disposal_date}
                  onChange={(e) => setDisposalData({ ...disposalData, disposal_date: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-10 [color-scheme:dark]"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">
                  Nilai Jual / Lelang (Rp) <span className="text-red-500">*</span>
                </label>
                <Input 
                  type="number" 
                  required 
                  min="0"
                  placeholder="Isi 0 jika barang rusak/dibuang"
                  value={disposalData.disposal_value}
                  onChange={(e) => setDisposalData({ ...disposalData, disposal_value: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-100 font-mono h-10"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">
                  Alasan Pelepasan <span className="text-red-500">*</span>
                </label>
                <Input 
                  required 
                  placeholder="Cth: Rusak total, lelang, dll"
                  value={disposalData.disposal_reason}
                  onChange={(e) => setDisposalData({ ...disposalData, disposal_reason: e.target.value })}
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-10"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-10"
                  onClick={() => setIsDisposalModalOpen(false)}
                  disabled={isDisposing}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  className="w-full bg-amber-500 hover:bg-amber-400 text-zinc-950 font-semibold h-10 gap-1.5"
                  disabled={isDisposing}
                >
                  {isDisposing ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
                  Eksekusi
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL OVERLAY LIGHTBOX GAMBAR FULLSCREEN */}
      {isLightboxOpen && imagePreview && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setIsLightboxOpen(false)}
        >
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
              Hapus Foto
            </Button>
            
            <Button
              type="button"
              onClick={() => setIsLightboxOpen(false)}
              className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-950 text-white gap-2 h-11 px-8 font-semibold rounded-md shadow-lg shadow-indigo-900/20 transition-all"
            >
              <X className="h-4 w-4" />
              Tutup
            </Button>
          </div>

          <div 
            className="relative w-full max-w-4xl max-h-[85vh] h-[80vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            {!imageError ? (
              <Image 
                src={imagePreview} 
                alt="Detail Gambar Aset Fullscreen" 
                fill 
                unoptimized
                onError={() => setImageError(true)}
                className="object-contain"
                priority
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-zinc-500 text-sm">
                <p>Gagal memuat pratinjau gambar.</p>
              </div>
            )}
          </div>
        </div>
      )}

    </div>
  );
}