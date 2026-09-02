/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Search, Plus, RefreshCw, ChevronLeft, ChevronRight, 
  Pencil, FolderOpen, ArrowLeft, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface Category {
  id: number;
  name: string;
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

// ==========================================
// KOMPONEN SKELETON
// ==========================================
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      {/* Kolom 1: ID (Otomatis dibatasi w-24 oleh thead) */}
      <td className="px-6 py-4">
        <div className="h-4 w-8 rounded bg-zinc-800" />
      </td>
      
      {/* Kolom 2: Nama Kategori */}
      <td className="px-6 py-4">
        <div className="h-4 w-48 rounded bg-zinc-800" />
      </td>
      
      {/* Kolom 3: Aksi (Otomatis dibatasi w-32 oleh thead) */}
      <td className="px-6 py-4 text-center">
        {/* Menggunakan mx-auto agar kotak berada tepat di tengah */}
        <div className="mx-auto h-8 w-8 rounded-md bg-zinc-800" />
      </td>
    </tr>
  );
}

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]); 
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  
  const [currentPage, setCurrentPage] = useState(1);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortId, setSortId] = useState("asc"); // 'asc' (terkecil) atau 'desc' (terbesar)

  const [isInitialLoading, setIsInitialLoading] = useState(true); 
  const [isTableRefreshing, setIsTableRefreshing] = useState(false); 

  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  // Fungsi Utama Load Data (Diperbarui dengan parameter sort_id)
  const loadCategories = useCallback(async (page: number = 1, search: string = "", sort: string = "asc") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const params = new URLSearchParams({ 
        page: page.toString(),
        sort_id: sort 
      });
      if (search) params.append("search", search);

      const response = await fetch(`${API_URL}/api/categories?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []); 
        setPagination(result.meta || null);
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Gagal terhubung ke server Laravel:", error);
    } finally {
      setTimeout(() => { setIsInitialLoading(false); setIsTableRefreshing(false); }, 400);
    }
  }, [handleLogout]);

  // Efek Debounce untuk Pencarian & Sorting
  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    
    setIsTableRefreshing(true);
    const delayDebounceFn = setTimeout(() => {
      loadCategories(currentPage, searchQuery, sortId);
    }, 400);

    return () => clearTimeout(delayDebounceFn);
  }, [router, currentPage, searchQuery, sortId, loadCategories]);

  const handleRefreshClick = () => {
    setIsTableRefreshing(true); 
    setSearchQuery(""); 
    setSortId("asc"); 
    setCurrentPage(1);       
    loadCategories(1, "", "asc");
  };

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  if (isInitialLoading && categories.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans antialiased">
        <FontKillerStyles />
        <main className="mx-auto max-w-5xl px-4 py-8 space-y-8">
          <div className="space-y-2 animate-pulse"><div className="h-9 w-64 rounded-lg bg-zinc-800" /><div className="h-4 w-96 rounded bg-zinc-800" /></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"><div className="p-4 border-b border-zinc-800 flex justify-between animate-pulse"><div className="h-11 w-full rounded-lg bg-zinc-800" /></div><table className="w-full"><tbody><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></tbody></table></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <FontKillerStyles />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => router.push('/dashboard')} className="h-10 w-10 border border-zinc-800 bg-zinc-900/50 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800">
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
              <FolderOpen className="h-7 w-7 text-zinc-400" /> Manajemen Kategori
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Kelola daftar Kategori untuk inventaris aset.</p>
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col">
          
          <div className="border-b border-zinc-800 p-4 flex flex-col md:flex-row gap-4 items-center justify-between bg-zinc-900/20">
            
            {/* AREA PENCARIAN DAN URUTKAN (Kiri/Atas) */}
            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto flex-1">
              {/* Kolom Pencarian Nama */}
              <div className="relative w-full sm:w-80 shrink-0">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input 
                  placeholder="Cari nama kategori..." 
                  value={searchQuery}
                  onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full"
                />
              </div>

              {/* Dropdown Urutkan ID */}
              <div className="relative w-full sm:w-52 shrink-0">
                <ArrowUpDown className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <select 
                  value={sortId}
                  onChange={(e) => { setSortId(e.target.value); setCurrentPage(1); }}
                  className="pl-10 appearance-none flex h-11 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 pr-8 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-500/50 cursor-pointer transition-all"
                >
                  <option value="asc" className="bg-zinc-900">ID Terkecil (Lama)</option>
                  <option value="desc" className="bg-zinc-900">ID Terbesar (Baru)</option>
                </select>
              </div>
            </div>

            {/* TOMBOL AKSI (Kanan/Bawah) */}
            <div className="flex w-full md:w-auto gap-3 justify-end shrink-0">
              <Button onClick={() => router.push('/dashboard/categories/add')} className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-medium gap-2 h-11 w-full sm:w-auto px-5">
                <Plus className="h-4 w-4" /> Tambah Kategori
              </Button>
              
              <Button variant="outline" onClick={handleRefreshClick} disabled={isTableRefreshing} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-11 w-full sm:w-auto px-5 transition-all">
                <RefreshCw className={`h-4 w-4 ${isTableRefreshing ? "animate-spin" : ""}`} /> Muat Ulang
              </Button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[300px]">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                <tr>
                  <th scope="col" className="px-6 py-4 font-semibold w-24">ID</th>
                  <th scope="col" className="px-6 py-4 font-semibold">Nama Kategori</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center w-32">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {isTableRefreshing ? (
                  <><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></>
                ) : categories.length === 0 ? (
                  <tr>
                    <td colSpan={3} className="px-6 py-12 text-center text-zinc-500">
                      {searchQuery ? "Kategori yang dicari tidak ditemukan." : "Belum ada kategori terdaftar."}
                    </td>
                  </tr>
                ) : (
                  categories.map((cat) => (
                    <tr key={cat.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4 font-mono text-zinc-500">{cat.id}</td>
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{cat.name}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.push(`/dashboard/categories/edit/${cat.id}`)}
                            className="h-8 w-8 text-zinc-400 hover:text-zinc-100 hover:bg-zinc-200/10"
                            title="Edit Kategori"
                          >
                            <Pencil className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/30">
              <div className="text-sm text-zinc-400">
                Menampilkan <span className="font-medium text-zinc-200">{pagination.from || 0}</span> sampai <span className="font-medium text-zinc-200">{pagination.to || 0}</span> dari <span className="font-medium text-zinc-200">{pagination.total}</span> hasil
              </div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1"><ChevronLeft className="h-4 w-4" /> Prev</Button>
                <div className="flex items-center justify-center px-3 text-sm font-medium text-zinc-400">Halaman {currentPage} dari {pagination.last_page}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))} disabled={currentPage === pagination.last_page || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1">Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
}