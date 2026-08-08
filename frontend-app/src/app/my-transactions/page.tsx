/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Calendar, Clock, CheckCircle2, 
  XCircle, RefreshCw, CalendarDays, Inbox, Activity
} from "lucide-react";
import { API_URL } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";

interface Transaction {
  id: number;
  asset_id: number;
  user_id: number;
  status: "pending" | "approved" | "rejected" | "returned";
  expected_returned_date: string;
  borrowed_at: string | null;
  returned_at: string | null;
  created_at: string;
  asset?: {
    name: string;
    brand: string;
    qr_code: string;
  };
}

// =========================================================================
// SKELETON KHUSUS CARD GRID TRANSAKSI (PRESISI 1:1)
// =========================================================================
function CardGridSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-5 animate-pulse">
      {Array.from({ length: 4 }).map((_, index) => (
        <div key={index} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm">
          {/* Bagian Atas Skeleton */}
          <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/50">
            <div className="h-6 w-24 bg-zinc-800 rounded-md" />
            <div className="h-4 w-32 bg-zinc-800 rounded" />
          </div>

          {/* Bagian Tengah Skeleton */}
          <div className="p-5 flex gap-4">
            <div className="h-14 w-14 rounded-xl bg-zinc-800 flex-shrink-0" />
            <div className="flex flex-col justify-center gap-2 flex-1">
              <div className="h-5 w-3/4 bg-zinc-800 rounded" />
              <div className="flex items-center gap-2">
                <div className="h-4 w-1/4 bg-zinc-800 rounded" />
                <div className="h-4 w-1/3 bg-zinc-800/60 rounded" />
              </div>
            </div>
          </div>

          {/* Bagian Bawah Skeleton */}
          <div className="p-5 pt-0 mt-auto">
            <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 p-3 space-y-3">
              <div className="flex items-center justify-between">
                <div className="h-4 w-32 bg-zinc-800 rounded" />
                <div className="h-4 w-24 bg-zinc-800/60 rounded" />
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// =========================================================================
// SKELETON FULL HALAMAN (Awal Memuat Apps)
// =========================================================================
function PageFullSkeleton() {
  return (
    <div className="space-y-8 animate-pulse">
      <div className="flex flex-col border-b border-zinc-800/60 pb-8 space-y-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-zinc-800/80 pb-6">
          <div className="space-y-3 max-w-2xl w-full">
            <div className="h-5 w-48 rounded-full bg-zinc-900 border border-zinc-800" />
            <div className="h-8 w-64 rounded-lg bg-zinc-800" />
            <div className="h-4 w-full sm:w-80 rounded bg-zinc-900" />
          </div>
          <div className="h-10 w-32 rounded-xl bg-zinc-900 border border-zinc-800/90" />
        </div>

        {/* Skeleton Tab Filter */}
        <div className="flex flex-wrap gap-2">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="h-9 w-24 rounded-xl bg-zinc-900/60 border border-zinc-800" />
          ))}
        </div>
      </div>

      <CardGridSkeleton />
    </div>
  );
}

