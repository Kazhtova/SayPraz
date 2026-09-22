/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Search, ArrowUpDown, ChevronLeft, ChevronRight, Scale, 
  ArrowDownLeft, ArrowUpRight, Package, CheckCircle2, AlertTriangle, RefreshCw,
  Printer, Loader2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface JournalEntry {
  id: number;
  asset_id: number;
  transaction_date: string;
  account_name: string;
  entry_type: "debit" | "credit";
  amount: number;
  reference_type: string;
  description: string;
  asset?: {
    id: number;
    name: string;
    qr_code: string;
  };
}

interface PaginationMeta {
  current_page: number;
  last_page: number;
  total: number;
  from: number;
  to: number;
}

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
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
      <div className="w-full sm:w-[60%] p-4 sm:px-6 flex items-center gap-3">
        <div className="h-11 w-full sm:w-72 rounded-md bg-zinc-800" />
        <div className="h-11 w-44 rounded-md bg-zinc-800" />
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
        <th scope="col" className="px-5 py-4 w-[18%]"><div className="h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-5 py-4 w-[24%]"><div className="h-3.5 w-28 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-5 py-4 w-[28%]"><div className="h-3.5 w-32 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-5 py-4 w-[15%] text-right"><div className="h-3.5 w-20 rounded bg-zinc-800 ml-auto" /></th>
        <th scope="col" className="px-5 py-4 w-[15%] text-right"><div className="h-3.5 w-20 rounded bg-zinc-800 ml-auto" /></th>
      </tr>
    </thead>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      <td className="px-5 py-4"><div className="space-y-2"><div className="h-4 w-28 rounded bg-zinc-800" /><div className="h-3 w-16 rounded bg-zinc-800/50" /></div></td>
      <td className="px-5 py-4"><div className="h-4 w-40 rounded bg-zinc-800" /></td>
      <td className="px-5 py-4"><div className="space-y-2"><div className="h-3.5 w-52 rounded bg-zinc-800" /><div className="h-3 w-32 rounded bg-zinc-800/50" /></div></td>
      <td className="px-5 py-4 text-right"><div className="h-4 w-24 rounded bg-zinc-800 ml-auto" /></td>
      <td className="px-5 py-4 text-right"><div className="h-4 w-24 rounded bg-zinc-800 ml-auto" /></td>
    </tr>
  );
}

