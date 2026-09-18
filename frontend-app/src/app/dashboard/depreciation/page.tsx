/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, DollarSign, Wallet, RefreshCw, Search, Package, Printer, Loader2,
  Wrench, Coins, ArrowUpRight, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface MaintenanceItem {
  id: number;
  title: string;
  action_taken?: string | null;
  vendor_name?: string | null;
  cost: number;
  completion_date?: string | null;
}

interface AssetDepreciation {
  id: number;
  name: string;
  brand: string;
  qr_code: string;
  purchase_date: string;
  purchase_price: number;
  useful_life: number;
  residual_value: number;
  annual_depreciation: number;
  accumulated_depreciation: number;
  current_asset_value: number;
  depreciation_percentage: number;
  is_fully_depreciated: boolean;
  total_maintenance_cost: number;
  total_cost_of_ownership: number;
  maintenances?: MaintenanceItem[];
  category?: { id: number; name: string };
  image_url?: string | null;
}

interface DepreciationSummary {
  total_acquisition_cost: number;
  total_accumulated_depreciation: number;
  total_current_asset_value: number;
  total_maintenance_cost: number;
  total_cost_of_ownership: number;
  total_assets_count: number;
}

const formatRupiah = (value: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value || 0);
};

// ==========================================
// KOMPONEN SKELETON PROPOSIONAL & PRESISI (1:1)
// ==========================================
function HeaderSkeleton() {
  return (
    <div className="animate-pulse space-y-2">
      <div className="flex items-center gap-3">
        <div className="h-7 w-7 rounded-lg bg-zinc-800" />
        <div className="h-8 w-64 rounded-lg bg-zinc-800" />
      </div>
      <div className="h-4 w-96 rounded bg-zinc-800/60" />
    </div>
  );
}

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-zinc-800 bg-zinc-900/40 p-5">
      <div className="h-4 w-36 rounded bg-zinc-800" />
      <div className="h-8 w-44 rounded-md bg-zinc-800 mt-4" />
      <div className="h-3 w-28 rounded bg-zinc-800/50 mt-2" />
    </div>
  );
}

function ControlsSkeleton() {
  return (
    <div className="animate-pulse border-b border-zinc-800 flex flex-col sm:flex-row items-center bg-zinc-900/20">
      <div className="w-full sm:w-[60%] p-4 sm:px-6 flex items-center">
        <div className="h-11 w-full sm:w-72 rounded-md bg-zinc-800" />
      </div>

      <div className="w-full sm:w-[40%] px-4 pb-4 sm:pb-0 sm:pr-6 flex items-center sm:justify-end gap-3 flex-wrap">
        <div className="h-10 w-full sm:w-32 rounded-lg bg-zinc-800" />
        <div className="h-10 w-full sm:w-44 rounded-lg bg-zinc-800" />
      </div>
    </div>
  );
}

function TableHeaderSkeleton() {
  return (
    <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
      <tr className="animate-pulse">
        <th scope="col" className="px-5 py-4 w-[22%]"><div className="h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-4 py-4 w-[14%] text-center"><div className="h-3.5 w-20 rounded bg-zinc-800 mx-auto" /></th>
        <th scope="col" className="px-4 py-4 w-[12%] text-center"><div className="mx-auto h-3.5 w-16 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-4 py-4 w-[14%] text-center"><div className="h-3.5 w-20 rounded bg-zinc-800 mx-auto" /></th>
        <th scope="col" className="px-4 py-4 w-[14%] text-center"><div className="h-3.5 w-20 rounded bg-zinc-800 mx-auto" /></th>
        <th scope="col" className="px-4 py-4 w-[14%] text-center"><div className="h-3.5 w-20 rounded bg-zinc-800 mx-auto" /></th>
        <th scope="col" className="px-4 py-4 w-[10%] text-center"><div className="mx-auto h-3.5 w-14 rounded bg-zinc-800" /></th>
      </tr>
    </thead>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      <td className="px-5 py-4"><div className="space-y-2"><div className="h-4 w-36 rounded bg-zinc-800" /><div className="h-3 w-24 rounded bg-zinc-800/50" /></div></td>
      <td className="px-4 py-4 text-center"><div className="h-4 w-20 rounded bg-zinc-800 mx-auto" /></td>
      <td className="px-4 py-4 text-center"><div className="h-4 w-14 rounded bg-zinc-800 mx-auto" /></td>
      <td className="px-4 py-4 text-center"><div className="h-4 w-18 rounded bg-zinc-800 mx-auto" /></td>
      <td className="px-4 py-4 text-center"><div className="h-4 w-20 rounded bg-zinc-800 mx-auto" /></td>
      <td className="px-4 py-4 text-center"><div className="h-4 w-20 rounded bg-zinc-800 mx-auto" /></td>
      <td className="px-4 py-4 text-center"><div className="h-5 w-16 rounded-full bg-zinc-800 mx-auto" /></td>
    </tr>
  );
}

