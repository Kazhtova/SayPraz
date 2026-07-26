/* eslint-disable react-hooks/static-components */
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeft, 
  Save, 
  Loader2, 
  FolderPlus,
  Type,
  AlignLeft
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

// ==========================================
// KOMPONEN SKELETON HALAMAN TAMBAH KATEGORI
// ==========================================
function AddCategorySkeleton() {
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
            <div className="h-24 rounded-md bg-zinc-800/50" />
          </div>
          <div className="flex justify-end gap-3 pt-2">
            <div className="h-11 w-20 rounded-md bg-zinc-800" />
            <div className="h-11 w-36 rounded-md bg-zinc-800" />
          </div>
        </div>
      </div>
    </div>
  );
}

export default function AddCategoryPage() {
  const router = useRouter();
  const [isPageLoading, setIsPageLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  
  // ✅ PERBAIKAN: Menambahkan kolom description ke dalam form state
  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoading(false), 300);
    return () => clearTimeout(timer);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormErrors({});

    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/categories`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      if (response.ok || response.status === 201) {
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

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  if (isPageLoading) return <><FontKillerStyles /><AddCategorySkeleton /></>;

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
              <FolderPlus className="h-6 w-6 text-indigo-400" />
              Tambah Kategori Baru
            </h1>
            <p className="text-sm text-zinc-400 mt-1">Buat klasifikasi baru untuk mengelompokkan aset inventaris.</p>
          </div>
        </div>

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
                className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2 h-11 px-8 font-semibold rounded-md shadow-lg shadow-indigo-900/20 transition-all"
              >
                {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                {isSubmitting ? "Menyimpan..." : "Tambah Kategori"}
              </Button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
}