export default function JournalsPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState({ total_debit: 0, total_credit: 0, is_balanced: true });
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  const [search, setSearch] = useState("");
  const [entryTypeFilter, setEntryTypeFilter] = useState("all");
  const [currentPage, setCurrentPage] = useState(1);

  const fetchJournals = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const params = new URLSearchParams({
        page: currentPage.toString(),
        search: search,
        entry_type: entryTypeFilter
      });

      const res = await fetch(`${API_URL}/api/journals?${params.toString()}`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });

      if (res.ok) {
        const json = await res.json();
        setJournals(json.data.data || []);
        setPagination({
          current_page: json.data.current_page,
          last_page: json.data.last_page,
          total: json.data.total,
          from: json.data.from,
          to: json.data.to,
        });
        setSummary(json.summary || { total_debit: 0, total_credit: 0, is_balanced: true });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setTimeout(() => {
        setIsInitialLoading(false);
        setIsRefreshing(false);
      }, 300);
    }
  }, [router, currentPage, search, entryTypeFilter]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setSearch("");
    setEntryTypeFilter("all");
    setCurrentPage(1);
    fetchJournals();
  };

  const handleExportPDF = async () => {
    setIsExporting(true);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/journals/export/pdf`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      if (!response.ok) throw new Error("Gagal mengunduh laporan Jurnal PDF");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = `Laporan_Jurnal_Sarpras_${new Date().getTime()}.pdf`;
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
              <BookOpen className="h-7 w-7 text-zinc-300" /> Jurnal Akuntansi & Buku Besar
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Buku catatan otomatis untuk setiap mutasi finansial aset (akuisisi, depresiasi, pemeliharaan servis, dan pelepasan).
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
              {/* Total Debit */}
              <div className="group relative overflow-hidden rounded-2xl border border-emerald-500/30 bg-gradient-to-b from-emerald-950/20 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-emerald-500/50 hover:shadow-xl hover:shadow-emerald-950/30">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-300/90">
                    Total Mutasi Debit
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-emerald-400">
                    <ArrowDownLeft className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-mono text-2xl font-extrabold tracking-tight text-emerald-300">
                    {formatRupiah(summary.total_debit)}
                  </p>
                  <span className="text-xs text-zinc-500">Akumulasi pengeluaran & aset masuk</span>
                </div>
              </div>

              {/* Total Kredit */}
              <div className="group relative overflow-hidden rounded-2xl border border-rose-500/20 bg-gradient-to-b from-rose-950/10 via-zinc-900/40 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-rose-500/40 hover:shadow-xl hover:shadow-rose-950/20">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-rose-300/80">
                    Total Mutasi Kredit
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-rose-500/30 bg-rose-500/10 text-rose-400">
                    <ArrowUpRight className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <p className="font-mono text-2xl font-extrabold tracking-tight text-rose-400">
                    {formatRupiah(summary.total_credit)}
                  </p>
                  <span className="text-xs text-zinc-500">Akumulasi pengurang & kas keluar</span>
                </div>
              </div>

              {/* Status Neraca Saldo */}
              <div className="group relative overflow-hidden rounded-2xl border border-zinc-800/80 bg-gradient-to-b from-zinc-900/60 to-zinc-950/80 p-5 backdrop-blur-xl transition-all duration-300 hover:border-zinc-700/80 hover:shadow-xl hover:shadow-black/40">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold uppercase tracking-wider text-zinc-400">
                    Status Neraca Saldo
                  </span>
                  <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-zinc-700/50 bg-zinc-800/50 text-zinc-300">
                    <Scale className="h-4 w-4" />
                  </div>
                </div>
                <div className="mt-4 space-y-1">
                  <div className="pt-1">
                    {summary.is_balanced ? (
                      <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1.5 rounded-full font-semibold">
                        <CheckCircle2 className="h-4 w-4" /> Seimbang (Balanced)
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1.5 rounded-full font-semibold">
                        <AlertTriangle className="h-4 w-4" /> Belum Seimbang
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-zinc-500 pt-1">Validasi persamaan akuntansi (Debit = Kredit)</p>
                </div>
              </div>
            </>
          )}
        </div>

        {/* TABEL DATA JURNAL */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col shadow-lg shadow-zinc-950/50">
          
          {/* CONTROL SEARCH & REFRESH & EXPORT */}
          {isInitialLoading ? (
            <ControlsSkeleton />
          ) : (
            <div className="border-b border-zinc-800 flex flex-col sm:flex-row items-center bg-zinc-900/20">
              
              {/* BAGIAN KIRI: Search Bar & Filter Posisi */}
              <div className="w-full sm:w-[60%] p-4 sm:px-6 flex flex-col sm:flex-row items-center gap-3">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    placeholder="Cari akun, aset, memo..." 
                    value={search}
                    onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full"
                  />
                </div>

                <div className="relative w-full sm:w-44">
                  <ArrowUpDown className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500 pointer-events-none" />
                  <select 
                    value={entryTypeFilter}
                    onChange={(e) => { setEntryTypeFilter(e.target.value); setCurrentPage(1); }}
                    className="pl-10 appearance-none flex h-11 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pr-8 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
                  >
                    <option value="all" className="bg-zinc-900">Semua Posisi</option>
                    <option value="debit" className="bg-zinc-900">Debit Saja</option>
                    <option value="credit" className="bg-zinc-900">Kredit Saja</option>
                  </select>
                </div>
              </div>

              {/* BAGIAN KANAN: Button Refresh & Cetak PDF */}
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
                  className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all w-full sm:w-auto"
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
                    <th scope="col" className="px-5 py-4 font-semibold w-[18%]">Tanggal & Ref</th>
                    <th scope="col" className="px-5 py-4 font-semibold w-[24%]">Nama Akun</th>
                    <th scope="col" className="px-5 py-4 font-semibold w-[28%]">Keterangan / Aset</th>
                    <th scope="col" className="px-5 py-4 font-semibold text-right w-[15%]">Debit</th>
                    <th scope="col" className="px-5 py-4 font-semibold text-right w-[15%]">Kredit</th>
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
                ) : journals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <Package className="h-10 w-10 text-zinc-700" />
                        {search ? "Catatan jurnal tidak ditemukan berdasarkan pencarian." : "Belum ada transaksi jurnal yang tercatat di pembukuan."}
                      </div>
                    </td>
                  </tr>
                ) : (
                  journals.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-5 py-4">
                        <div className="text-zinc-200 font-mono text-xs">{item.transaction_date}</div>
                        <span className="inline-block mt-0.5 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/40 text-[10px] font-mono uppercase tracking-wider text-zinc-400">
                          #{item.reference_type}
                        </span>
                      </td>

                      <td className="px-5 py-4">
                        <div className="font-medium text-zinc-200 text-xs sm:text-sm">{item.account_name}</div>
                      </td>

                      <td className="px-5 py-4">
                        <div className="text-zinc-300 text-xs line-clamp-1">{item.description}</div>
                        {item.asset && (
                          <div className="text-[10px] text-zinc-500 font-mono mt-0.5">
                            {item.asset.qr_code} • {item.asset.name}
                          </div>
                        )}
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-medium text-emerald-400 text-xs">
                        {item.entry_type === "debit" ? formatRupiah(Number(item.amount)) : "-"}
                      </td>

                      <td className="px-5 py-4 text-right font-mono font-medium text-rose-400 text-xs">
                        {item.entry_type === "credit" ? formatRupiah(Number(item.amount)) : "-"}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* PAGINATION */}
          {pagination && pagination.last_page > 1 && (
            <div className="border-t border-zinc-800 px-6 py-4 flex flex-col sm:flex-row gap-3 items-center justify-between bg-zinc-900/30">
              <div className="text-xs text-zinc-400 font-mono">
                Menampilkan <span className="font-medium text-zinc-200">{pagination.from || 0}</span> sampai <span className="font-medium text-zinc-200">{pagination.to || 0}</span> dari <span className="font-medium text-zinc-200">{pagination.total}</span> hasil
              </div>
              <div className="flex gap-2 items-center">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))} 
                  disabled={currentPage === 1 || isRefreshing} 
                  className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 h-9 rounded-md text-xs"
                >
                  <ChevronLeft className="h-4 w-4" /> Prev
                </Button>
                <div className="px-3 text-xs font-mono font-medium text-zinc-400">
                  Halaman {currentPage} dari {pagination.last_page}
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => setCurrentPage(prev => Math.min(prev + 1, pagination.last_page))} 
                  disabled={currentPage === pagination.last_page || isRefreshing} 
                  className="border-zinc-800 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 gap-1 h-9 rounded-md text-xs"
                >
                  Next <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}