export default function DepreciationPage() {
  const [assets, setAssets] = useState<AssetDepreciation[]>([]);
  const [summary, setSummary] = useState<DepreciationSummary>({
    total_acquisition_cost: 0,
    total_accumulated_depreciation: 0,
    total_current_asset_value: 0,
    total_maintenance_cost: 0,
    total_cost_of_ownership: 0,
    total_assets_count: 0,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  // Modal State untuk Riwayat Servis
  const [selectedAssetForLogs, setSelectedAssetForLogs] = useState<AssetDepreciation | null>(null);

  const router = useRouter();

  const loadDepreciationData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const response = await fetch(`${API_URL}/api/assets/depreciation-summary`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      if (response.ok) {
        const result = await response.json();
        setSummary(result.data?.summary || {
          total_acquisition_cost: 0,
          total_accumulated_depreciation: 0,
          total_current_asset_value: 0,
          total_maintenance_cost: 0,
          total_cost_of_ownership: 0,
          total_assets_count: 0,
        });
        setAssets(result.data?.assets || []);
      }
    } catch (error) {
      console.error("Gagal memuat valuasi depresiasi:", error);
    } finally {
      setTimeout(() => {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }, 300);
    }
  }, [router]);

  useEffect(() => {
    loadDepreciationData();
  }, [loadDepreciationData]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setSearchQuery("");
    loadDepreciationData();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");
    
    try {
      const response = await fetch(`${API_URL}/api/reports/depreciation/pdf`, {
        method: 'GET',
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });

      if (!response.ok) throw new Error("Gagal mengunduh laporan PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      
      const a = document.createElement('a');
      a.href = url;
      a.download = `Laporan_EAM_SayPraz_${new Date().getTime()}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan saat mengekspor dokumen PDF.");
    } finally {
      setIsExporting(false);
    }
  };

  const filteredAssets = assets.filter((asset) =>
    asset.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.brand.toLowerCase().includes(searchQuery.toLowerCase()) ||
    asset.qr_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (asset.category?.name && asset.category.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <FontKillerStyles />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER SECTION */}
        {isInitialLoading ? (
          <HeaderSkeleton />
        ) : (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
              <TrendingDown className="h-7 w-7 text-zinc-300" /> Depresiasi & Nilai Aset
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Perhitungan otomatis penyusutan nilai aset garis lurus serta analisis akumulasi Total Cost of Ownership (TCO).
            </p>
          </div>
        )}

        {/* 4 FINANCIAL STAT CARDS (TERMASUK METRIK TCO) */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {isInitialLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Total Nilai Akuisisi Awal */}
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-black/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Harga Akuisisi
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-300">
                    <Wallet className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-mono text-2xl font-extrabold tracking-tight text-zinc-100">
                    {formatRupiah(summary.total_acquisition_cost)}
                  </p>
                  <span className="text-xs text-zinc-500">{summary.total_assets_count} Unit terdaftar</span>
                </div>
              </div>

              {/* Akumulasi Depresiasi */}
              <div className="group relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-950/10 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">
                    Akumulasi Depresiasi
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
                    <TrendingDown className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-mono text-2xl font-extrabold tracking-tight text-rose-400">
                    - {formatRupiah(summary.total_accumulated_depreciation)}
                  </p>
                  <span className="text-xs text-zinc-500">
                    {summary.total_acquisition_cost > 0 
                      ? `${Math.round((summary.total_accumulated_depreciation / summary.total_acquisition_cost) * 100)}% tersusut` 
                      : "0% tersusut"}
                  </span>
                </div>
              </div>

              {/* Valuasi Riil Terkini (NAV) */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
                    Valuasi Riil (NAV)
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <DollarSign className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-mono text-2xl font-extrabold tracking-tight text-emerald-300">
                    {formatRupiah(summary.total_current_asset_value)}
                  </p>
                  <span className="text-xs text-zinc-500">Nilai sisa Aset saat ini</span>
                </div>
              </div>

              {/* Total Cost of Ownership (TCO) */}
              <div className="group relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-b from-amber-950/20 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50 hover:shadow-xl hover:shadow-amber-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-amber-300/90">
                    Total Harga TCO 
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-amber-500/30 bg-amber-500/10 text-amber-400">
                    <Coins className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-mono text-2xl font-extrabold tracking-tight text-amber-300">
                    {formatRupiah(summary.total_cost_of_ownership)}
                  </p>
                  <span className="text-xs text-zinc-500">Akuisisi + {formatRupiah(summary.total_maintenance_cost)} servis</span>
                </div>
              </div>
            </>
          )}
        </div>

        {/* TABEL DATA VALUASI */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col shadow-lg shadow-zinc-950/50">
          
          {/* CONTROL SEARCH & REFRESH */}
          {isInitialLoading ? (
            <ControlsSkeleton />
          ) : (
            <div className="border-b border-zinc-800 flex flex-col sm:flex-row items-center bg-zinc-900/20">
              <div className="w-full sm:w-[60%] p-4 sm:px-6 flex items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    placeholder="Cari aset, merek, kode..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full"
                  />
                </div>
              </div>

              <div className="w-full sm:w-[40%] px-4 pb-4 sm:pb-0 sm:pr-6 flex items-center sm:justify-end gap-3 flex-wrap">
                <Button 
                  variant="outline" 
                  onClick={handleRefreshClick} 
                  disabled={isRefreshing || isExporting} 
                  className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all w-full sm:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Muat Ulang
                </Button>

                <Button 
                  onClick={handleExportPDF} 
                  disabled={isRefreshing || isExporting} 
                  className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all"
                >
                  {isExporting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Printer className="h-4 w-4" />}
                  {isExporting ? "Memproses PDF..." : "Cetak Laporan PDF"}
                </Button>
              </div>
            </div>
          )}

          {/* TABLE DATA */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left text-sm text-zinc-400 table-fixed">
              
              {isInitialLoading ? (
                <TableHeaderSkeleton />
              ) : (
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                  <tr>
                    <th scope="col" className="px-5 py-4 font-semibold w-[22%]">Nama Aset & QR</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center w-[14%]">Harga Awal</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center w-[12%]">Masa Manfaat</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center w-[14%]">Penyusutan / Thn</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center w-[14%]">Nilai Riil Aset</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center w-[14%]">TCO & Servis</th>
                    <th scope="col" className="px-4 py-4 font-semibold text-center w-[10%]">Status</th>
                  </tr>
                </thead>
              )}

              <tbody className="divide-y divide-zinc-800/60">
                {isInitialLoading || isRefreshing ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : filteredAssets.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Package className="h-10 w-10 text-zinc-700" />
                        {searchQuery ? "Data aset tidak ditemukan berdasarkan pencarian." : "Belum ada data aset untuk dihitung depresiasinya."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-medium text-zinc-200">{item.name}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {item.qr_code} • {item.brand} {item.category?.name ? `(${item.category.name})` : ""}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center font-mono text-zinc-300 text-xs">
                        {formatRupiah(Number(item.purchase_price))}
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="text-zinc-200 font-semibold text-xs">{item.useful_life} Tahun</div>
                        <div className="text-[10px] text-zinc-500 font-mono">
                          Beli: {item.purchase_date ? new Date(item.purchase_date).toLocaleDateString('id-ID', {day: '2-digit', month: 'short', year: 'numeric' }) : '-'}
                        </div>
                      </td>

                      <td className="px-4 py-4 text-center font-mono text-rose-400/90 text-xs">
                        - {formatRupiah(item.annual_depreciation)}
                      </td>

                      <td className="px-4 py-4 text-center font-mono font-semibold text-emerald-400 text-xs">
                        {formatRupiah(item.current_asset_value)}
                      </td>

                      {/* KOLOM TCO & BIAYA SERVIS */}
                      <td className="px-4 py-4 text-center">
                        <div className="font-mono text-xs font-bold text-amber-300">
                          {formatRupiah(item.total_cost_of_ownership)}
                        </div>
                        <button
                          onClick={() => setSelectedAssetForLogs(item)}
                          className="text-[11px] text-zinc-400 hover:text-amber-400 inline-flex items-center gap-1 mt-0.5 transition-colors"
                        >
                          Servis: {formatRupiah(item.total_maintenance_cost)}
                          <ArrowUpRight className="h-3 w-3" />
                        </button>
                      </td>

                      <td className="px-4 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5 max-w-[90px] mx-auto">
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.is_fully_depreciated ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, item.depreciation_percentage)}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-mono ${item.is_fully_depreciated ? 'text-rose-400 font-semibold' : 'text-zinc-400'}`}>
                            {item.is_fully_depreciated ? "Habis" : `${item.depreciation_percentage}%`}
                          </span>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

        </div>
      </main>

      {/* MODAL RIWAYAT SERVIS UNIT */}
      {selectedAssetForLogs && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setSelectedAssetForLogs(null)}
        >
          <div 
            className="w-full max-w-xl bg-zinc-950 border border-zinc-800 rounded-2xl shadow-2xl p-6 space-y-5"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-center justify-between border-b border-zinc-800 pb-4">
              <div className="space-y-1">
                <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                  <Wrench className="h-5 w-5 text-amber-400" /> Riwayat Servis & Pemeliharaan
                </h3>
                <p className="text-xs text-zinc-400 font-mono">
                  {selectedAssetForLogs.qr_code} • {selectedAssetForLogs.name}
                </p>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setSelectedAssetForLogs(null)}
                className="h-9 w-9 text-zinc-400 hover:text-zinc-100 rounded-lg"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Rekap Ringkas TCO Unit */}
            <div className="grid grid-cols-2 gap-3 p-3.5 bg-zinc-900/50 border border-zinc-800/80 rounded-xl">
              <div>
                <span className="text-[11px] text-zinc-500 uppercase tracking-wider block">Harga Beli</span>
                <span className="font-mono text-sm font-semibold text-zinc-200">
                  {formatRupiah(Number(selectedAssetForLogs.purchase_price))}
                </span>
              </div>
              <div>
                <span className="text-[11px] text-amber-400/80 uppercase tracking-wider block">Total TCO Riil</span>
                <span className="font-mono text-sm font-bold text-amber-300">
                  {formatRupiah(Number(selectedAssetForLogs.total_cost_of_ownership))}
                </span>
              </div>
            </div>

            {/* List Tiket Servis */}
            <div className="max-h-[340px] overflow-y-auto space-y-3 pr-1">
              {(!selectedAssetForLogs.maintenances || selectedAssetForLogs.maintenances.length === 0) ? (
                <div className="text-center py-10 text-zinc-500 text-sm">
                  Belum ada catatan servis yang selesai untuk aset ini.
                </div>
              ) : (
                selectedAssetForLogs.maintenances.map((item) => (
                  <div key={item.id} className="p-4 rounded-xl border border-zinc-800/80 bg-zinc-900/40 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="font-semibold text-sm text-zinc-200">{item.title}</div>
                      <span className="font-mono text-xs font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-0.5 rounded">
                        {formatRupiah(Number(item.cost))}
                      </span>
                    </div>

                    {item.action_taken && (
                      <p className="text-xs text-zinc-400">
                        <strong className="text-zinc-300">Tindakan:</strong> {item.action_taken}
                      </p>
                    )}

                    <div className="flex items-center justify-between text-[11px] text-zinc-500 pt-1 border-t border-zinc-800/40">
                      <span>Vendor: {item.vendor_name || "Internal Sarpras"}</span>
                      <span>Selesai: {item.completion_date || "-"}</span>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-zinc-800">
              <Button
                type="button"
                variant="outline"
                onClick={() => setSelectedAssetForLogs(null)}
                className="bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 h-9 text-xs px-4 rounded-md"
              >
                Tutup
              </Button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}