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
  BarChart3
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

// 💡 TANGKAP: Tambahkan total_growth dan borrow_growth ke Interface agar dikenali TypeScript
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
    <tr className="animate-pulse border-b border-zinc-800/60"><td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-36 rounded bg-zinc-800" /><div className="h-3 w-20 rounded bg-zinc-800/50" /></div></td><td className="px-6 py-4"><div className="h-4 w-24 rounded bg-zinc-800" /></td><td className="px-6 py-4 text-center"><div className="mx-auto h-6 w-24 rounded-full bg-zinc-800" /></td><td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-12 rounded bg-zinc-800" /></td><td className="px-6 py-4 text-right"><div className="ml-auto h-8 w-16 rounded-lg bg-zinc-800" /></td></tr>
  );
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-5"><div className="flex items-center gap-3"><div className="h-5 w-5 rounded-full bg-zinc-800" /><div className="h-4 w-28 rounded bg-zinc-800" /></div><div className="mt-3 h-10 w-20 rounded-lg bg-zinc-800" /></div>
  );
}

export default function DashboardPage() {
  const [items, setItems] = useState<Asset[]>([]); 
  const [categories, setCategories] = useState<Category[]>([]); 
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  
  // 💡 TANGKAP: Inisialisasi nilai awal state dengan 0
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

        // 💡 TERAPKAN: Memasukkan data ke state chart
        if (result.chart_data) {
          setChartData(result.chart_data);
        }

        // 💡 TERAPKAN: Memasukkan data ke state stats
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased selection:bg-zinc-800">
      <FontKillerStyles />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER */}
        <div className="space-y-1">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Dasbor Kontrol Inventaris</h1>
          <p className="text-zinc-400 text-sm">Kelola aset dan peminjaman Sarpras secara real-time.</p>
        </div>

        {/* 4 STAT CARDS */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4">
          
          {/* CARD 1: Total Aset Terdaftar */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.12)] hover:border-zinc-500/50 hover:bg-zinc-800/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium relative z-10">
              <Package className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors" /> Total Aset Terdaftar
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              <p className="text-4xl font-bold text-zinc-100 tracking-tighter">{stats.total}</p>
              
              {/* 💡 TERAPKAN: Growth Dinamis tanpa hack any */}
              <div className={`flex items-center text-[11px] font-medium px-2 py-1 rounded-md mb-1 border ${
                (stats.total_growth ?? 0) >= 0 
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                  : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
              }`}>
                {(stats.total_growth ?? 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {(stats.total_growth ?? 0) >= 0 ? `+${stats.total_growth}%` : `${stats.total_growth}%`}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium relative z-10">DIBANDING BULAN LALU</p>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-zinc-500/10 transition-colors z-0"></div>
          </div>

          {/* CARD 2: Aset Tersedia */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.12)] hover:border-zinc-500/50 hover:bg-zinc-800/20 relative overflow-hidden">
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
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-zinc-500/10 transition-colors z-0"></div>
          </div>

          {/* CARD 3: Sedang Dipinjam */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.12)] hover:border-zinc-500/50 hover:bg-zinc-800/20 relative overflow-hidden">
            <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium relative z-10">
              <ArrowUpRight className="h-4 w-4 text-zinc-300 group-hover:text-white transition-colors" /> Sedang Dipinjam
            </div>
            <div className="mt-4 flex items-end justify-between relative z-10">
              <p className="text-4xl font-bold text-zinc-100 tracking-tighter">{stats.borrowed}</p>
              
              {/* 💡 TERAPKAN: Growth Dinamis tanpa hack any */}
              <div className={`flex items-center text-[11px] font-medium px-2 py-1 rounded-md mb-1 border ${
                (stats.borrow_growth ?? 0) >= 0 
                  ? 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20' 
                  : 'text-rose-400 bg-rose-400/10 border-rose-400/20'
              }`}>
                {(stats.borrow_growth ?? 0) >= 0 ? <ArrowUpRight className="h-3 w-3 mr-0.5" /> : <ArrowDownRight className="h-3 w-3 mr-0.5" />}
                {(stats.borrow_growth ?? 0) >= 0 ? `+${stats.borrow_growth}%` : `${stats.borrow_growth}%`}
              </div>
            </div>
            <p className="text-[10px] text-zinc-500 mt-2 font-medium relative z-10">DIBANDING BULAN LALU</p>
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-zinc-500/10 transition-colors z-0"></div>
          </div>

          {/* CARD 4: Menunggu Persetujuan */}
          <div className="group rounded-xl border border-zinc-800/80 bg-zinc-900/40 p-5 backdrop-blur-sm transition-all duration-300 hover:-translate-y-[2px] hover:shadow-[0_0_25px_-5px_rgba(255,255,255,0.12)] hover:border-zinc-500/50 hover:bg-zinc-800/20 relative overflow-hidden">
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
            <div className="absolute -top-10 -right-10 w-24 h-24 bg-zinc-500/5 rounded-full blur-2xl group-hover:bg-zinc-500/10 transition-colors z-0"></div>
          </div>
        </div>

        {/* GRAFIK RECHARTS (Glassmorphism & Gradient SVG) */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 p-6 backdrop-blur-md">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h3 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-zinc-400" /> Statistik Peminjaman
              </h3>
              <p className="text-sm text-zinc-500 mt-1">Tren peminjaman aset sarpras 6 bulan terakhir.</p>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              {/* 💡 TERAPKAN: Menggunakan state chartData dari API */}
              <BarChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="glassGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="rgba(255, 255, 255, 0.25)" />
                    <stop offset="100%" stopColor="rgba(255, 255, 255, 0.02)" />
                  </linearGradient>
                </defs>
                
                <CartesianGrid strokeDasharray="4 4" stroke="#27272a" vertical={false} />
                <XAxis dataKey="name" stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#71717a" fontSize={12} tickLine={false} axisLine={false} dx={-10} />
                
                <Tooltip 
                  cursor={{fill: 'rgba(255, 255, 255, 0.03)'}} 
                  contentStyle={{
                    backgroundColor: 'rgba(9, 9, 11, 0.75)', 
                    backdropFilter: 'blur(12px)', 
                    borderColor: '#3f3f46', 
                    borderRadius: '8px', 
                    color: '#a1a1aa',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
                  }} 
                  itemStyle={{color: '#ffffff', fontWeight: '600'}} 
                />
                
                <Bar 
                  dataKey="peminjaman" 
                  fill="url(#glassGradient)" 
                  stroke="rgba(255, 255, 255, 0.3)" 
                  strokeWidth={1}
                  radius={[6, 6, 0, 0]} 
                  barSize={40}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* TABEL DATA */}
        <div className="rounded-xl border border-zinc-800/80 bg-zinc-900/30 backdrop-blur-md overflow-hidden flex flex-col">
          <div className="border-b border-zinc-800/80 p-5 flex flex-col xl:flex-row gap-4 items-center justify-between">
            <div className="relative w-full xl:w-96">
              <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
              <Input placeholder="Cari QR Code, nama, atau merek..." value={searchQuery} onChange={(e) => { setSearchQuery(e.target.value); setCurrentPage(1); }} className="pl-10 bg-zinc-950/50 border-zinc-800/80 text-sm h-10 focus-visible:ring-1 focus-visible:ring-zinc-600 w-full rounded-lg transition-all" />
            </div>
            <div className="flex w-full xl:w-auto gap-3 flex-1 xl:justify-start">
              <div className="relative w-full sm:w-48"><Filter className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><select value={filterCategory} onChange={(e) => { setFilterCategory(e.target.value); setCurrentPage(1); }} className="pl-10 appearance-none flex h-10 w-full items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/50 pr-8 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all cursor-pointer"><option value="" className="bg-zinc-900">Semua Kategori</option>{categories.map(cat => (<option key={cat.id} value={cat.name} className="bg-zinc-900">{cat.name}</option>))}<option value="Tanpa Kategori" className="bg-zinc-900">Tanpa Kategori</option></select></div>
              <div className="relative w-full sm:w-48"><SlidersHorizontal className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" /><select value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value); setCurrentPage(1); }} className="pl-10 appearance-none flex h-10 w-full items-center justify-between rounded-lg border border-zinc-800/80 bg-zinc-950/50 pr-8 py-2 text-sm text-zinc-300 focus:outline-none focus:ring-1 focus:ring-zinc-600 transition-all cursor-pointer"><option value="" className="bg-zinc-900">Semua Status</option><option value="available" className="bg-zinc-900">Tersedia</option><option value="borrowed" className="bg-zinc-900">Dipinjam</option><option value="in_repair" className="bg-zinc-900">Dalam Perbaikan</option></select></div>
            </div>
            
            <div className="flex w-full xl:w-auto gap-3 justify-end flex-wrap">
              <Button variant="outline" onClick={handleDownloadPDF} disabled={isDownloading} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-10 w-full sm:w-auto px-4 rounded-lg transition-all">
                <Download className={`h-4 w-4 ${isDownloading ? "animate-bounce" : ""}`} />
                {isDownloading ? "Menyusun PDF..." : "Cetak PDF"}
              </Button>
              <Button variant="outline" onClick={handleRefreshClick} disabled={isTableRefreshing} className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 text-zinc-300 gap-2 h-10 w-full sm:w-auto px-4 rounded-lg transition-all"><RefreshCw className={`h-4 w-4 ${isTableRefreshing ? "animate-spin" : ""}`} />Muat Ulang</Button>
              <Button onClick={() => router.push('/dashboard/add')} className="bg-zinc-100 hover:bg-white text-zinc-950 font-medium gap-2 h-10 w-full sm:w-auto px-5 rounded-lg shadow-sm transition-all"><Plus className="h-4 w-4" />Tambah Aset</Button>
            </div>
          </div>

          <div className="overflow-x-auto min-h-[400px]">
            <table className="w-full text-left text-sm text-zinc-400">
              <thead className="border-b border-zinc-800/80 bg-zinc-950/30 text-[11px] font-medium uppercase text-zinc-500 tracking-widest">
                <tr><th className="px-6 py-4">Nama & Merek</th><th className="px-6 py-4">Kategori</th><th className="px-6 py-4 text-center">Status</th><th className="px-6 py-4 text-center">Tahun</th><th className="px-6 py-4 text-right">Aksi</th></tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {isTableRefreshing ? (<><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /><TableRowSkeleton /></>) : items.length === 0 ? (
                  <tr><td colSpan={5} className="px-6 py-16 text-center text-zinc-500">{searchQuery || filterCategory || filterStatus ? "Aset dengan filter/pencarian tersebut tidak ditemukan." : "Belum ada data aset di database."}</td></tr>
                ) : (
                  items.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors group">
                      <td className="px-6 py-4"><div className="font-semibold text-zinc-200 group-hover:text-white transition-colors">{item.name}</div><div className="text-xs text-zinc-500 mt-0.5">{item.brand}</div></td>
                      <td className="px-6 py-4 text-zinc-400">{item.category_name || '-'}</td>
                      <td className="px-6 py-4 text-center">{getStatusBadge(item.status)}</td>
                      <td className="px-6 py-4 text-center text-zinc-400 font-mono text-xs">{item.purchase_year}</td>
                      <td className="px-6 py-4 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
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
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} disabled={currentPage === 1 || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 h-8 px-3 rounded-md"><ChevronLeft className="h-3 w-3" /> Prev</Button>
                <div className="flex items-center justify-center px-2 text-xs font-medium text-zinc-500">Hal {currentPage} / {pagination.last_page}</div>
                <Button variant="outline" size="sm" onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))} disabled={currentPage === pagination.last_page || isTableRefreshing} className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 h-8 px-3 rounded-md">Next <ChevronRight className="h-3 w-3" /></Button>
              </div>
            </div>
          )}
        </div>
      </main>

      {/* MODAL AUDIT TRAIL / RIWAYAT */}
      {logsModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-lg shadow-2xl flex flex-col max-h-[85vh]">
            
            <div className="flex items-center justify-between p-5 border-b border-zinc-800/80">
              <div>
                <h2 className="text-lg font-semibold text-zinc-100 flex items-center gap-2">
                  <Activity className="h-4 w-4 text-zinc-400" /> Riwayat Aset
                </h2>
                <p className="text-xs text-zinc-500 mt-1">{logsModal.assetName}</p>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setLogsModal({ isOpen: false, assetName: "", assetId: null })} className="text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-full h-8 w-8">
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
                      <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 backdrop-blur-sm shadow-sm transition-colors hover:bg-zinc-800/40 hover:border-zinc-700">
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