/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  Pencil,
  Type,
  AlignLeft,
  Trash2,
  Link as LinkIcon
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

// ==========================================
// KOMPONEN SKELETON HALAMAN EDIT KATEGORI
// ==========================================
function EditCategorySkeleton() {
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
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-zinc-800" />
            <div className="h-11 rounded-md bg-zinc-800/50" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-zinc-800" />
            <div className="h-11 rounded-md bg-zinc-800/30" />
          </div>
          <div className="space-y-2">
            <div className="h-3 w-32 rounded bg-zinc-800" />
            <div className="h-24 rounded-md bg-zinc-800/50" />
          </div>
          <div className="flex justify-between pt-2">
            <div className="h-11 w-32 rounded-md bg-zinc-800" />
            <div className="flex gap-3">
              <div className="h-11 w-20 rounded-md bg-zinc-800" />
              <div className="h-11 w-36 rounded-md bg-zinc-800" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function EditCategoryPage() {
  const router = useRouter();
  const params = useParams();
  const categoryId = params.id;

  const [isLoadingData, setIsLoadingData] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  const [formData, setFormData] = useState({
    name: "",
    slug: "",
    description: "",
  });

  useEffect(() => {
    const fetchInitialData = async () => {
      const token = localStorage.getItem("token");
      if (!token) { router.push("/login"); return; }

      try {
        const response = await fetch(`${API_URL}/api/categories/${categoryId}`, { 
          headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } 
        });

        if (response.ok) {
          const result = await response.json();
          const category = result.data;
          
          setFormData({
            name: category.name || "",
            slug: category.slug || "",
            description: category.description || "",
          });
        } else {
          alert("Gagal menemukan data kategori.");
          router.push("/dashboard/categories");
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      } finally {
        setTimeout(() => setIsLoadingData(false), 300);
      }
    };

    if (categoryId) fetchInitialData();
  }, [router, categoryId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          description: formData.description
        }), 
      });

      const result = await response.json();

      if (response.ok || response.status === 200) {
        router.push("/dashboard/categories");
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
    if (!window.confirm("Apakah Anda yakin ingin menghapus kategori ini?")) return;
    
    setIsDeleting(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${API_URL}/api/categories/${categoryId}`, {
        method: "DELETE",
        headers: { "Accept": "application/json", "Authorization": `Bearer ${token}` },
      });

      const result = await response.json();

      if (response.ok) {
        router.push("/dashboard/categories");
      } else if (response.status === 400) {
        alert(result.message || "Kategori tidak dapat dihapus karena masih digunakan.");
        setIsDeleting(false);
      } else {
        alert("Gagal menghapus kategori.");
        setIsDeleting(false);
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
      setIsDeleting(false);
    }
  };

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  if (isLoadingData) return <><FontKillerStyles /><EditCategorySkeleton /></>;

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
              <Pencil className="h-6 w-6 text-zinc-400" />
              Kelola & Edit Kategori
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Perbarui rincian kategori atau hapus dari sistem.</p>
          </div>
        </div>

        {/* Form Container */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-8">
            
            <div className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Nama Kategori <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input 
                    value={formData.name} 
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="peer pl-10 bg-zinc-900/50 border-zinc-800 focus-visible:ring-1 focus-visible:ring-zinc-500/50 text-zinc-100 h-11 transition-all" 
                    placeholder="Cth: Perangkat Elektronik" 
                    required 
                  />
                  <Type className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-zinc-400 transition-colors" />
                </div>
                {formErrors.name && <p className="text-xs text-red-500">{formErrors.name[0]}</p>}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                    Slug Kategori
                  </label>
                  <span className="text-[10px] text-zinc-500 bg-zinc-800 px-2 py-0.5 rounded uppercase font-bold tracking-wider">Otomatis</span>
                </div>
                <div className="relative">
                  <Input 
                    value={formData.slug} 
                    readOnly
                    className="appearance-none peer pl-10 bg-zinc-950 border-zinc-800/80 text-zinc-500 h-11 cursor-not-allowed select-none focus-visible:ring-0 transition-all font-mono text-sm" 
                  />
                  <LinkIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-600 transition-colors" />
                </div>
                <p className="text-xs text-zinc-600">URL identifier ini diperbarui secara otomatis saat nama kategori diubah.</p>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Deskripsi Kategori (Opsional)
                </label>
                <div className="relative">
                  <textarea 
                    value={formData.description} 
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="peer p-3 pl-10 bg-zinc-900/50 border border-zinc-800 focus:outline-none focus-visible:ring-1 focus-visible:ring-zinc-400 text-zinc-100 w-full rounded-md transition-all min-h-[100px] resize-y text-sm" 
                    placeholder="Cth: Kumpulan aset yang mencakup komputer, laptop, dan proyektor..." 
                  />
                  <AlignLeft className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-500 peer-focus:text-zinc-400 transition-colors" />
                </div>
                {formErrors.description && <p className="text-xs text-red-500">{formErrors.description[0]}</p>}
              </div>

            </div>

            <hr className="border-zinc-800/60" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between pt-2 gap-4">
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleDelete} 
                disabled={isDeleting || isSubmitting}
                className="w-full sm:w-auto border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white h-11 px-5 rounded-md gap-2 transition-all"
              >
                {isDeleting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
                Hapus Kategori
              </Button>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <Button type="button" variant="ghost" onClick={() => router.back()} disabled={isSubmitting || isDeleting} className="w-full sm:w-auto text-zinc-400 hover:text-zinc-100 hover:bg-zinc-900 h-11 px-6 rounded-md">Batal</Button>
                <Button type="submit" disabled={isSubmitting || isDeleting} className="w-full sm:w-auto bg-zinc-800 hover:bg-zinc-950 text-white gap-2 h-11 px-8 font-semibold rounded-md shadow-lg shadow-indigo-900/20 transition-all">
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