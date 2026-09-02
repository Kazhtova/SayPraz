/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  ArrowLeftRight, Search, RefreshCw, CheckCircle2, XCircle, RotateCcw, Clock, CalendarIcon, X
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";
import { API_URL } from "@/lib/constants";

interface Transaction {
  id: number;
  borrowed_date: string;
  expected_returned_date: string;
  actual_returned_date?: string;
  status: "pending" | "approved" | "rejected" | "returned";
  asset?: { id: number; name: string; brand: string };
  user?: { id: number; name: string; role: string };
}

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

function ControlsSkeleton() {
  return (
    <div className="animate-pulse border-b border-zinc-800 flex flex-col xl:flex-row bg-zinc-900/20">
      <div className="w-full xl:w-[80%] p-4 sm:px-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="h-11 w-full md:w-1/3 rounded-xl bg-zinc-800" />
        <div className="flex gap-4 w-full md:w-2/3">
          <div className="h-11 w-full flex-1 rounded-xl bg-zinc-800" />
          <div className="h-11 w-full flex-1 rounded-xl bg-zinc-800" />
        </div>
      </div>
      <div className="w-full xl:w-[20%] px-4 pb-4 xl:p-0 flex items-center justify-center">
        <div className="h-10 w-full sm:w-32 rounded-lg bg-zinc-800" />
      </div>
    </div>
  );
}

