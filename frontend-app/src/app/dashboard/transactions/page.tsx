/* eslint-disable react-hooks/set-state-in-effect */
/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  ArrowLeftRight, Search, RefreshCw, CheckCircle2, XCircle, RotateCcw, Clock
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
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
// KOMPONEN SKELETON PROPOSIONAL & PRESISI
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
    <div className="animate-pulse border-b border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/20">
      <div className="h-11 w-full sm:w-96 rounded-xl bg-zinc-800" />
      <div className="h-11 w-full sm:w-32 rounded-xl bg-zinc-800" />
    </div>
  );
}

function TableRowSkeleton() {
  return (
    <tr className="animate-pulse border-b border-zinc-800/60">
      {/* Kolom 1: Nama Aset & Merek */}
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <div className="h-4 w-36 rounded bg-zinc-800" />
          <div className="h-3 w-20 rounded bg-zinc-800/50" />
        </div>
      </td>

      {/* Kolom 2: Peminjam & Role */}
      <td className="px-6 py-4">
        <div className="space-y-1.5">
          <div className="h-4 w-28 rounded bg-zinc-800" />
          <div className="h-3 w-16 rounded bg-zinc-800/50" />
        </div>
      </td>

      {/* Kolom 3: Batas Kembali */}
      <td className="px-6 py-4 text-center">
        <div className="mx-auto h-4 w-24 rounded bg-zinc-800" />
      </td>

      {/* Kolom 4: Status Badge (Tengah) */}
      <td className="px-6 py-4 text-center">
        <div className="mx-auto h-6 w-24 rounded-full bg-zinc-800" />
      </td>

      {/* Kolom 5: Aksi Admin (Tengah - 2 Tombol Skeleton) */}
      <td className="px-6 py-4 text-center">
        <div className="flex justify-center gap-2">
          <div className="h-8 w-16 rounded-md bg-zinc-800" />
          <div className="h-8 w-14 rounded-md bg-zinc-800/60" />
        </div>
      </td>
    </tr>
  );
}

export default function TransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
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

  const filteredTransactions = transactions.filter(t => 
    t.asset?.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.user?.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=IBM+Plex+Sans:wght@400;500;600;700&display=swap');
      * { font-family: 'IBM Plex Sans', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
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
          
          {/* CONTROL SEARCH & REFRESH WITH SKELETON */}
          {isInitialLoading ? (
            <ControlsSkeleton />
          ) : (
            <div className="border-b border-zinc-800 p-4 flex flex-col sm:flex-row gap-4 items-center justify-between bg-zinc-900/20">
              <div className="relative w-full sm:w-96">
                <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
                <Input 
                  placeholder="Cari peminjam atau nama aset..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 bg-zinc-900/50 border-zinc-800 text-sm h-11 focus-visible:ring-zinc-500/50 w-full"
                />
              </div>

              {/* TOMBOL MUAT ULANG DENGAN STYLE BARU */}
              <Button 
                variant="outline" 
                onClick={handleRefreshClick} 
                disabled={isRefreshing} 
                className="border-zinc-800 bg-zinc-950/50 hover:bg-zinc-800 hover:text-white text-zinc-300 gap-2 h-10 px-4 rounded-lg transition-all"
              >
                <RefreshCw className={`h-4 w-4 ${isRefreshing ? "animate-spin" : ""}`} /> Muat Ulang
              </Button>
            </div>
          )}

          {/* TABLE DATA WITH SKELETON REFRESH */}
          <div className="overflow-x-auto min-h-[350px]">
            <table className="w-full text-left text-sm text-zinc-400 table-fixed">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                <tr>
                  {/* 2. KUNCI LEBAR MASING-MASING KOLOM DENGAN PERSENTASE */}
                  <th scope="col" className="px-6 py-4 font-semibold w-[28%]">Nama Aset</th>
                  <th scope="col" className="px-6 py-4 font-semibold w-[20%]">Peminjam</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center w-[17%]">Batas Kembali</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center w-[15%]">Status</th>
                  <th scope="col" className="px-6 py-4 font-semibold text-center w-[20%]">Aksi (Admin)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800/60">
                {/* DITAMBAHKAN isRefreshing AGAR TABEL BERUBAH JADI SKELETON SAAT TOMBOL REFRESH DIKLIK */}
                {isInitialLoading || isRefreshing ? (
                  <>
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                    <TableRowSkeleton />
                  </>
                ) : filteredTransactions.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-6 py-12 text-center text-zinc-500">
                      {searchQuery ? "Transaksi tidak ditemukan." : "Belum ada riwayat transaksi peminjaman."}
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
                        {new Date(item.expected_returned_date).toLocaleDateString("id-ID", { day: 'numeric', month: 'short', year: 'numeric' })}
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

                          {(item.status === 'returned' || item.status === 'rejected') && (
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