export default function MyTransactionsPage() {
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);
  const [filter, setFilter] = useState<string>("all");

  const handleLogout = useCallback(() => {
    localStorage.clear();
    router.replace("/login"); 
  }, [router]);

  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setIsFiltering(true);
    try {
      const res1 = await fetch(`${API_URL}/api/transactions?page=1`, {
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
      let combinedData = [...(data1.data || [])];
      const lastPage = data1.meta?.last_page || data1.last_page || 1;

      if (lastPage > 1) {
        const promises = [];
        for (let i = 2; i <= lastPage; i++) {
          promises.push(
            fetch(`${API_URL}/api/transactions?page=${i}`, {
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
          combinedData = [...combinedData, ...(res.data || [])];
        });
      }

      const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
      uniqueData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransactions(uniqueData);

    } catch (error) {
      console.error("Gagal memuat riwayat transaksi:", error);
    } finally {
      setIsInitialLoading(false);
      setIsFiltering(false);
    }
  }, [handleLogout, router]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const filteredTransactions = transactions.filter((trx) => {
    if (filter === "all") return true;
    return trx.status === filter;
  });

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }).format(date);
  };

  const StatusBadge = ({ status }: { status: Transaction["status"] }) => {
    switch (status) {
      case "pending":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold border bg-amber-500/10 text-amber-400 border-amber-500/20 uppercase tracking-widest">
            <Clock className="h-3.5 w-3.5" /> Menunggu
          </span>
        );
      case "approved":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 uppercase tracking-widest">
            <CheckCircle2 className="h-3.5 w-3.5" /> Disetujui
          </span>
        );
      case "returned":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold border bg-blue-500/10 text-blue-400 border-blue-500/20 uppercase tracking-widest">
            <RefreshCw className="h-3.5 w-3.5" /> Dikembalikan
          </span>
        );
      case "rejected":
        return (
          <span className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-[11px] font-bold border bg-rose-500/10 text-rose-400 border-rose-500/20 uppercase tracking-widest">
            <XCircle className="h-3.5 w-3.5" /> Ditolak
          </span>
        );
      default:
        return null;
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

      <Navbar />

      <main className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 mt-10 space-y-8">
        
        {isInitialLoading ? (
          <PageFullSkeleton />
        ) : (
          <>
            {/* HEADER SECTION STATIS */}
            <div className="flex flex-col border-b border-zinc-800/60 pb-8 space-y-6">
              
              {/* Header Top Modern */}
              <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between border-b border-zinc-800/80 pb-6">
                <div className="space-y-3 max-w-2xl">
                  <div className="flex items-center gap-2.5">
                    <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[11px] font-mono font-medium bg-zinc-900 border border-zinc-800 text-zinc-400">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                      </span>
                      System Transaction Log Active
                    </span>
                    <span className="text-zinc-700">•</span>
                    <span className="text-xs font-mono text-zinc-500">Riwayat Pengguna</span>
                  </div>

                  <div>
                    <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                      Riwayat Peminjaman
                    </h1>
                    <p className="text-zinc-400 text-xs sm:text-sm mt-1.5 leading-relaxed">
                      Pantau status pengajuan dan kelola aset yang sedang Anda pinjam.
                    </p>
                  </div>
                </div>

                {/* Counter Pill */}
                <div className="flex items-center gap-3 self-start md:self-auto shrink-0">
                  <div className="flex items-center gap-2.5 px-3.5 py-2 rounded-xl bg-zinc-900/60 border border-zinc-800/90 text-xs font-semibold text-zinc-200 shadow-sm backdrop-blur-md">
                    <div className="flex items-center justify-center p-1.5 rounded-lg bg-zinc-800 text-zinc-200">
                      <Activity className="h-4 w-4 text-zinc-300" />
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[10px] uppercase font-mono font-medium text-zinc-200/70 tracking-wider">Total Riwayat</span>
                      <span className="text-sm font-bold text-white font-mono">{transactions.length} <span className="text-xs font-normal text-zinc-200/70 font-sans">Peminjaman</span></span>
                    </div>
                  </div>
                </div>
              </div>

              {/* FILTER TABS */}
              <div className="flex flex-wrap gap-2">
                {[
                  { id: "all", label: "Semua" },
                  { id: "pending", label: "Menunggu" },
                  { id: "approved", label: "Disetujui" },
                  { id: "returned", label: "Dikembalikan" },
                  { id: "rejected", label: "Ditolak" }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id)}
                    className={`px-4 py-2 text-sm font-medium rounded-xl transition-all ${
                      filter === tab.id 
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700 shadow-sm" 
                        : "bg-zinc-900/40 text-zinc-400 border border-zinc-800/60 hover:bg-zinc-800/60 hover:text-zinc-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* AREA UTAMA HASIL TRANSAKSI */}
            {isFiltering ? (
              <CardGridSkeleton />
            ) : filteredTransactions.length === 0 ? (
              <div className="rounded-2xl border border-dashed border-zinc-800 bg-zinc-900/20 py-24 flex flex-col items-center text-center">
                <div className="h-16 w-16 rounded-full bg-zinc-800/50 flex items-center justify-center mb-4">
                  <Inbox className="h-8 w-8 text-zinc-600" />
                </div>
                <h3 className="text-lg font-medium text-zinc-300 mb-1">Belum Ada Transaksi</h3>
                <p className="text-sm text-zinc-500 max-w-sm">
                  {filter === "all" 
                    ? "Anda belum pernah mengajukan peminjaman aset sarpras." 
                    : "Tidak ada transaksi yang sesuai dengan filter yang dipilih."}
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredTransactions.map((trx) => (
                  <div key={trx.id} className="flex flex-col rounded-2xl border border-zinc-800 bg-zinc-900/30 overflow-hidden shadow-sm hover:border-zinc-700 transition-colors">
                    
                    {/* Bagian Atas: Status & Tanggal Ajuan */}
                    <div className="flex items-center justify-between p-5 border-b border-zinc-800/50 bg-zinc-900/50">
                      <StatusBadge status={trx.status} />
                      <span className="text-xs font-medium text-zinc-500">
                        Diajukan: {formatDate(trx.created_at)}
                      </span>
                    </div>

                    {/* Bagian Tengah: Info Barang */}
                    <div className="p-5 flex gap-4">
                      <div className="h-14 w-14 rounded-xl bg-zinc-800 flex items-center justify-center flex-shrink-0 border border-zinc-700/50">
                        <Package className="h-6 w-6 text-zinc-500" />
                      </div>
                      <div className="flex flex-col justify-center overflow-hidden">
                        <h3 className="text-base font-bold text-zinc-100 truncate">{trx.asset?.name || "Aset Tidak Diketahui"}</h3>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-zinc-400 truncate">{trx.asset?.brand || "-"}</span>
                          <span className="h-1 w-1 rounded-full bg-zinc-700"></span>
                          <span className="text-[10px] font-mono text-zinc-300 bg-zinc-800 px-1.5 py-0.5 rounded">
                            {trx.asset?.qr_code || "N/A"}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bagian Bawah: Informasi Timeline */}
                    <div className="p-5 pt-0 mt-auto">
                      <div className="rounded-xl bg-zinc-950/50 border border-zinc-800/80 p-3 space-y-2">
                        <div className="flex items-center justify-between text-xs">
                          <div className="flex items-center gap-1.5 text-zinc-400">
                            <CalendarDays className="h-3.5 w-3.5" /> Rencana Kembali:
                          </div>
                          <span className="font-medium text-zinc-300">{formatDate(trx.expected_returned_date)}</span>
                        </div>

                        {(trx.status === "approved" || trx.status === "returned") && (
                          <>
                            <div className="h-px w-full bg-zinc-800/60 my-1"></div>
                            <div className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-1.5 text-zinc-400">
                                <Calendar className="h-3.5 w-3.5" /> Tanggal Diambil:
                              </div>
                              <span className="font-medium text-zinc-300">{formatDate(trx.borrowed_at)}</span>
                            </div>
                          </>
                        )}

                        {trx.status === "returned" && (
                          <div className="flex items-center justify-between text-xs pt-1">
                            <div className="flex items-center gap-1.5 text-blue-400/80">
                              <RefreshCw className="h-3.5 w-3.5" /> Aktual Kembali:
                            </div>
                            <span className="font-bold text-blue-400">{formatDate(trx.returned_at)}</span>
                          </div>
                        )}
                      </div>
                    </div>

                  </div>
                ))}
              </div>
            )}
          </>
        )}

      </main>
    </div>
  );
}