// SKELETON HEADER TABEL UNTUK MENCEGAH FLASH / SHIFT
function TableHeaderSkeleton() {
  return (
    <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
      <tr className="animate-pulse">
        <th scope="col" className="px-6 py-4 w-[25%]"><div className="h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 w-[20%]"><div className="h-3.5 w-20 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 text-center w-[15%]"><div className="mx-auto h-3.5 w-20 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 text-center w-[20%]"><div className="mx-auto h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 text-center w-[20%]"><div className="mx-auto h-3.5 w-24 rounded bg-zinc-800" /></th>
      </tr>
    </thead>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      <td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-40 rounded bg-zinc-800" /><div className="h-3 w-20 rounded bg-zinc-800/50" /></div></td>
      <td className="px-6 py-4"><div className="space-y-2"><div className="h-4 w-32 rounded bg-zinc-800" /><div className="h-3 w-16 rounded bg-zinc-800/50" /></div></td>
      <td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-20 rounded bg-zinc-800" /></td>
      <td className="px-6 py-4 text-center"><div className="mx-auto h-6 w-24 rounded-full bg-zinc-800" /></td>
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2"><div className="h-8 w-16 rounded-md bg-zinc-800" /><div className="h-8 w-14 rounded-md bg-zinc-800/60" /></div>
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // === STATE UNTUK FILTER ===
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBorrowedDate, setFilterBorrowedDate] = useState<Date | undefined>();
  const [filterExpectedDate, setFilterExpectedDate] = useState<Date | undefined>();
  
  const [processingId, setProcessingId] = useState<number | null>(null);

  const router = useRouter();

  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const response = await fetch(`${API_URL}/api/transactions`, {
        headers: { "Authorization": `Bearer ${token}`, "Accept": "application/json" }
      });
      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data || []);
      }
    } catch (error) {
      console.error("Gagal memuat transaksi:", error);
    } finally {
      setTimeout(() => { 
        setIsInitialLoading(false); 
        setIsRefreshing(false); 
      }, 300);
    }
  }, [router]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  const handleRefreshClick = () => {
    setIsRefreshing(true);
    setSearchQuery("");
    setFilterBorrowedDate(undefined);
    setFilterExpectedDate(undefined);
    loadTransactions();
  };

  const handleUpdateStatus = async (id: number, newStatus: "approved" | "rejected" | "returned") => {
    if (!window.confirm(`Konfirmasi untuk mengubah status transaksi menjadi ${newStatus.toUpperCase()}?`)) return;

    setProcessingId(id);
    const token = localStorage.getItem("token");

    try {
      const response = await fetch(`${API_URL}/api/transactions/${id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ 
          status: newStatus,
          notes: `Peminjaman di-${newStatus} oleh Admin`
        })
      });

      const result = await response.json().catch(() => null);

      if (response.ok) {
        alert(result?.message || `Status transaksi berhasil diperbarui menjadi ${newStatus}!`);
        loadTransactions(); 
      } else {
        console.error("Backend Error Response:", response.status, result);
        alert(result?.message || `Gagal memproses transaksi (Status: ${response.status})`);
      }
    } catch (error) {
      console.error("Network/Fetch Exception:", error);
      alert("Terjadi kesalahan koneksi ke server Laravel. Silakan cek F12 -> Console.");
    } finally {
      setProcessingId(null);
    }
  };

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'pending': 
        return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-amber-500/10 text-amber-400 border-amber-500/20"><Clock className="h-3 w-3" /> Pending</span>;
      case 'approved': 
        return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-blue-500/10 text-blue-400 border-blue-500/20"><CheckCircle2 className="h-3 w-3" /> Dipinjam</span>;
      case 'returned': 
        return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-emerald-500/10 text-emerald-400 border-emerald-500/20"><RotateCcw className="h-3 w-3" /> Dikembalikan</span>;
      case 'rejected': 
        return <span className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium border bg-red-500/10 text-red-400 border-red-500/20"><XCircle className="h-3 w-3" /> Ditolak</span>;
      default: 
        return <span>{status}</span>;
    }
  };

  // === LOGIKA FILTERING GABUNGAN ===
  const activeTransactions = transactions.filter(t => t.status !== "returned");

  const filteredTransactions = activeTransactions.filter(t => {
    // 1. Filter Pencarian Text
    const matchesSearch = 
      t.asset?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    // 2. Filter Tanggal Pinjam (borrowed_date)
    let matchesBorrowed = true;
    if (filterBorrowedDate) {
      const trDate = new Date(t.borrowed_date).toLocaleDateString();
      const filterDate = filterBorrowedDate.toLocaleDateString();
      matchesBorrowed = trDate === filterDate;
    }

    // 3. Filter Tanggal Kembali (expected_returned_date)
    let matchesExpected = true;
    if (filterExpectedDate) {
      const exDate = new Date(t.expected_returned_date).toLocaleDateString();
      const filterExDate = filterExpectedDate.toLocaleDateString();
      matchesExpected = exDate === filterExDate;
    }

    return matchesSearch && matchesBorrowed && matchesExpected;
  });

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
              <ArrowLeftRight className="h-7 w-7 text-zinc-300" /> Transaksi Peminjaman
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Kelola persetujuan peminjaman dan pengembalian aset sekolah.</p>
          </div>
        )}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col">
          
          {/* CONTROL SEARCH, DATES & REFRESH WITH SKELETON */}
          {isInitialLoading ? (
            <ControlsSkeleton />
          ) : (
            <div className="border-b border-zinc-800 flex flex-col xl:flex-row bg-zinc-900/20 items-stretch">
              
              {/* BAGIAN KIRI: 80% (Input Teks & Filter Tanggal) */}
              <div className="w-full xl:w-[80%] p-4 sm:px-6 flex flex-col md:flex-row gap-4 items-center">
                
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    placeholder="Cari peminjam atau aset..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full"
                  />
                </div>

                <div className="flex gap-4 w-full md:w-2/3 flex-col sm:flex-row">
                  {/* Filter Tanggal Pinjam */}
                  <div className="relative w-full flex-1">
                    <Popover>
                      <PopoverTrigger
                        className={cn(
                          "w-full h-11 flex items-center justify-start px-3 text-left font-normal rounded-lg border bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all text-sm",
                          !filterBorrowedDate && "text-zinc-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        {filterBorrowedDate ? (
                          format(filterBorrowedDate, "PPP", { locale: id })
                        ) : (
                          <span>Tgl Peminjaman</span>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                        <Calendar
                          mode="single"
                          selected={filterBorrowedDate}
                          onSelect={setFilterBorrowedDate}
                          className="text-zinc-200"
                        />
                      </PopoverContent>
                    </Popover>
                    {filterBorrowedDate && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => setFilterBorrowedDate(undefined)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setFilterBorrowedDate(undefined);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-rose-400 cursor-pointer p-1"
                      >
                        <X className="h-4 w-4" />
                      </span>
                    )}
                  </div>

                  {/* Filter Tanggal Kembali */}
                  <div className="relative w-full flex-1">
                    <Popover>
                      <PopoverTrigger
                        className={cn(
                          "w-full h-11 flex items-center justify-start px-3 text-left font-normal rounded-lg border bg-zinc-900/50 border-zinc-800 hover:bg-zinc-800 hover:text-white transition-all text-sm",
                          !filterExpectedDate && "text-zinc-500"
                        )}
                      >
                        <CalendarIcon className="mr-2 h-4 w-4 shrink-0" />
                        {filterExpectedDate ? (
                          format(filterExpectedDate, "PPP", { locale: id })
                        ) : (
                          <span>Batas Kembali</span>
                        )}
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0 bg-zinc-950 border-zinc-800" align="start">
                        <Calendar
                          mode="single"
                          selected={filterExpectedDate}
                          onSelect={setFilterExpectedDate}
                          className="text-zinc-200"
                        />
                      </PopoverContent>
                    </Popover>
                    {filterExpectedDate && (
                      <span
                        role="button"
                        tabIndex={0}
                        onClick={() => setFilterExpectedDate(undefined)}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") setFilterExpectedDate(undefined);
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-rose-400 cursor-pointer p-1"
                      >
                        <X className="h-4 w-4" />
                      </span>
                    )}
                  </div>
                </div>

              </div>

              {/* BAGIAN KANAN: 20% Lebar Tabel (Pasti lurus persis dengan kolom AKSI) */}
              <div className="w-full xl:w-[20%] px-4 py-4 sm:px-6 xl:px-4 xl:py-0 flex items-center justify-center border-t xl:border-t-0 border-zinc-800/70">
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
                    <th scope="col" className="px-6 py-4 font-semibold w-[25%]">Nama Aset</th>
                    <th scope="col" className="px-6 py-4 font-semibold w-[20%]">Peminjam</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[15%]">Tgl Pinjam</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[20%]">Status</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[20%]">Aksi (Admin)</th>
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
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      {(searchQuery || filterBorrowedDate || filterExpectedDate) ? "Transaksi tidak ditemukan berdasarkan filter tersebut." : "Belum ada transaksi peminjaman aktif."}
                    </td>
                  </tr>
                ) : (
                  filteredTransactions.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/40 transition-colors">
                      <td className="px-6 py-4">
                        <div className="font-medium text-zinc-200">{item.asset?.name || "Aset Dihapus"}</div>
                        <div className="text-xs text-zinc-500">{item.asset?.brand}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-300">
                        <div className="font-medium">{item.user?.name || "User Dihapus"}</div>
                        <div className="text-xs text-zinc-500 capitalize">{item.user?.role}</div>
                      </td>
                      <td className="px-6 py-4 text-zinc-400 font-mono text-xs text-center">
                        <div className="text-zinc-300">{new Date(item.borrowed_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</div>
                        <div className="text-[10px] text-zinc-500 mt-1">Hingga: {new Date(item.expected_returned_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short' })}</div>
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        <div className="flex justify-center gap-2">
                          {item.status === 'pending' && (
                            <>
                              <Button 
                                size="sm" 
                                onClick={() => handleUpdateStatus(item.id, 'approved')}
                                disabled={processingId === item.id}
                                className="bg-emerald-600 hover:bg-emerald-700 text-white h-8 text-xs font-semibold px-3"
                              >
                                Setujui
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                onClick={() => handleUpdateStatus(item.id, 'rejected')}
                                disabled={processingId === item.id}
                                className="border-red-500/30 text-red-400 hover:bg-red-500 hover:text-white h-8 text-xs font-semibold px-3"
                              >
                                Tolak
                              </Button>
                            </>
                          )}

                          {item.status === 'approved' && (
                            <Button 
                              size="sm" 
                              onClick={() => handleUpdateStatus(item.id, 'returned')}
                              disabled={processingId === item.id}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white h-8 text-xs font-semibold px-3 gap-1"
                            >
                              <RotateCcw className="h-3 w-3" /> Kembalikan
                            </Button>
                          )}

                          {item.status === 'rejected' && (
                            <span className="text-xs text-zinc-600 italic">Selesai</span>
                          )}
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