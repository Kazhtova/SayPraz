/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  LogOut, Boxes, Package, AlertTriangle, CheckCircle2, ArrowUpRight,
  Search, Plus, RefreshCw, ChevronLeft, ChevronRight, Filter, 
  SlidersHorizontal, Pencil, History, X, Activity, Clock, Download
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL, APP_NAME } from "@/lib/constants";

interface Asset {
  id: number; qr_code: string; name: string; brand: string;
  purchase_year: number; status: "available" | "borrowed" | "in_repair"; category_name?: string;
}

interface AssetLog {
  id: number;
  old_status: string;
  new_status: string;
  notes: string;
  created_at: string;
  admin?: { name: string; role: string };
}

interface PaginationMeta { current_page: number; last_page: number; total: number; from: number; to: number; }
interface GlobalStats { total: number; available: number; in_repair: number; borrowed: number; }
interface Category { id: number; name: string; }

// ==========================================
// KOMPONEN SKELETON
// ==========================================
function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60"><td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-36 rounded bg-zinc-800" /><div className="h-3 w-20 rounded bg-zinc-800/50" /></div></td><td className="px-6 py-4"><div className="h-4 w-24 rounded bg-zinc-800" /></td><td className="px-6 py-4 text-center"><div className="mx-auto h-6 w-24 rounded-full bg-zinc-800" /></td><td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-12 rounded bg-zinc-800" /></td><td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded-lg bg-zinc-800" /></td></tr>
  );
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"><div className="flex items-center gap-3"><div className="h-5 w-5 rounded-full bg-zinc-800" /><div className="h-4 w-28 rounded bg-zinc-800" /></div><div className="mt-3 h-10 w-20 rounded-lg bg-zinc-800" /></div>
  );
}

