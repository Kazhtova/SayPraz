/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  TrendingDown, DollarSign, Wallet, RefreshCw, Search, Calculator, Package
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface AssetDepreciation {
  id: number;
  name: string;
  brand: string;
  qr_code: string;
  purchase_year: number;
  purchase_price: number;
  useful_life: number;
  residual_value: number;
  annual_depreciation: number;
  accumulated_depreciation: number;
  current_book_value: number;
  depreciation_percentage: number;
  is_fully_depreciated: boolean;
  category?: { id: number; name: string };
  image_url?: string | null;
}

interface DepreciationSummary {
  total_acquisition_cost: number;
  total_accumulated_depreciation: number;
  total_current_book_value: number;
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
    <div className="animate-pulse border-b border-zinc-800 flex flex-col sm:flex-row bg-zinc-900/20">
      <div className="w-full sm:w-[80%] p-4 sm:px-6 flex items-center">
        <div className="h-11 w-full sm:w-70 rounded-xl bg-zinc-800" />
      </div>
      <div className="w-full sm:w-[20%] px-4 pb-4 sm:p-0 flex items-center justify-center">
        <div className="h-10 w-full sm:w-32 rounded-lg bg-zinc-800" />
      </div>
    </div>
  );
}

function TableHeaderSkeleton() {
  return (
    <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
      <tr className="animate-pulse">
        <th scope="col" className="px-6 py-4 w-[24%]"><div className="h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 w-[16%] text-right"><div className="h-3.5 w-20 rounded bg-zinc-800 ml-auto" /></th>
        <th scope="col" className="px-6 py-4 w-[14%] text-center"><div className="mx-auto h-3.5 w-16 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 w-[16%] text-right"><div className="h-3.5 w-20 rounded bg-zinc-800 ml-auto" /></th>
        <th scope="col" className="px-6 py-4 w-[16%] text-right"><div className="h-3.5 w-20 rounded bg-zinc-800 ml-auto" /></th>
        <th scope="col" className="px-6 py-4 w-[14%] text-center"><div className="mx-auto h-3.5 w-16 rounded bg-zinc-800" /></th>
      </tr>
    </thead>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      <td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-36 rounded bg-zinc-800" /><div className="h-3 w-24 rounded bg-zinc-800/50" /></div></td>
      <td className="px-6 py-4 text-right"><div className="h-4 w-24 rounded bg-zinc-800 ml-auto" /></td>
      <td className="px-6 py-4 text-center"><div className="h-4 w-16 rounded bg-zinc-800 mx-auto" /></td>
      <td className="px-6 py-4 text-right"><div className="h-4 w-20 rounded bg-zinc-800 ml-auto" /></td>
      <td className="px-6 py-4 text-right"><div className="h-4 w-24 rounded bg-zinc-800 ml-auto" /></td>
      <td className="px-6 py-4 text-center"><div className="h-5 w-20 rounded-full bg-zinc-800 mx-auto" /></td>
    </tr>
  );
}

