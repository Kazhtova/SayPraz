/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Package, Calendar, Clock, Loader2, ArrowRight, LogOut, CheckCircle2,
  FolderOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface Asset {
  id: number;
  name: string;
  brand: string;
  qr_code: string;
  category_name?: string;
}

export default function CatalogPage() {
  const router = useRouter();
  
  const [assets, setAssets] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  
  // State untuk Modal Peminjaman
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [returnDate, setReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Fungsi Logout
  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  // Muat hanya aset yang berstatus 'available' (tersedia)
  const loadAvailableAssets = useCallback(async (search: string = "") => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const params = new URLSearchParams({ status: "available" });
      if (search) params.append("search", search);

      const response = await fetch(`${API_URL}/api/assets?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });

      if (response.ok) {
        const result = await response.json();
        setAssets(result.data || []);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Gagal memuat katalog:", error);
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout, router]);

  // Efek Debounce untuk pencarian
  useEffect(() => {
    setIsLoading(true);
    const delayDebounceFn = setTimeout(() => {
      loadAvailableAssets(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadAvailableAssets]);

  // Menangani pengiriman form peminjaman ke API Transaction
  const handleBorrowSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAsset || !returnDate) return;

    setIsSubmitting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({
          asset_id: selectedAsset.id,
          expected_returned_date: returnDate
        })
      });

      const result = await response.json();

      if (response.ok || response.status === 201) {
        alert("Pengajuan berhasil! Silakan tunggu persetujuan Admin.");
        setSelectedAsset(null); // Tutup modal
        setReturnDate(""); // Reset tanggal
        loadAvailableAssets(searchQuery); // Muat ulang data (aset yang diajukan akan hilang dari katalog)
      } else {
        alert(result.message || "Gagal mengajukan peminjaman.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
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

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased pb-12">
      <FontKillerStyles />

      {/* Navbar Khusus User */}
      <nav className="sticky top-0 z-40 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-600 shadow-lg shadow-indigo-900/20">
              <Package className="h-5 w-5 text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Katalog Invenkoryz</span>
          </div>
          <Button variant="ghost" onClick={handleLogout} className="text-zinc-400 hover:text-white hover:bg-zinc-800 gap-2">
            <LogOut className="h-4 w-4" /> Keluar
          </Button>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-8 space-y-8">
        
        {/* Header & Pencarian */}
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Jelajahi Aset</h1>
            <p className="text-zinc-400 text-sm mt-1">Pilih dan ajukan peminjaman sarana prasarana yang tersedia.</p>
          </div>
          
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
            <Input 
              placeholder="Cari proyektor, laptop, merek..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-12 rounded-xl focus-visible:ring-indigo-500/50 w-full"
            />
          </div>
        </div>

        {/* Grid Katalog */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
            <p>Memuat katalog aset...</p>
          </div>
        ) : assets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-20 text-center">
            <Package className="h-12 w-12 text-zinc-700 mx-auto mb-3" />
            <p className="text-zinc-400">Tidak ada aset yang tersedia untuk dipinjam saat ini.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {assets.map((asset) => (
              <div key={asset.id} className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 hover:border-indigo-500/50 hover:bg-zinc-900/80 transition-all duration-300">
                <div className="flex justify-between items-start mb-4">
                  <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[10px] font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-wider">
                    <CheckCircle2 className="h-3 w-3" /> Tersedia
                  </span>
                  <span className="text-xs font-mono text-zinc-600">{asset.qr_code}</span>
                </div>
                
                <div className="flex-1 space-y-1 mb-6">
                  <h3 className="text-lg font-bold text-zinc-100 leading-tight group-hover:text-indigo-400 transition-colors">{asset.name}</h3>
                  <p className="text-sm text-zinc-400">{asset.brand}</p>
                  {asset.category_name && (
                    <p className="text-xs text-zinc-500 pt-2 flex items-center gap-1.5">
                      <FolderOpen className="h-3 w-3" /> {asset.category_name}
                    </p>
                  )}
                </div>

                <Button 
                  onClick={() => setSelectedAsset(asset)}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white gap-2 font-medium rounded-xl"
                >
                  Ajukan Pinjam <ArrowRight className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Modal Pengajuan Peminjaman */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-100 mb-1">Form Pengajuan</h2>
            <p className="text-sm text-zinc-400 mb-6">Tentukan tanggal pengembalian untuk aset ini.</p>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Aset Terpilih:</p>
              <p className="text-base font-bold text-zinc-200">{selectedAsset.name}</p>
              <p className="text-sm text-zinc-400">{selectedAsset.brand}</p>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Rencana Tanggal Kembali <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input 
                    type="date"
                    required
                    value={returnDate}
                    min={new Date().toISOString().split('T')[0]} // Tidak bisa pilih tanggal lampau
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="peer pl-10 bg-zinc-900/80 border-zinc-800 text-zinc-100 h-12 rounded-xl focus-visible:ring-indigo-500/50"
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-indigo-400 transition-colors" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setSelectedAsset(null); setReturnDate(""); }}
                  className="text-zinc-400 hover:text-white rounded-xl"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !returnDate}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl gap-2 font-medium"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                  {isSubmitting ? "Memproses..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}