// ==========================================
// KOMPONEN UTAMA HALAMAN DASHBOARD
// ==========================================
export default function DashboardPage() {
  const [items, setItems] = useState<Asset[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]); 
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [stats, setStats] = useState<GlobalStats>({ total: 0, available: 0, in_repair: 0, borrowed: 0 });
  const [isInitialLoading, setIsInitialLoading] = useState(true); 
  const [isTableRefreshing, setIsTableRefreshing] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false); // State untuk loading PDF

  // State untuk Riwayat/Log Modal
  const [assetLogs, setAssetLogs] = useState<AssetLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsModal, setLogsModal] = useState<{isOpen: boolean, assetName: string, assetId: number | null}>({ isOpen: false, assetName: "", assetId: null });

  const router = useRouter();

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    router.push("/login");
  }, [router]);

  const loadCategories = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) return;
    try {
      const response = await fetch(`${API_URL}/api/categories`, { headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" } });
      if (response.ok) {
        const result = await response.json();
        setCategories(result.data || []);
      }
    } catch (error) { console.error("Gagal memuat kategori:", error); }
  }, []);

  const loadData = useCallback(async (page: number = 1, search: string = "", category: string = "", status: string = "") => {
    const token = localStorage.getItem("token");
    if (!token) return;

    try {
      const params = new URLSearchParams({ page: page.toString() });
      if (search) params.append("search", search);
      if (category) params.append("category", category);
      if (status) params.append("status", status);

      const response = await fetch(`${API_URL}/api/assets?${params.toString()}`, {
        method: "GET",
        headers: { "Content-Type": "application/json", "Accept": "application/json", "Authorization": `Bearer ${token}` },
      });

      if (response.ok) {
        const result = await response.json();
        setItems(result.data || []); 
        setPagination(result.meta || null);

        if (result.stats) {
          setStats(result.stats);
        } else {
          setStats({
            total: result.meta?.total || (result.data || []).length,
            available: (result.data || []).filter((i: Asset) => i.status === 'available').length,
            in_repair: (result.data || []).filter((i: Asset) => i.status === 'in_repair').length,
            borrowed: (result.data || []).filter((i: Asset) => i.status === 'borrowed').length,
          });
        }
      } else if (response.status === 401) {
        handleLogout();
      }
    } catch (error) {
      console.error("Gagal terhubung ke server Laravel:", error);
    } finally {
      setTimeout(() => { setIsInitialLoading(false); setIsTableRefreshing(false); }, 500);
    }
  }, [handleLogout]);

  // FUNGSI MENGUNDUH PDF
  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/assets/pdf`, {
        method: "GET",
        headers: { "Authorization": `Bearer ${token}` }
      });

      if (!response.ok) throw new Error("Gagal mengambil dokumen PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan-Aset-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Error downloading PDF:", error);
      alert("Gagal mengunduh dokumen PDF. Pastikan backend siap.");
    } finally {
      setIsDownloading(false);
    }
  };

  // FUNGSI MEMUAT RIWAYAT LOG
  const handleOpenLogs = async (id: number, name: string) => {
    setLogsModal({ isOpen: true, assetName: name, assetId: id });
    setIsLogsLoading(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${API_URL}/api/assets/${id}/logs`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (response.ok) {
        const result = await response.json();
        setAssetLogs(result.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat riwayat", error);
    } finally {
      setIsLogsLoading(false);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) loadCategories();
  }, [loadCategories]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }
    
    setIsTableRefreshing(true);
    const delayDebounceFn = setTimeout(() => {
      loadData(currentPage, searchQuery, filterCategory, filterStatus);
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [router, currentPage, searchQuery, filterCategory, filterStatus, loadData]);

  const handleRefreshClick = () => {
    setIsTableRefreshing(true); 
    setSearchQuery(""); setFilterCategory(""); setFilterStatus(""); setCurrentPage(1);      
    loadData(1, "", "", "");
  };

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'available': return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />Tersedia</span>;
      case 'borrowed': return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20"><span className="h-1.5 w-1.5 rounded-full bg-blue-400" />Dipinjam</span>;
      case 'in_repair': return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20"><span className="h-1.5 w-1.5 rounded-full bg-amber-400" />Perbaikan</span>;
      default: return <span>{status}</span>;
    }
  };

  if (isInitialLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans antialiased">
        <FontKillerStyles />
        <main className="mx-auto max-w-7xl px-4 py-8 space-y-8">
          <div className="space-y-2 animate-pulse"><div className="h-9 w-64 rounded-lg bg-zinc-800" /><div className="h-4 w-96 rounded bg-zinc-800" /></div>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4"><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden"><div className="p-4 border-b border-zinc-800 flex justify-between animate-pulse"><div className="h-11 w-full rounded-lg bg-zinc-800" /></div><table className="w-full"><tbody><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></tbody></table></div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <FontKillerStyles />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        <div className="space-y-1"><h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dasbor Kontrol Inventaris</h1><p className="text-zinc-400 text-sm">Kelola aset dan peminjaman Sarpras.</p></div>

        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm"><div className="flex items-center gap-3 text-zinc-400 text-sm font-medium"><Package className="h-5 w-5 text-indigo-400" /> Total Aset Terdaftar</div><div className="mt-3"><p className="text-3xl font-bold text-zinc-100 tracking-tight">{stats.total}</p>{stats.total === 0 && <p className="text-xs text-zinc-500 mt-1">Belum ada barang terdaftar.</p>}</div></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm"><div className="flex items-center gap-3 text-zinc-400 text-sm font-medium"><CheckCircle2 className="h-5 w-5 text-emerald-400" /> Aset Tersedia</div><div className="mt-3"><p className="text-3xl font-bold text-zinc-100 tracking-tight">{stats.available}</p></div></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm"><div className="flex items-center gap-3 text-zinc-400 text-sm font-medium"><ArrowUpRight className="h-5 w-5 text-blue-400" /> Sedang Dipinjam</div><div className="mt-3"><p className="text-3xl font-bold text-zinc-100 tracking-tight">{stats.borrowed}</p></div></div>
          <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm"><div className="flex items-center gap-3 text-zinc-400 text-sm font-medium"><AlertTriangle className="h-5 w-5 text-amber-400" /> Dalam Perbaikan</div><div className="mt-3"><p className="text-3xl font-bold text-zinc-100 tracking-tight">{stats.in_repair}</p></div></div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col">
          <div className="border-b border-zinc-800 p-4 flex flex-col xl:flex-row gap-4 items-center justify-between bg-zinc-900/20">
            <div className="relative w-full xl:w-96"><Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><Input placeholder="Cari QR Code, nama, atau merek..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full" /></div>
            <div className="flex w-full xl:w-auto gap-3 flex-1 xl:justify-start">
              <div className="relative w-full sm:w-48"><Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="pl-10 appearance-none flex h-11 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 pr-8 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-100/50 cursor-pointer"><option value="" className="bg-zinc-900">Semua Kategori</option>{categories.map(cat => (<option key={cat.id} value={cat.name} className="bg-zinc-900">{cat.name}</option>))}<option value="Tanpa Kategori" className="bg-zinc-900">Tanpa Kategori</option></select></div>
              <div className="relative w-full sm:w-48"><SlidersHorizontal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="pl-10 appearance-none flex h-11 w-full items-center justify-between rounded-md border border-zinc-800 bg-zinc-900/50 pr-8 py-2 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-100/50 cursor-pointer"><option value="" className="bg-zinc-900">Semua Status</option><option value="available" className="bg-zinc-900">Tersedia</option><option value="borrowed" className="bg-zinc-900">Dipinjam</option><option value="in_repair" className="bg-zinc-900">Dalam Perbaikan</option></select></div>
            </div>
            
            {/* AREA TOMBOL AKSI DENGAN FITUR CETAK PDF */}
            <div className="flex w-full xl:w-auto gap-3 justify-end flex-wrap">
              <Button 
                variant="outline" 
                onClick={handleDownloadPDF} 
                disabled={isDownloading} 
                className="border-indigo-500/30 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 gap-2 h-11 w-full sm:w-auto px-5"
              >
                <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
                {isDownloading ? "Menyusun PDF..." : "Cetak PDF"}
              </Button>
              <Button onClick={() => router.push('/dashboard/add')} className="bg-zinc-100 hover:bg-zinc-300 text-zinc-950 font-medium gap-2 h-11 w-full sm:w-auto px-5"><Plus className="h-4 w-4" />Tambah Aset</Button>
              <Button variant="outline" onClick={handleRefreshClick} disabled={isTableRefreshing} className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-11 w-full sm:w-auto px-5"><RefreshCw className={`h-4 w-4 ${isTableRefreshing ? "animate-spin" : ""}`} />Muat Ulang</Button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                <tr><th className="px-6 py-4 font-semibold">Nama & Merek</th><th className="px-6 py-4 font-semibold">Kategori</th><th className="px-6 py-4 font-semibold text-center">Status</th><th className="px-6 py-4 font-semibold text-center">Tahun</th><th className="px-6 py-4 font-semibold text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {isTableRefreshing ? (<><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></>) : items.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-12 text-center text-zinc-500">{searchQuery || filterCategory || filterStatus ? "Aset dengan filter/pencarian tersebut tidak ditemukan." : "Belum ada data aset di database."}</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4"><div className="font-medium text-zinc-200">{item.name}</div><div className="text-xs text-zinc-400 mt-0.5">{item.brand}</div></td>
                      <td className="px-6 py-4 text-zinc-400">{item.category_name || '-'}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-center text-zinc-300">{item.purchase_year}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-2">
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => handleOpenLogs(item.id, item.name)}
                            className="h-8 w-8 text-zinc-400 hover:text-blue-400 hover:bg-blue-400/10"
                            title="Riwayat Aset"
                          >
                            <History className="h-4 w-4" />
                          </Button>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => router.push(`/dashboard/edit/${item.id}`)}
                            className="h-8 w-8 text-zinc-400 hover:text-indigo-400 hover:bg-indigo-400/10"
                            title="Kelola Aset"
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
              <div className="text-sm text-zinc-400">Menampilkan <span className="font-medium text-zinc-200">{pagination.from || 0}</span> sampai <span className="font-medium text-zinc-200">{pagination.to || 0}</span> dari <span className="font-medium text-zinc-200">{pagination.total}</span> hasil</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1"><ChevronLeft className="h-4 w-4" /> Prev</Button>
                <div className="flex items-center justify-center px-3 text-sm font-medium text-zinc-400">Halaman {currentPage} dari {pagination.last_page}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))} disabled={currentPage === pagination.last_page || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1">Next <ChevronRight className="h-4 w-4" /></Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL AUDIT TRAIL / RIWAYAT */}
      {logsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between p-5 border-b border-zinc-800">
              <div>
                <h2 className="text-xl font-bold text-zinc-100 flex items-center gap-2">
                  <Activity className="h-5 w-5 text-indigo-400" /> Riwayat Aset
                </h2>
                <p className="text-sm text-zinc-400 mt-1">{logsModal.assetName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLogsModal({ isOpen: false, assetName: "", assetId: null })} className="text-zinc-500 hover:text-white rounded-full">
                <X className="h-5 w-5" />
              </Button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {isLogsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-500">
                  <RefreshCw className="h-6 w-6 animate-spin text-indigo-500" />
                  <span className="text-sm">Memuat jejak riwayat...</span>
                </div>
              ) : assetLogs.length === 0 ? (
                <div className="text-center py-10">
                  <History className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
                  <p className="text-zinc-400 text-sm">Belum ada aktivitas yang tercatat untuk aset ini.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                  {assetLogs.map((log, index) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-4 border-zinc-950 bg-zinc-800 text-zinc-400 shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Clock className="h-4 w-4" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800 bg-zinc-900/50 backdrop-blur-sm shadow-sm">
                        <div className="flex flex-col mb-1">
                          <time className="text-xs font-mono text-indigo-400/80 mb-1">
                            {new Date(log.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </time>
                          <div className="text-sm font-semibold text-zinc-200">
                            {getStatusBadge(log.old_status)} <span className="text-zinc-600 mx-1">➜</span> {getStatusBadge(log.new_status)}
                          </div>
                        </div>
                        <div className="text-zinc-400 text-xs mt-2 italic border-l-2 border-zinc-700 pl-2">
                          {log.notes}
                        </div>
                        {log.admin && (
                          <div className="text-[10px] text-zinc-500 font-medium uppercase tracking-wider mt-3">
                            Oleh: {log.admin.name}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
            
          </div>
        </div>
      )}

    </div>
  );
}