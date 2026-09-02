/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { 
  Search, RefreshCw, RotateCcw, History, CalendarIcon, X
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

function TableHeaderSkeleton() {
  return (
    <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
      <tr className="animate-pulse">
        <th scope="col" className="px-6 py-4 w-[25%]"><div className="h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 w-[25%]"><div className="h-3.5 w-20 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 text-center w-[15%]"><div className="mx-auto h-3.5 w-24 rounded bg-zinc-800" /></th>
        <th scope="col" className="px-6 py-4 text-center w-[15%]"><div className="mx-auto h-3.5 w-24 rounded bg-zinc-800" /></th>
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
      <td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-24 rounded bg-zinc-800" /></td>
      <td className="px-6 py-4 text-center"><div className="mx-auto h-4 w-24 rounded bg-zinc-800" /></td>
      <td className="px-6 py-4 text-center"><div className="mx-auto h-6 w-28 rounded-full bg-zinc-800" /></td>
    </tr>
  );
}

export default function HistoryTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [searchQuery, setSearchQuery] = useState("");
  const [filterBorrowedDate, setFilterBorrowedDate] = useState<Date | undefined>();
  const [filterExpectedDate, setFilterExpectedDate] = useState<Date | undefined>();

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

  const getStatusBadge = (status: string) => {
    switch(status) {
      case 'returned': 
        return <span className="inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold border bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-sm shadow-emerald-500/10"><RotateCcw className="h-3 w-3" /> Dikembalikan</span>;
      default: 
        return <span>{status}</span>;
    }
  };

  const toLocalDateString = (dateInput: string | Date | undefined) => {
    if (!dateInput) return "";
    const d = new Date(dateInput);
    if (isNaN(d.getTime())) return "";
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const historyTransactions = transactions.filter(t => t.status === "returned");
  
  const filteredTransactions = historyTransactions.filter(t => {
    const matchesSearch = 
      t.asset?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.user?.name.toLowerCase().includes(searchQuery.toLowerCase());
      
    let matchesBorrowed = true;
    if (filterBorrowedDate) {
      matchesBorrowed = toLocalDateString(t.borrowed_date) === toLocalDateString(filterBorrowedDate);
    }

    let matchesExpected = true;
    if (filterExpectedDate) {
      const returnDate = t.actual_returned_date || t.expected_returned_date;
      matchesExpected = toLocalDateString(returnDate) === toLocalDateString(filterExpectedDate);
    }

    return matchesSearch && matchesBorrowed && matchesExpected;
  });

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    `}} />
  );

  const formatDate = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("id-ID", { 
      day: 'numeric', month: 'short', year: 'numeric' 
    });
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      <FontKillerStyles />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8 space-y-8">
        
        {/* HEADER */}
        {isInitialLoading ? (
          <HeaderSkeleton />
        ) : (
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-zinc-100 flex items-center gap-3">
              <History className="h-7 w-7 text-zinc-300" /> Riwayat Transaksi
            </h1>
            <p className="text-zinc-400 text-sm mt-1">Lihat daftar histori aset sekolah yang telah selesai dipinjam dan dikembalikan.</p>
          </div>
        )}

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 backdrop-blur-sm overflow-hidden flex flex-col shadow-lg shadow-zinc-950/50">
          
          {/* CONTROLS */}
          {isInitialLoading ? (
            <ControlsSkeleton />
          ) : (
            <div className="border-b border-zinc-800 flex flex-col xl:flex-row bg-zinc-900/20 items-stretch">
              
              <div className="w-full xl:w-[80%] p-4 sm:px-6 flex flex-col md:flex-row gap-4 items-center">
                <div className="relative w-full md:w-1/3">
                  <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                  <Input 
                    placeholder="Cari histori berdasarkan aset..." 
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

                  {/* Filter Tanggal Dikembalikan */}
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
                          <span>Tgl Dikembalikan</span>
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

          {/* TABLE */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left text-sm text-zinc-400 table-fixed">
              
              {isInitialLoading ? (
                <TableHeaderSkeleton />
              ) : (
                <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                  <tr>
                    <th scope="col" className="px-6 py-4 font-semibold w-[25%]">Nama Aset</th>
                    <th scope="col" className="px-6 py-4 font-semibold w-[25%]">Peminjam</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[15%]">Tgl Pinjam</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[15%]">Tgl Dikembalikan</th>
                    <th scope="col" className="px-6 py-4 font-semibold text-center w-[20%]">Status</th>
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
                      <div className="flex flex-col items-center justify-center gap-3">
                        <History className="h-10 w-10 text-zinc-700" />
                        {(searchQuery || filterBorrowedDate || filterExpectedDate) ? "Histori transaksi tidak ditemukan berdasarkan filter tersebut." : "Belum ada riwayat aset yang dikembalikan."}
                      </div>
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
                        {formatDate(item.borrowed_date)}
                      </td>
                      <td className="px-6 py-4 text-emerald-400/80 font-mono text-xs text-center">
                        {formatDate(item.actual_returned_date || item.expected_returned_date)}
                      </td>
                      <td className="px-6 py-4 text-center">
                        {getStatusBadge(item.status)}
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