export default function DepreciationPage() {
  const [assets, setAssets] = useState<AssetDepreciation[]>([]);
  const [summary, setSummary] = useState<DepreciationSummary>({
    total_acquisition_cost: 0,
    total_accumulated_depreciation: 0,
    total_current_book_value: 0,
    total_assets_count: 0,
  });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");

  const router = useRouter();

  const loadDepreciationData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const response = await fetch(`${API_URL}/api/assets/depreciation-summary`, {
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
          total_current_book_value: 0,
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
        
        {/* HEADER SECTION WITH SKELETON */}
        {isInitialLoading ? (
          <HeaderSkeleton />
        ) : (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
              <TrendingDown className="h-7 w-7 text-zinc-300" /> Depresiasi & Nilai Aset
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Kalkulasi penurunan nilai aset secara otomatis menggunakan Metode Garis Lurus (Straight-Line Depreciation).
            </p>
          </div>
        )}

        {/* 3 FINANCIAL STAT CARDS */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {isInitialLoading ? (
            <>
              <StatCardSkeleton />
              <StatCardSkeleton />
              <StatCardSkeleton />
            </>
          ) : (
            <>
              {/* Total Harga Perolehan */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                  <Wallet className="h-4 w-4 text-zinc-300" /> Total Harga Perolehan (Awal)
                </div>
                <p className="text-3xl font-bold text-zinc-100 mt-4 font-mono tracking-tight">
                  {formatRupiah(summary.total_acquisition_cost)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase">DARI {summary.total_assets_count} ASET TERDATA</p>
              </div>

              {/* Akumulasi Penyusutan */}
              <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-2 text-zinc-400 text-sm font-medium">
                  <TrendingDown className="h-4 w-4 text-rose-400" /> Akumulasi Penyusutan
                </div>
                <p className="text-3xl font-bold text-rose-400 mt-4 font-mono tracking-tight">
                  - {formatRupiah(summary.total_accumulated_depreciation)}
                </p>
                <p className="text-[10px] text-zinc-500 mt-2 font-mono uppercase">TOTAL NILAI YANG TELAH MENYUSUT</p>
              </div>

              {/* Nilai Buku Terkini */}
              <div className="rounded-xl border border-emerald-500/30 bg-emerald-950/10 p-5 backdrop-blur-sm relative overflow-hidden">
                <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold">
                  <DollarSign className="h-4 w-4 text-emerald-400" /> Nilai Asset Terkini (Current Valuation)
                </div>
                <p className="text-3xl font-bold text-emerald-300 mt-4 font-mono tracking-tight">
                  {formatRupiah(summary.total_current_book_value)}
                </p>
                <p className="text-[10px] text-emerald-500/80 mt-2 font-mono font-medium uppercase">VALUASI RIIL ASET AKTIF</p>
              </div>
            </>
          )}
        </div>

        {/* TABEL DATA VALUASI */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col shadow-lg shadow-zinc-950/50">
          
          {/* CONTROL SEARCH & REFRESH WITH SKELETON */}
          {isInitialLoading ? (
            <ControlsSkeleton />
          ) : (
            <div className="border-b border-zinc-800 flex flex-col sm:flex-row bg-zinc-900/20">
              
              {/* BAGIAN KIRI: 80% Lebar Tabel */}
              <div className="w-full sm:w-[80%] p-4 sm:px-6 flex items-center">
                <div className="relative w-full sm:w-70">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    placeholder="Cari aset, merek, kode..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full"
                  />
                </div>
              </div>

              {/* BAGIAN KANAN: 20% Lebar Tabel */}
              <div className="w-full sm:w-[20%] px-4 pb-4 sm:p-0 flex items-center justify-center">
                <Button 
                  variant="outline" 
                  onClick={handleRefreshClick} 
                  disabled={isRefreshing} 
                  className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all w-full sm:w-auto"
                >
                  <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Muat Ulang
                </Button>
              </div>

            </div>
          )}

          {/* TABLE DATA WITH SKELETON REFRESH */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left text-sm text-zinc-400 table-fixed">
              
              {isInitialLoading ? (
                <TableHeaderSkeleton />
              ) : (
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold w-[24%]">Nama Aset & QR</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right w-[16%]">Harga Awal</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[14%]">Masa Manfaat</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right w-[16%]">Penyusutan / Thn</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-right w-[16%]">Nilai Asset Saat Ini</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[14%]">Status Manfaat</th>
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
                    <td colSpan={6} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Package className="h-10 w-10 text-zinc-700" />
                        {searchQuery ? "Data aset tidak ditemukan berdasarkan pencarian." : "Belum ada data aset untuk dihitung depresiasinya."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredAssets.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{item.name}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-0.5">
                          {item.qr_code} • {item.brand} {item.category?.name ? `(${item.category.name})` : ""}
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-zinc-300">
                        {formatRupiah(Number(item.purchase_price))}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="text-zinc-200 font-semibold text-xs">{item.useful_life} Tahun</div>
                        <div className="text-[10px] text-zinc-500 font-mono">Beli: {item.purchase_year}</div>
                      </td>

                      <td className="px-6 py-4 text-right font-mono text-rose-400/90 text-xs">
                        - {formatRupiah(item.annual_depreciation)}
                      </td>

                      <td className="px-6 py-4 text-right font-mono font-semibold text-emerald-400">
                        {formatRupiah(item.current_book_value)}
                      </td>

                      <td className="px-6 py-4 text-center">
                        <div className="flex flex-col items-center gap-1.5 max-w-[110px] mx-auto">
                          <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${item.is_fully_depreciated ? 'bg-rose-500' : 'bg-emerald-500'}`} 
                              style={{ width: `${Math.min(100, item.depreciation_percentage)}%` }}
                            />
                          </div>
                          <span className={`text-[10px] font-mono ${item.is_fully_depreciated ? 'text-rose-400 font-semibold' : 'text-zinc-400'}`}>
                            {item.is_fully_depreciated ? "Habis Manfaat" : `${item.depreciation_percentage}% Tersusut`}
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
    </div>
  );
}