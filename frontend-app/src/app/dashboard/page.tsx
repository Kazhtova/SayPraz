/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Boxes, Package, AlertTriangle, CheckCircle2, ArrowUpRight, ArrowDownRight,
  Search, Plus, RefreshCw, ChevronLeft, ChevronRight, Filter, 
  SlidersHorizontal, Pencil, History, X, Activity, Clock, Download,
  BarChart3, QrCode
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface Asset {
  id: number; qr_code: string; name: string; brand: string;
  purchase_year: number; status: "available" | "borrowed" | "in_repair"; category_name?: string;
}

interface AssetLog {
  id: number; old_status: string; new_status: string; notes: string; created_at: string;
  admin?: { name: string; role: string };
}

interface PaginationMeta { current_page: number; last_page: number; total: number; from: number; to: number; }

interface GlobalStats { 
  total: number; 
  available: number; 
  in_repair: number; 
  borrowed: number; 
  pending_transactions?: number;
  total_growth?: number;
  borrow_growth?: number;
}

interface Category { id: number; name: string; }

const initialChartData = [
  { name: 'Jan', peminjaman: 0 },
  { name: 'Feb', peminjaman: 0 },
  { name: 'Mar', peminjaman: 0 },
  { name: 'Apr', peminjaman: 0 },
  { name: 'Mei', peminjaman: 0 },
  { name: 'Jun', peminjaman: 0 },
];

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      <td className="px-6 py-4 text-left">
        <div className="space-y-2 flex flex-col items-start">
          <div className="h-4 w-32 rounded bg-zinc-800" />
          <div className="h-3 w-20 rounded bg-zinc-800/50" />
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <div className="mx-auto h-4 w-20 rounded bg-zinc-800" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="mx-auto h-6 w-20 rounded-full bg-zinc-800" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="mx-auto h-4 w-10 rounded bg-zinc-800" />
      </td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-1">
          <div className="h-8 w-8 rounded-md bg-zinc-800" />
          <div className="h-8 w-8 rounded-md bg-zinc-800" />
          <div className="h-8 w-8 rounded-md bg-zinc-800" />
        </div>
      </td>
    </tr>
  );
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5">
      <div className="flex items-center gap-2">
        <div className="h-4 w-4 rounded bg-zinc-800" />
        <div className="h-4 w-32 rounded bg-zinc-800" />
      </div>
      <div className="mt-4 flex items-end justify-between">
        <div className="h-9 w-16 rounded-md bg-zinc-800" />
        <div className="h-5 w-12 rounded bg-zinc-800" />
      </div>
      <div className="mt-3 h-2.5 w-24 rounded bg-zinc-800/50" />
    </div>
  );
}

function ChartSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-6">
      <div className="mb-8 space-y-2">
        <div className="flex items-center gap-2">
          <div className="h-5 w-5 rounded bg-zinc-800" />
          <div className="h-6 w-48 rounded bg-zinc-800" />
        </div>
        <div className="h-4 w-64 rounded bg-zinc-800/50" />
      </div>
      <div className="h-72 w-full flex items-end gap-8 border-b border-l border-zinc-800/50 px-4 pb-0 pt-4">
        {['40%', '75%', '50%', '90%', '60%', '35%'].map((height, i) => (
          <div key={i} className="w-full rounded-t-md bg-zinc-800/80" style={{ height }} />
        ))}
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [items, setItems] = useState<Asset[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]); 
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  const [stats, setStats] = useState<GlobalStats>({ 
    total: 0, available: 0, in_repair: 0, borrowed: 0, pending_transactions: 0, total_growth: 0, borrow_growth: 0 
  });
  
  const [chartData, setChartData] = useState<any[]>(initialChartData);
  const [isInitialLoading, setIsInitialLoading] = useState(true); 
  const [isTableRefreshing, setIsTableRefreshing] = useState(false); 
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [isDownloading, setIsDownloading] = useState(false);

  const [assetLogs, setAssetLogs] = useState<AssetLog[]>([]);
  const [isLogsLoading, setIsLogsLoading] = useState(false);
  const [logsModal, setLogsModal] = useState<{isOpen: boolean, assetName: string, assetId: number | null}>({ isOpen: false, assetName: "", assetId: null });

  const router = useRouter();

  const renderGrowthBadge = (growth: number | undefined) => {
    const value = growth ?? 0;
    
    if (value === 0 || value === -100) {
      return (
        <div className="flex items-center text-[11px] font-medium px-2 py-1 rounded-md mb-1 border text-zinc-400 bg-zinc-500/10 border-zinc-500/20">
          {value === -100 ? "Data Awal" : "Stabil"}
        </div>
      );
    }
    
    if (value > 0) {
      return (
        <div className="flex items-center text-[11px] font-medium px-2 py-1 rounded-md mb-1 border text-emerald-400 bg-emerald-400/10 border-emerald-400/20">
          <ArrowUpRight className="h-3 w-3 mr-0.5" /> +{value}%
        </div>
      );
    }
    
    return (
      <div className="flex items-center text-[11px] font-medium px-2 py-1 rounded-md mb-1 border text-rose-400 bg-rose-400/10 border-rose-400/20">
        <ArrowDownRight className="h-3 w-3 mr-0.5" /> {value}%
      </div>
    );
  };

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

        if (result.chart_data) {
          setChartData(result.chart_data);
        }

        if (result.stats) {
          setStats(result.stats);
        } else {
          setStats({
            total: result.meta?.total || (result.data || []).length,
            available: (result.data || []).filter((i: Asset) => i.status === 'available').length,
            in_repair: (result.data || []).filter((i: Asset) => i.status === 'in_repair').length,
            borrowed: (result.data || []).filter((i: Asset) => i.status === 'borrowed').length,
            pending_transactions: 0,
            total_growth: 0,
            borrow_growth: 0
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

  const handleDownloadPDF = async () => {
    const token = localStorage.getItem("token");
    if (!token) return;

    setIsDownloading(true);
    try {
      const response = await fetch(`${API_URL}/api/reports/assets/pdf`, {
        method: "GET",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json" 
        }
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => null);
        throw new Error(errorData?.message || `Status HTTP ${response.status}: Periksa server Laravel`);
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan-Aset-${new Date().toISOString().split('T')[0]}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error: any) {
      console.error("Error downloading PDF:", error);
      alert(`Gagal PDF: ${error.message}`);
    } finally {
      setIsDownloading(false);
    }
  };

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
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
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

  const isChartEmpty = chartData.every(d => d.peminjaman === 0);

  if (isInitialLoading && items.length === 0) {
    return (
      <div className="min-h-screen bg-zinc-950 font-sans antialiased">
        <FontKillerStyles />
        <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
          <div className="space-y-2 animate-pulse"><div className="h-9 w-64 rounded-lg bg-zinc-800" /><div className="h-4 w-96 rounded bg-zinc-800" /></div>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton /><StatCardSkeleton />
          </div>
          <ChartSkeleton />
          {/* SKELETON TABEL UTAMA & CONTROLS (SAMA PERSIS 1:1 DENGAN RENDER ASLI) */}
          <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md overflow-hidden flex flex-col shadow-sm">
            
            {/* AREA CONTROLS SKELETON */}
            <div className="animate-pulse border-b border-zinc-800/70 p-5 flex flex-col xl:flex-row gap-4 items-center justify-between">
              
              {/* Skeleton Search */}
              <div className="w-full xl:w-61">
                <div className="h-10 w-full rounded-lg bg-zinc-800/60" />
              </div>
              
              {/* Skeleton 2 Dropdown Filter */}
              <div className="flex w-full xl:w-auto gap-4.5 flex-1 xl:ml-0.5">
                <div className="w-full sm:w-54 h-10 rounded-lg bg-zinc-800/60" />
                <div className="w-full sm:w-54 h-10 rounded-lg bg-zinc-800/60" />
              </div>
              
              {/* Skeleton Grup Tombol */}
              <div className="flex flex-col w-full xl:w-auto gap-3 items-end">
                {/* Tombol Tambah Aset (warna dibuat lebih terang agar menyerupai tombol aslinya) */}
                <div className="h-10 w-full sm:w-[260px] rounded-lg bg-zinc-700/60" />
                
                {/* Tombol PDF & Muat Ulang */}
                <div className="flex w-full sm:w-auto gap-3 justify-end">
                  <div className="h-10 w-full sm:w-[120px] rounded-lg bg-zinc-800/60" />
                  <div className="h-10 w-full sm:w-[130px] rounded-lg bg-zinc-800/60" />
                </div>
              </div>
              
            </div>

            {/* AREA TABEL SKELETON */}
            <div className="overflow-x-auto min-h-[400px]">
              <table className="w-full text-sm text-zinc-400 table-fixed">
                <thead className="border-b border-zinc-800/80 bg-zinc-950/30 text-[11px] font-medium uppercase text-zinc-500 tracking-widest">
                  <tr>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Nama & Merek</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Kategori</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Tahun</th>
                    <th className="px-6 py-4 text-center whitespace-nowrap">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60">
                  <TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton />
                </tbody>
              </table>
            </div>
            
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800">
      <FontKillerStyles />

      {/* PERBAIKAN: Vertical Rhythm. Mengubah space-y-10/14 menjadi space-y-8 */}
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8 transition-all duration-500">
        
        {/* HEADER */}
        <div className="space-y-2">
          {/* System Badge & Status */}
          <div className="flex items-center gap-2.5">
            <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Sarpras SMKN 10 Surabaya Active
            </span>
            <span className="text-zinc-700">•</span>
            <span className="text-xs font-mono text-zinc-500">
              {new Date().toLocaleDateString("id-ID", { weekday: 'long', year: 'numeric', month: 'short', day: 'numeric' })}
            </span>
          </div>
        </div>

        {/* 4 STAT CARDS */}
        {/* PERBAIKAN: Jarak antar card diperkecil menjadi gap-4 */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  
          {/* CARD 1: HERO METRIC (Hierarki Tertinggi) */}
          <div className="group rounded-xl border border-zinc-700/80 bg-zinc-800/40 p-5 backdrop-blur-sm transition-all duration-200 ease-out shadow-[0_4px_24px_-4px_rgba(255,255,255,0.02)] relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-300 text-sm font-semibold relative z-10">
              <Package className="h-4 w-4 text-zinc-200" /> Total Aset Terdaftar
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              {/* PERBAIKAN: Angka Hero Card lebih besar (text-5xl) dan putih terang */}
              <p className="text-5xl font-bold text-white tracking-tighter drop-shadow-sm">{stats.total}</p>
              {renderGrowthBadge(stats.total_growth)}
            </div>
            <p className="text-[10px] text-zinc-400 mt-3 font-semibold relative z-10 tracking-wider">DIBANDING BULAN LALU</p>
            {/* Glow effect yang lebih kuat untuk membedakan dari card lain */}
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/[0.04] blur-3xl z-0 pointer-events-none"></div>
          </div>

          {/* CARD 2: SECONDARY (Diturunkan kontrasnya) */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)] hover:border-zinc-700/60 hover:bg-zinc-800/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium relative z-10">
              <CheckCircle2 className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors" /> Aset Tersedia
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              <p className="text-4xl font-bold text-zinc-100 tracking-tighter">{stats.available}</p>
              <div className="flex items-center text-[11px] font-medium text-emerald-400 bg-emerald-400/10 px-2 py-1 rounded-md mb-1 border border-emerald-400/20">
                <ArrowUpRight className="h-3 w-3 mr-0.5" /> Ready
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium relative z-10">KETERSEDIAAN SAAT INI</p>
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/[0.02] blur-3xl group-hover:bg-white/[0.04] transition-colors z-0"></div>
          </div>

          {/* CARD 3 */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)] hover:border-zinc-700/60 hover:bg-zinc-800/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium relative z-10">
              <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors" /> Sedang Dipinjam
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              <p className="text-4xl font-bold text-zinc-100 tracking-tighter">{stats.borrowed}</p>
              {renderGrowthBadge(stats.borrow_growth)}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium relative z-10">DIBANDING BULAN LALU</p>
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/[0.02] blur-3xl group-hover:bg-white/[0.04] transition-colors z-0"></div>
          </div>

          {/* CARD 4 */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-200 ease-out hover:-translate-y-[2px] hover:shadow-[0_12px_28px_-12px_rgba(0,0,0,0.35)] hover:border-zinc-700/60 hover:bg-zinc-800/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium relative z-10">
              <Clock className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors" /> Menunggu Persetujuan
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              <p className="text-4xl font-bold text-zinc-100 tracking-tighter">{stats.pending_transactions}</p>
              {(stats.pending_transactions ?? 0) > 0 && (
                <span className="flex h-2.5 w-2.5 mb-2 rounded-full bg-zinc-500/40 animate-pulse" />
              )}
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium relative z-10">PERLU TINDAKAN SEGERA</p>
            <div className="absolute -top-12 -right-12 w-32 h-32 rounded-full bg-white/[0.02] blur-3xl group-hover:bg-white/[0.04] transition-colors z-0"></div>
          </div>
          
        </div>

        {/* GRAFIK RECHARTS */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-zinc-400" /> Statistik Peminjaman
              </h3>
              <p className="text-sm text-zinc-500 mt-1">Tren peminjaman aset sarpras 6 bulan terakhir.</p>
            </div>
          </div>
          <div className="h-72 w-full relative">
            
            {/* OVERLAY EMPTY STATE JIKA DATA CHART 0 */}
            {isChartEmpty && !isTableRefreshing && (
              <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-zinc-950/40 backdrop-blur-[2px] rounded-lg border border-zinc-800/50">
                <BarChart3 className="h-8 w-8 text-zinc-600 mb-3 opacity-50" />
                <p className="text-sm font-medium text-zinc-400">Belum ada data peminjaman</p>
                <p className="text-xs text-zinc-500 mt-1">Grafik akan otomatis terbentuk setelah transaksi masuk.</p>
              </div>
            )}

            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
               <defs>
                  <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.4)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.05)" />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="4 4" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.06)', stroke: 'rgba(255, 255, 255, 0.1)', strokeWidth: 1}} 
                  contentStyle={{
                    backgroundColor: 'rgba(9, 9, 11, 0.85)', 
                    backdropFilter: 'blur(16px)', 
                    borderColor: '#3f3f46', 
                    borderRadius: '8px', 
                    color: '#a1a1aa',
                    boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.3), 0 4px 6px -4px rgba(0, 0, 0, 0.2)'
                  }} 
                  itemStyle={{color: '#ffffff', fontWeight: '600'}} 
                  wrapperStyle={{ outline: 'none' }}
                />
                
                <Bar 
                  dataKey="peminjaman" 
                  fill="url(#glassGradient)" 
                  stroke="rgba(255, 255, 255, 0.2)" 
                  strokeWidth={1}
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                  cursor="pointer"
                  activeBar={{ 
                    fill: 'rgba(255, 255, 255, 0.2)', 
                    stroke: 'rgba(255, 255, 255, 0.8)', 
                    strokeWidth: 1 
                  }}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md overflow-hidden flex flex-col shadow-sm">
          <div className="border-b border-zinc-800/70 p-5 flex flex-col xl:flex-row gap-4 items-center justify-between">
            <div className="relative w-full xl:w-61">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input placeholder="Cari aset..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 bg-zinc-950/50 border-zinc-800/80 text-sm h-10 focus-visible:ring-1 focus-visible:ring-zinc-600 w-full rounded-lg transition-all" />
            </div>
            <div className="flex w-full xl:w-auto gap-4.5 flex-1 xl:ml-0.5">
              <div className="relative w-full sm:w-54"><Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" /><select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="pl-10 appearance-none flex h-10 w-full items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/50 pr-8 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all cursor-pointer hover:border-zinc-600"><option value="" className="bg-zinc-900">Semua Kategori</option>{categories.map(cat => (<option key={cat.id} value={cat.name} className="bg-zinc-900">{cat.name}</option>))}<option value="Tanpa Kategori" className="bg-zinc-900">Tanpa Kategori</option></select></div>
              <div className="relative w-full sm:w-54"><SlidersHorizontal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" /><select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="pl-10 appearance-none flex h-10 w-full items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/50 pr-8 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-500 transition-all cursor-pointer hover:border-zinc-600"><option value="" className="bg-zinc-900">Semua Status</option><option value="available" className="bg-zinc-900">Tersedia</option><option value="borrowed" className="bg-zinc-900">Dipinjam</option><option value="in_repair" className="bg-zinc-900">Dalam Perbaikan</option></select></div>
            </div>
            
            <div className="flex flex-col w-full xl:w-auto gap-3 items-end">
              <Button onClick={() => router.push('/dashboard/add')} className="bg-zinc-100 hover:bg-zinc-200 text-zinc-900 font-medium gap-2 h-10 w-full sm:w-auto px-20 rounded-lg shadow-[0_0_15px_-3px_rgba(255,255,255,0.2)] transition-all">
                <Plus className="h-4 w-4" />Tambah Aset
              </Button>

              <div className="flex w-full sm:w-auto gap-3 justify-end">
                <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloading} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all">
                  <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
                  {isDownloading ? "Menyusun PDF..." : "Cetak PDF"}
                </Button>

                <Button variant="outline" onClick={handleRefreshClick} disabled={isTableRefreshing} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all">
                  <RefreshCw className={`h-4 w-4 ${isTableRefreshing ? "animate-spin" : ""}`} />Muat Ulang
                </Button>
              </div>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-sm text-zinc-400 table-fixed">
              <thead className="border-b border-zinc-800/80 bg-zinc-950/30 text-[11px] font-medium uppercase text-zinc-500 tracking-widest">
                <tr>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Nama & Merek</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Kategori</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Status</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Tahun</th>
                  <th className="px-6 py-4 text-center whitespace-nowrap">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {isTableRefreshing ? (
                  <><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></>
                ) : items.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-zinc-500">
                      {searchQuery || filterCategory || filterStatus ? "Aset dengan filter/pencarian tersebut tidak ditemukan." : "Belum ada data aset di database."}
                    </td>
                  </tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors duration-200 group">
                      
                      <td className="px-6 py-4 text-left">
                        <div className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.name}</div>
                        <div className="text-xs text-zinc-500 mt-0.5">{item.brand}</div>
                      </td>
                      
                      <td className="px-6 py-4 text-center text-zinc-400">
                        {item.category_name || '-'}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      
                      <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">
                        {item.purchase_year}
                      </td>
                      
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/assets/print-qr/${item.id}`)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md" title="Print QR Code"><QrCode className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => handleOpenLogs(item.id, item.name)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md" title="Riwayat Aset"><History className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" onClick={() => router.push(`/dashboard/edit/${item.id}`)} className="h-8 w-8 text-zinc-400 hover:text-white hover:bg-zinc-700/50 rounded-md" title="Kelola Aset"><Pencil className="h-4 w-4" /></Button>
                        </div>
                      </td>
                      
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {pagination && pagination.last_page > 1 && (
            <div className="border-t border-zinc-800/80 px-6 py-4 flex items-center justify-between bg-zinc-950/30">
              <div className="text-xs text-zinc-500">Menampilkan <span className="font-medium text-zinc-300">{pagination.from || 0}</span> sampai <span className="font-medium text-zinc-300">{pagination.to || 0}</span> dari <span className="font-medium text-zinc-300">{pagination.total}</span> hasil</div>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 h-8 px-3 rounded-md transition-all"><ChevronLeft className="h-3 w-3" /> Prev</Button>
                <div className="flex items-center justify-center px-2 text-xs font-medium text-zinc-500">Hal {currentPage} / {pagination.last_page}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))} disabled={currentPage === pagination.last_page || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 h-8 px-3 rounded-md transition-all">Next <ChevronRight className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL AUDIT TRAIL / RIWAYAT */}
      {logsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-[180ms]">
          <div className="bg-zinc-950 border border-zinc-800/80 rounded-2xl w-full max-w-lg shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)] flex flex-col max-h-[85vh] animate-in zoom-in-95 duration-[180ms] ease-out">
            
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-zinc-400" /> Riwayat Aset
                </h2>
                <p className="text-xs text-zinc-500 mt-1">{logsModal.assetName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLogsModal({ isOpen: false, assetName: "", assetId: null })} className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-8 w-8 transition-colors">
                <X className="h-4 w-4" />
              </Button>
            </div>

            <div className="p-5 overflow-y-auto flex-1">
              {isLogsLoading ? (
                <div className="flex flex-col items-center justify-center py-10 gap-3 text-zinc-500">
                  <RefreshCw className="h-5 w-5 animate-spin text-zinc-400" />
                  <span className="text-xs">Memuat jejak riwayat...</span>
                </div>
              ) : assetLogs.length === 0 ? (
                <div className="text-center py-10">
                  <History className="h-8 w-8 text-zinc-800 mx-auto mb-3" />
                  <p className="text-zinc-500 text-xs">Belum ada aktivitas yang tercatat untuk aset ini.</p>
                </div>
              ) : (
                <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-zinc-800 before:to-transparent">
                  {assetLogs.map((log, index) => (
                    <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                      <div className="flex items-center justify-center w-10 h-10 rounded-full border-[3px] border-zinc-950 bg-zinc-900 text-zinc-500 shadow-sm shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                        <Clock className="h-3.5 w-3.5" />
                      </div>
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm shadow-sm transition-all duration-300 hover:bg-zinc-800/40 hover:border-zinc-700 hover:-translate-y-0.5">
                        <div className="flex flex-col mb-1">
                          <time className="text-[11px] font-mono text-zinc-400 mb-1.5">
                            {new Date(log.created_at).toLocaleString("id-ID", { dateStyle: "medium", timeStyle: "short" })}
                          </time>
                          <div className="text-xs font-medium text-zinc-300 flex items-center flex-wrap gap-2">
                            {getStatusBadge(log.old_status)} <span className="text-zinc-600">➜</span> {getStatusBadge(log.new_status)}
                          </div>
                        </div>
                        <div className="text-zinc-400 text-xs mt-3 leading-relaxed">
                          {log.notes}
                        </div>
                        {log.admin && (
                          <div className="text-[10px] text-zinc-600 font-semibold uppercase tracking-widest mt-3 border-t border-zinc-800/80 pt-2">
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