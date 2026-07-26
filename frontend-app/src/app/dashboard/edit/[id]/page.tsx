/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { ArrowLeft, Save, Loader2, Pencil, QrCode, Type, Tag, FolderOpen, CalendarDays, Trash2, ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface Category { id: number; name: string; }

// ==========================================
// KOMPONEN SKELETON HALAMAN EDIT
// ==========================================
function EditFormSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 py-10 px-4 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-2xl space-y-6">
        <div className="flex items-center gap-4 animate-pulse">
          <div className="h-10 w-10 rounded-md bg-zinc-800" />
          <div className="space-y-2">
            <div className="h-6 w-48 rounded bg-zinc-800" />
            <div className="h-4 w-64 rounded bg-zinc-800/50" />
          </div>
        </div>
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-6 sm:p-8 animate-pulse space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2"><div className="h-3 w-24 rounded bg-zinc-800" /><div className="h-11 rounded-md bg-zinc-800/50" /></div>
            <div className="space-y-2"><div className="h-3 w-24 rounded bg-zinc-800" /><div className="h-11 rounded-md bg-zinc-800/50" /></div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2"><div className="h-3 w-24 rounded bg-zinc-800" /><div className="h-11 rounded-md bg-zinc-800/50" /></div>
            <div className="space-y-2"><div className="h-3 w-24 rounded bg-zinc-800" /><div className="h-11 rounded-md bg-zinc-800/50" /></div>
          </div>
          <div className="space-y-2"><div className="h-3 w-24 rounded bg-zinc-800" /><div className="h-11 rounded-md bg-zinc-800/50" /></div>
          <div className="h-20 rounded-md bg-zinc-800/30" />
          <div className="flex justify-between pt-2"><div className="h-11 w-32 rounded-md bg-zinc-800" /><div className="flex gap-3"><div className="h-11 w-20 rounded-md bg-zinc-800" /><div className="h-11 w-28 rounded-md bg-zinc-800" /></div></div>
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
  
  const [formData, setFormData] = useState({
    name: "", brand: "", qr_code: "", category_id: "", status: "available", purchase_year: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      try {
        const catResponse = await fetch(`${API_URL}/api/categories`, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } });
        if (catResponse.ok) {
          const catResult = await catResponse.json();
          setCategories(catResult.data || []);
        }

        const assetResponse = await fetch(`${API_URL}/api/assets/${assetId}`, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } });

        if (assetResponse.ok) {
          const assetResult = await assetResponse.json();
          const asset = assetResult.data;
          
          setFormData({
            name: asset.name || "",
            brand: asset.brand || "",
            qr_code: asset.qr_code || "",
            category_id: asset.category_id ? asset.category_id.toString() : "",
            status: asset.status || "available",
            purchase_year: asset.purchase_year ? asset.purchase_year.toString() : "",
          });
        } else {
          alert("Gagal menemukan data aset.");
          router.push("/dashboard");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setIsLoadingData(false), 300); // Sedikit delay agar skeleton terlihat natural
      }
    };

    if (assetId) fetchInitialData();
  }, [router, assetId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok || response.status === 200) {
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

  const handleDelete = async () => {
    if (!window.confirm("Apakah Anda yakin ingin menghapus aset ini secara permanen? Data yang telah dihapus tidak dapat dikembalikan.")) return;
    
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    try {
      const response = await fetch(`${API_URL}/api/assets/${assetId}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        router.push("/dashboard");
      } else {
        alert("Gagal menghapus aset.");
        setIsDeleting(false);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      setIsDeleting(false);
    }
  };

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  // MENGGUNAKAN SKELETON ALIH-ALIH SPINNER
  if (isLoadingData) return <><FontKillerStyles /><EditFormSkeleton /></>;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased py-10 px-4 sm:px-6 lg:px-8">
      <FontKillerStyles />
      <div className="mx-auto max-w-2xl space-y-6">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.back()} className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold tracking-tight text-zinc-100 flex items-center gap-2">
              <Pencil className="h-6 w-6 text-indigo-400" /> Kelola & Edit Aset
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Perbarui detail atau hapus barang inventaris ini.</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            <div className="space-y-6">
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Nama Aset <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-500/50 text-zinc-100 h-11 transition-all" required />
                    <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-zinc-400" />
                  </div>
                  {formErrors.name && <p className="text-xs text-red-500">{formErrors.name[0]}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Merek <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input value={formData.brand} onChange={(e) => setFormData({...formData, brand: e.target.value})} className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-500/50 text-zinc-100 h-11 transition-all" required />
                    <Tag className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-zinc-400" />
                  </div>
                  {formErrors.brand && <p className="text-xs text-red-500">{formErrors.brand[0]}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Kategori</label>
                  <div className="relative">
                    {/* TAMPILAN KATEGORI DISELARASKAN DENGAN INPUT */}
                    <select value={formData.category_id} onChange={(e) => setFormData({...formData, category_id: e.target.value})} className="peer appearance-none flex h-11 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pl-10 pr-8 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all cursor-pointer">
                      <option value="" className="bg-zinc-900">-- Tanpa Kategori --</option>
                      {categories.map(cat => (<option key={cat.id} value={cat.id} className="bg-zinc-900">{cat.name}</option>))}
                    </select>
                    <FolderOpen className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-400 peer-focus:text-zinc-400 pointer-events-none" />
                    <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                  </div>
                  {formErrors.category_id && <p className="text-xs text-red-500">{formErrors.category_id[0]}</p>}
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Tahun Pembelian <span className="text-red-500">*</span></label>
                  <div className="relative">
                    <Input type="number" value={formData.purchase_year} onChange={(e) => setFormData({...formData, purchase_year: e.target.value})} className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-500/50 text-zinc-100 h-11 transition-all" required />
                    <CalendarDays className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-zinc-400" />
                  </div>
                  {formErrors.purchase_year && <p className="text-xs text-red-500">{formErrors.purchase_year[0]}</p>}
                </div>
              </div>

              <div className="space-y-2">
                 <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">Status Aset <span className="text-red-500">*</span></label>
                 <div className="relative">
                   {/* TAMPILAN STATUS DISELARASKAN DENGAN INPUT */}
                   <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} className="peer appearance-none flex h-11 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pl-3 pr-8 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 transition-all cursor-pointer" required>
                      <option value="available" className="bg-zinc-900">Tersedia (Siap Dipinjam)</option>
                      <option value="borrowed" className="bg-zinc-900">Sedang Dipinjam</option>
                      <option value="in_repair" className="bg-zinc-900">Dalam Perbaikan</option>
                   </select>
                   <ChevronDown className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                 </div>
                 {formErrors.status && <p className="text-xs text-red-500">{formErrors.status[0]}</p>}
              </div>

            </div>

            {/* QR CODE - DITETAPKAN, TIDAK ADA PERUBAHAN LOGIKA, HANYA STYLING RAPI */}
            <div className="rounded-lg border border-zinc-800/80 bg-zinc-900/40 p-5 flex items-center justify-between mt-2">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider flex items-center gap-2"><QrCode className="h-4 w-4 text-zinc-400" /> QR Code (Identitas Unik)</label>
                <p className="text-sm text-zinc-500">Kode ini bersifat unik dan tidak dapat diubah setelah aset didaftarkan.</p>
              </div>
              <div>
                <Input value={formData.qr_code} readOnly className="appearance-none bg-zinc-950 border-zinc-800/80 text-indigo-400 h-11 font-mono font-bold text-center cursor-not-allowed select-none w-48 focus-visible:ring-0" />
              </div>
            </div>

            <hr className="border-zinc-800/60" />

            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete} 
                disabled={isDeleting || isSubmitting}
                className="w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white h-11 px-5 rounded-md gap-2 transition-all"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Hapus Aset
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting || isDeleting} className="w-full sm:w-auto text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 h-11 px-6 rounded-md">Batal</Button>
                <Button type="submit" disabled={isSubmitting || isDeleting} className="w-full sm:w-auto bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-11 px-8 font-semibold rounded-md shadow-lg shadow-indigo-900/20 transition-all">
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                  {isSubmitting ? "Menyimpan..." : "Simpan"}
                </Button>
              </div>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}