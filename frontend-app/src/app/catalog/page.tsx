/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import dynamic from "next/dynamic";
import { 
  Search, Package, Calendar, Clock, Loader2, ArrowRight, CheckCircle2,
  FolderOpen, MapPin, Activity, Layers, ChevronLeft, ChevronRight, Filter, 
  ArrowDownAZ, ArrowUpZA, X, Maximize2, ScanLine
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";

// === DYNAMIC IMPORT UNTUK MENCEGAH OUT OF MEMORY ===
const QrScannerModal = dynamic(
  () => import("@/components/QrScannerModal").then((mod) => mod.QrScannerModal),
  { ssr: false }
);

interface Asset {
  id: number;
  name: string;
  brand: string;
  qr_code: string;
  image_url?: string | null;
  category_name?: string;
  stock?: number;
  condition?: string;
  location?: string;
  status?: string;
}

// =========================================================================
// SKELETON KHUSUS CARD GRID SAJA (PRESISI 1:1)
// =========================================================================
function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 animate-pulse">
      {Array.from({ length: 8 }).map((_, index) => (
        <div key={index} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm">
          {/* Skeleton Gambar Aset */}
          <div className="h-48 bg-zinc-900/60 border-b border-zinc-800/50 relative">
            <div className="absolute top-3 left-3 h-5 w-20 rounded-md bg-zinc-800" />
          </div>

          {/* Skeleton Detail Aset */}
          <div className="flex-1 p-5 flex flex-col space-y-4">
            <div className="h-5 w-24 rounded bg-zinc-800/80" />
            <div className="space-y-2">
              <div className="h-6 w-3/4 rounded bg-zinc-800" />
              <div className="h-4 w-1/2 rounded bg-zinc-900" />
            </div>
            
            {/* Grid 4 Atribut */}
            <div className="grid grid-cols-2 gap-3 pt-2 pb-5 border-b border-zinc-800/60">
              <div className="h-3 rounded bg-zinc-800/60" />
              <div className="h-3 rounded bg-zinc-800/60" />
              <div className="h-3 rounded bg-zinc-800/60" />
              <div className="h-3 rounded bg-zinc-800/60" />
            </div>

            {/* Skeleton Tombol Aksi */}
            <div className="h-10 rounded-xl bg-zinc-800/50 mt-auto" />
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// SKELETON HALAMAN AWAL (SEBELUM DATA PERTAMA MASUK)
// =========================================================================
function FullPageSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col border-b border-zinc-800/60 pb-8 space-y-8">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-zinc-800/80 pb-6">
          <div className="space-y-3 max-w-2xl w-full">
            <div className="h-5 w-44 rounded-full bg-zinc-900 border border-zinc-800" />
            <div className="h-8 w-72 rounded-lg bg-zinc-800" />
            <div className="h-4 w-full sm:w-96 rounded bg-zinc-900" />
          </div>
          <div className="h-10 w-36 rounded-xl bg-zinc-900 border border-zinc-800/90" />
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <div className="h-12 w-full sm:flex-1 lg:w-[65%] rounded-xl bg-zinc-900/60 border border-zinc-800" />
          <div className="flex gap-3 w-full sm:w-auto">
            <div className="h-12 w-full sm:w-36 rounded-xl bg-zinc-900/60 border border-zinc-800" />
            <div className="h-12 w-full sm:w-28 rounded-xl bg-zinc-900/60 border border-zinc-800" />
          </div>
        </div>
      </div>

      <CardGridSkeleton />
    </div>
  );
}

export default function CatalogPage() {
  const router = useRouter();
  
  const [allAssets, setAllAssets] = useState<Asset[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isSearching, setIsSearching] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  
  const [failedImages, setFailedImages] = useState<Record<number, boolean>>({});
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string } | null>(null);

  // === STATE FILTER & SORTING ===
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");
  const [statusFilter, setStatusFilter] = useState<string>("all");

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [returnDate, setReturnDate] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // === STATE SCANNER QR ===
  const [isScannerOpen, setIsScannerOpen] = useState(false);

  // === PAGINATION FRONTEND ===
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 16; 

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.replace("/login"); 
  }, [router]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setLightboxImage(null);
    };
    if (lightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

  // === TEKNIK PARALLEL FETCHING ===
  const loadAvailableAssets = useCallback(async (search: string = "") => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setIsSearching(true);
    try {
      const params1 = new URLSearchParams({ page: "1" });
      if (search) params1.append("search", search);

      const res1 = await fetch(`${API_URL}/api/assets?${params1.toString()}`, {
        cache: "no-store",
        headers: { 
          "Authorization": `Bearer ${token}`, 
          "Accept": "application/json",
          "Cache-Control": "no-cache",
          "Pragma": "no-cache"
        }
      });

      if (!res1.ok) {
        if (res1.status === 401) handleLogout();
        return;
      }

      const data1 = await res1.json();
      let combinedAssets = [...(data1.data || [])];

      const lastPage = data1.meta?.last_page || data1.last_page || 1;

      if (lastPage > 1) {
        const promises = [];
        for (let i = 2; i <= lastPage; i++) {
          const p = new URLSearchParams({ page: i.toString() });
          if (search) p.append("search", search);

          promises.push(
            fetch(`${API_URL}/api/assets?${p.toString()}`, {
              cache: "no-store",
              headers: { 
                "Authorization": `Bearer ${token}`, 
                "Accept": "application/json",
                "Cache-Control": "no-cache",
                "Pragma": "no-cache"
              }
            }).then(r => r.json())
          );
        }

        const remainingResults = await Promise.all(promises);
        
        remainingResults.forEach(res => {
          combinedAssets = [...combinedAssets, ...(res.data || [])];
        });
      }

      const uniqueAssets = Array.from(new Map(combinedAssets.map(item => [item.id, item])).values());
      setAllAssets(uniqueAssets);

    } catch (error) {
      console.error("Gagal memuat katalog:", error);
    } finally {
      setIsInitialLoading(false);
      setIsSearching(false);
    }
  }, [handleLogout, router]);

  useEffect(() => {
    setCurrentPage(1); 
    const delayDebounceFn = setTimeout(() => {
      loadAvailableAssets(searchQuery);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, loadAvailableAssets]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
    setCurrentPage(1); 
  };

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
        setSelectedAsset(null); 
        setReturnDate(""); 
        loadAvailableAssets(searchQuery); 
      } else {
        alert(result.message || "Gagal mengajukan peminjaman.");
      }
    } catch (error) {
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleImageError = (id: number) => {
    setFailedImages(prev => ({ ...prev, [id]: true }));
  };

  // === HANDLER UNTUK HASIL SCAN QR CODE ===
  const handleScanResult = (decodedText: string) => {
    setIsScannerOpen(false); // Matikan kamera otomatis

    // Cari aset di daftar memory (state)
    const foundAsset = allAssets.find(asset => asset.qr_code === decodedText);

    if (foundAsset) {
      if (foundAsset.status === 'available') {
        setSelectedAsset(foundAsset); // <- Ini otomatis memunculkan Modal Form Pengajuan
      } else {
        alert(`Aset "${foundAsset.name}" sedang tidak tersedia (Status: ${foundAsset.status}).`);
      }
    } else {
      alert(`Aset dengan QR Code [${decodedText}] tidak ditemukan di katalog.`);
    }
  };

  // === LOGIKA FILTERING & SORTING DI MEMORI BROWSER ===
  const filteredAssets = allAssets.filter((asset) => {
    if (statusFilter === "all") return true;
    if (statusFilter === "available") return asset.status === "available";
    if (statusFilter === "unavailable") return asset.status !== "available";
    return true;
  });

  const sortedAssets = [...filteredAssets].sort((a, b) => {
    const comparison = a.name.localeCompare(b.name, undefined, { sensitivity: 'base' });
    return sortOrder === "asc" ? comparison : -comparison;
  });

  const totalPages = Math.ceil(sortedAssets.length / itemsPerPage);
  const paginatedAssets = sortedAssets.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  const getTodayLocalString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased pb-12">
      <FontKillerStyles />

      <Navbar />

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {/* SKELETON AWAL SAAT PERTAMA KALI MEMUAT APPS */}
        {isInitialLoading ? (
          <FullPageSkeleton />
        ) : (
          <>
            {/* HEADER KATALOG & FORM CONTROL STATIS */}
            <div className="flex flex-col border-b border-zinc-800/60 pb-8">
              <div className="w-full lg:w-full">
                
                {/* HEADER KATALOG MODERN & ELEGAN */}
                <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between mb-8 pb-6 border-b border-zinc-800/80">
                  
                  {/* SISI KIRI: SYSTEM BADGE, JUDUL & DESKRIPSI */}
                  <div className="space-y-3 max-w-2xl">
                    <div className="flex items-center gap-2.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
                        <span className="relative flex h-2 w-2">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                        </span>
                        App Sarpras Active
                      </span>
                      <span className="text-zinc-700">•</span>
                      <span className="text-xs font-mono text-zinc-500">Katalog Digital</span>
                    </div>

                    <div>
                      <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                        Jelajahi Aset Sarpras
                      </h1>
                      <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                        Temukan dan ajukan peminjaman alat praktik atau sarana prasarana sekolah yang Anda butuhkan secara mudah dan cepat.
                      </p>
                    </div>
                  </div>

                  {/* SISI KANAN: STATISTIK TOTAL ASET */}
                  <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                    <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/90 text-xs font-semibold text-zinc-200 shadow-sm backdrop-blur-md">
                      <div className="flex items-center justify-center p-1.5 rounded-lg bg-zinc-800 text-zinc-100">
                        <Package className="h-4 w-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[10px] uppercase font-mono font-medium text-zinc-200/70 tracking-wider">Total Aset</span>
                        <span className="text-sm font-bold text-white font-mono">{allAssets.length} <span className="text-xs font-normal text-zinc-200/70 font-sans">Barang</span></span>
                      </div>
                    </div>
                  </div>

                </div>
                
                {/* KONTROL PENCARIAN, FILTER, DAN SORTING DENGAN SCANNER */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <div className="relative w-full sm:flex-1 lg:w-[65%] flex gap-2">
                    <div className="relative flex-1">
                      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                      <Input 
                        placeholder="Cari proyektor, mikrotik, kamera..." 
                        value={searchQuery}
                        onChange={handleSearchChange} 
                        className="pl-10 bg-zinc-900/40 border-zinc-700 text-sm h-12 rounded-xl focus-visible:ring-zinc-200/30 transition-all w-full"
                      />
                    </div>
                    
                    {/* TOMBOL SCAN QR KHUSUS */}
                    <Button 
                      onClick={() => setIsScannerOpen(true)}
                      className="h-12 px-4 rounded-xl bg-zinc-900/40 hover:bg-zinc-900/40 border-zinc-700 font-medium focus-visible:ring-zinc-200/30 flex items-center gap-2 shadow-lg shadow-zinc-900/20 shrink-0"
                      title="Scan QR Aset"
                    >
                      <ScanLine className="h-5 w-5" />
                      <span className="hidden sm:inline text-zinc-300">Scan QR</span>
                    </Button>
                  </div>

                  <div className="flex gap-3 w-full sm:w-auto">
                    <div className="relative flex-1 sm:flex-none">
                      <select 
                        value={statusFilter}
                        onChange={(e) => {
                          setStatusFilter(e.target.value);
                          setCurrentPage(1);
                        }}
                        className="w-full sm:w-auto h-12 px-4 pr-10 appearance-none bg-zinc-900/40 border border-zinc-700 rounded-xl text-sm text-zinc-200 focus:outline-none focus:ring-1 focus:ring-zinc-500 cursor-pointer transition-colors hover:border-zinc-500"
                      >
                        <option value="all">Semua Status</option>
                        <option value="available">Tersedia Saja</option>
                        <option value="unavailable">Tidak Tersedia</option>
                      </select>
                      <Filter className="absolute right-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
                    </div>

                    <Button 
                      variant="outline" 
                      onClick={() => {
                        setSortOrder(prev => prev === "asc" ? "desc" : "asc");
                        setCurrentPage(1);
                      }}
                      className="h-12 bg-zinc-900/40 border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl px-4 w-full sm:w-auto flex-1 sm:flex-none"
                    >
                      {sortOrder === "asc" ? <ArrowDownAZ className="h-4 w-4 mr-2 text-zinc-200" /> : <ArrowUpZA className="h-4 w-4 mr-2 text-zinc-200" />}
                      {sortOrder === "asc" ? "A - Z" : "Z - A"}
                    </Button>
                  </div>
                </div>

              </div>
            </div>

            {/* HANYA AREA INI YANG MENJADI SKELETON SAAT SEARCHING / FILTERING */}
            {isSearching ? (
              <CardGridSkeleton />
            ) : sortedAssets.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-24 text-center">
                <Package className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
                <p className="text-zinc-400">Aset tidak ditemukan. Coba ubah kata kunci atau filter status.</p>
              </div>
            ) : (
              <div className="space-y-8">
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                  {paginatedAssets.map((asset) => {
                    const isAvailable = asset.status === 'available';
                    const hasValidImage = asset.image_url && !failedImages[asset.id];

                    return (
                      <div key={asset.id} className="group flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden hover:border-zinc-400 hover:bg-zinc-900/60 transition-all duration-300 shadow-sm relative">
                        
                        {/* CONTAINER GAMBAR ASET WITH LIGHTBOX */}
                        <div 
                          onClick={() => {
                            if (hasValidImage) {
                              setLightboxImage({ url: asset.image_url!, title: asset.name });
                            }
                          }}
                          className={`h-48 bg-zinc-950 relative border-b border-zinc-800/50 overflow-hidden flex items-center justify-center ${hasValidImage ? "cursor-pointer group/img" : ""}`}
                        >
                          {hasValidImage ? (
                            <>
                              <Image 
                                src={asset.image_url!} 
                                alt={asset.name}
                                fill
                                unoptimized
                                onError={() => handleImageError(asset.id)}
                                className="object-cover transition-transform duration-500 group-hover/img:scale-105"
                              />
                              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center p-3 z-10">
                                <span className="bg-zinc-900/90 backdrop-blur-md text-[11px] text-zinc-200 px-3 py-1.5 rounded-lg border border-zinc-700/80 font-medium shadow-xl flex items-center gap-1.5">
                                  <Maximize2 className="h-3.5 w-3.5" /> Klik untuk memperbesar
                                </span>
                              </div>
                            </>
                          ) : (
                            <div className="flex flex-col items-center justify-center text-zinc-700 group-hover:text-zinc-500 transition-colors">
                              <Package className="h-12 w-12 mb-1" />
                              <span className="text-[10px] text-zinc-600 font-mono">Tanpa Foto</span>
                            </div>
                          )}

                          {isAvailable ? (
                            <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[9px] font-bold border bg-emerald-950/80 text-emerald-400 border-emerald-500/30 backdrop-blur-md uppercase tracking-widest shadow-lg">
                              <CheckCircle2 className="h-3 w-3" /> Tersedia
                            </span>
                          ) : (
                            <span className="absolute top-3 left-3 z-20 inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[9px] font-bold border bg-rose-950/80 text-rose-400 border-rose-500/30 backdrop-blur-md uppercase tracking-widest shadow-lg">
                              <Activity className="h-3 w-3" /> Tidak Tersedia
                            </span>
                          )}
                        </div>

                        <div className="flex-1 p-5 flex flex-col">
                          <div className="mb-3">
                            <span className="text-[10px] font-mono font-medium text-zinc-200 bg-zinc-800 px-2 py-1 rounded border border-zinc-600 shadow-sm">
                              {asset.qr_code}
                            </span>
                          </div>
                          
                          <h3 className={`text-lg font-bold leading-tight transition-colors ${isAvailable ? "text-zinc-100 group-hover:text-zinc-100" : "text-zinc-500"}`}>
                            {asset.name}
                          </h3>
                          <p className="text-sm font-normal text-zinc-400 mt-1 mb-5">{asset.brand}</p>
                          
                          <div className="grid grid-cols-2 gap-y-3 gap-x-2 mt-auto pb-5 border-b border-zinc-800/60 mb-5">
                            <div className="flex items-center gap-2 text-xs font-normal text-zinc-400">
                              <FolderOpen className="h-3.5 w-3.5 text-zinc-500" />
                              <span className="truncate">{asset.category_name || "Umum"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-normal text-zinc-400">
                              <Layers className="h-3.5 w-3.5 text-zinc-500" />
                              <span>Stok: {asset.stock || 1}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-normal text-zinc-400">
                              <Activity className="h-3.5 w-3.5 text-zinc-500" />
                              <span>{asset.condition || "Kondisi Baik"}</span>
                            </div>
                            <div className="flex items-center gap-2 text-xs font-normal text-zinc-400">
                              <MapPin className="h-3.5 w-3.5 text-zinc-500" />
                              <span className="truncate">{asset.location || "Pusat"}</span>
                            </div>
                          </div>

                          <Button 
                            onClick={() => isAvailable && setSelectedAsset(asset)}
                            disabled={!isAvailable}
                            className={`mx-2 mb-2 gap-2 font-medium rounded-xl transition-all h-10 ${
                              isAvailable 
                                ? "bg-indigo-500/10 hover:bg-indigo-950/10 border border-indigo-400/40 text-zinc-200" 
                                : "bg-zinc-800/30 text-zinc-600 border border-zinc-800/50 cursor-not-allowed"
                            }`}
                          >
                            {isAvailable ? "Ajukan Pinjam" : "Tidak Tersedia"} 
                            {isAvailable && <ArrowRight className="h-4 w-4 opacity-70" />}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* NAVIGASI PAGINATION */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 pt-4 border-t border-zinc-800/50">
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1 || isSearching}
                      className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl h-10 px-4 disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4 mr-2" />
                      Sebelumnya
                    </Button>
                    
                    <span className="text-sm font-medium text-zinc-400">
                      Halaman <span className="text-zinc-100">{currentPage}</span> dari <span className="text-zinc-100">{totalPages}</span>
                    </span>
                    
                    <Button
                      variant="outline"
                      onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages || isSearching}
                      className="bg-transparent border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-white rounded-xl h-10 px-4 disabled:opacity-50"
                    >
                      Selanjutnya
                      <ChevronRight className="h-4 w-4 ml-2" />
                    </Button>
                  </div>
                )}
              </div>
            )}
          </>
        )}
      </main>

      {/* MODAL OVERLAY LIGHTBOX GAMBAR FULLSCREEN */}
      {lightboxImage && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 sm:p-8 animate-in fade-in duration-200"
          onClick={() => setLightboxImage(null)}
        >
          <div 
            className="absolute top-4 right-4 sm:top-6 sm:right-6 flex items-center gap-3 z-[101]"
            onClick={(e) => e.stopPropagation()}
          >
            <Button
              type="button"
              onClick={() => setLightboxImage(null)}
              className="bg-zinc-800 hover:bg-zinc-900 text-white gap-2 h-11 px-6 font-semibold rounded-xl shadow-lg border border-zinc-700 transition-all"
            >
              <X className="h-4 w-4" />
              Tutup
            </Button>
          </div>

          <div 
            className="relative w-full max-w-5xl max-h-[85vh] h-[80vh] rounded-2xl overflow-hidden border border-zinc-800 shadow-2xl flex items-center justify-center bg-zinc-950"
            onClick={(e) => e.stopPropagation()}
          >
            <Image 
              src={lightboxImage.url} 
              alt={lightboxImage.title} 
              fill 
              unoptimized
              className="object-contain"
              priority
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent p-4 sm:p-6 flex items-center justify-between">
              <span className="text-sm font-semibold text-zinc-200">{lightboxImage.title}</span>
              <span className="text-xs text-zinc-400 font-mono">Pratinjau Foto Aset</span>
            </div>
          </div>
        </div>
      )}

      {/* MODAL PENGAJUAN PEMINJAMAN */}
      {selectedAsset && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 w-full max-w-md shadow-2xl">
            <h2 className="text-xl font-bold text-zinc-100 mb-1">Form Pengajuan</h2>
            <p className="text-sm text-zinc-400 mb-6">Tentukan tanggal pengembalian untuk aset ini.</p>
            
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-xl p-4 mb-6">
              <p className="text-xs text-zinc-500 uppercase font-semibold mb-1">Aset Terpilih:</p>
              <p className="text-base font-dark text-zinc-200">{selectedAsset.name}</p> 
              <p className="text-sm font-normal text-zinc-400">{selectedAsset.brand}</p>
            </div>

            <form onSubmit={handleBorrowSubmit} className="space-y-6">
              <div className="space-y-2">
                <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                  Rencana Tanggal Kembali <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Input 
                    type="date"
                    required
                    value={returnDate}
                    min={getTodayLocalString()} 
                    onChange={(e) => setReturnDate(e.target.value)}
                    className="peer pl-10 bg-zinc-900/50 border-zinc-700 text-zinc-100 h-12 rounded-xl focus-visible:ring-zinc-500/30"
                  />
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 peer-focus:text-zinc-400 transition-colors" />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={() => { setSelectedAsset(null); setReturnDate(""); }}
                  className="text-zinc-100 hover:text-black rounded-xl"
                  disabled={isSubmitting}
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting || !returnDate}
                  className="bg-zinc-600 hover:bg-zinc-800 text-white rounded-xl gap-2 font-medium"
                >
                  {isSubmitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Clock className="h-4 w-4" />}
                  {isSubmitting ? "Memproses..." : "Kirim Pengajuan"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* PANGGIL KOMPONEN SCANNER MODAL */}
      <QrScannerModal 
        isOpen={isScannerOpen}
        onClose={() => setIsScannerOpen(false)}
        onScan={handleScanResult}
      />

    </div>
  );
}