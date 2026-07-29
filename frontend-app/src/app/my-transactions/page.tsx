/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { API_URL } from "@/lib/constants";
import { 
  ArrowLeft, Clock, CheckCircle2, XCircle, ArrowDownToLine, Package, RefreshCw
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Transaction {
  id: number;
  asset_id: number;
  borrow_date: string;
  return_date: string;
  status: "pending" | "approved" | "rejected" | "returned";
  notes: string | null;
  asset: {
    name: string;
    brand: string;
    qr_code: string;
  };
}

export default function MyTransactionsPage() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  const fetchMyTransactions = async () => {
    setIsLoading(true);
    const token = localStorage.getItem("token");
    
    if (!token) {
      router.replace("/login");
      return;
    }

    try {
      // Ingat: Backend kita sudah cerdas. API ini akan otomatis 
      // hanya mengembalikan data milik siswa yang sedang login.
      const response = await fetch(`${API_URL}/api/transactions`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });

      if (response.ok) {
        const result = await response.json();
        setTransactions(result.data || []);
      } else if (response.status === 401) {
        localStorage.removeItem("token");
        router.replace("/login");
      }
    } catch (error) {
      console.error("Gagal mengambil data transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMyTransactions();
  }, []);

  // Fungsi untuk merender warna dan ikon status
  const getStatusDisplay = (status: string) => {
    switch(status) {
      case 'pending': 
        return { icon: Clock, color: "text-amber-400", bg: "bg-amber-500/10 border-amber-500/20", label: "Menunggu Persetujuan" };
      case 'approved': 
        return { icon: CheckCircle2, color: "text-indigo-400", bg: "bg-indigo-500/10 border-indigo-500/20", label: "Disetujui / Sedang Dipinjam" };
      case 'returned': 
        return { icon: ArrowDownToLine, color: "text-emerald-400", bg: "bg-emerald-500/10 border-emerald-500/20", label: "Telah Dikembalikan" };
      case 'rejected': 
        return { icon: XCircle, color: "text-rose-400", bg: "bg-rose-500/10 border-rose-500/20", label: "Ditolak" };
      default: 
        return { icon: Package, color: "text-zinc-400", bg: "bg-zinc-800 border-zinc-700", label: status };
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased">
      {/* HEADER NAVBAR */}
      <header className="sticky top-0 z-50 border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
        <div className="mx-auto max-w-5xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="icon" onClick={() => router.push('/catalog')} className="text-zinc-400 hover:text-white rounded-full">
              <ArrowLeft className="h-5 w-5" />
            </Button>
            <h1 className="text-xl font-bold tracking-tight">Riwayat Peminjaman Saya</h1>
          </div>
          <Button variant="outline" size="sm" onClick={fetchMyTransactions} disabled={isLoading} className="border-zinc-800 bg-zinc-900/50 hover:bg-zinc-800 text-zinc-300 gap-2">
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="hidden sm:inline">Perbarui</span>
          </Button>
        </div>
      </header>

      {/* KONTEN UTAMA */}
      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-4 text-zinc-500">
            <RefreshCw className="h-8 w-8 animate-spin text-indigo-500" />
            <p>Memuat data transaksi Anda...</p>
          </div>
        ) : transactions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center border border-zinc-800/50 rounded-2xl bg-zinc-900/20 border-dashed">
            <Package className="h-12 w-12 text-zinc-600 mb-4" />
            <h3 className="text-lg font-medium text-zinc-300">Belum Ada Transaksi</h3>
            <p className="text-zinc-500 mt-2 max-w-sm">Anda belum pernah mengajukan peminjaman sarana prasarana apapun.</p>
            <Button onClick={() => router.push('/catalog')} className="mt-6 bg-indigo-600 hover:bg-indigo-700 text-white">
              Lihat Katalog Aset
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:gap-6">
            {transactions.map((trx) => {
              const status = getStatusDisplay(trx.status);
              const StatusIcon = status.icon;

              return (
                <div key={trx.id} className="group flex flex-col md:flex-row gap-5 rounded-2xl border border-zinc-800 bg-zinc-900/40 p-5 md:p-6 backdrop-blur-sm transition-all hover:bg-zinc-900/80 hover:border-zinc-700">
                  
                  {/* Bagian Kiri: Info Aset */}
                  <div className="flex-1 space-y-4">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="text-xs font-mono text-zinc-500 bg-zinc-950 px-2 py-1 rounded border border-zinc-800">
                          {trx.asset?.qr_code || "Unknown QR"}
                        </span>
                        <span className="text-xs text-zinc-500">ID Transaksi: #{trx.id}</span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-zinc-100">{trx.asset?.name || "Aset Dihapus"}</h3>
                      <p className="text-sm text-zinc-400">{trx.asset?.brand}</p>
                    </div>
                    <div className="grid grid-cols-2 gap-4 pt-2 border-t border-zinc-800/60">
                      <div>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Tgl Pinjam</p>
                        <p className="text-sm text-zinc-200">{new Date(trx.borrow_date).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                      <div>
                        <p className="text-xs font-medium text-zinc-500 uppercase tracking-wider mb-1">Tgl Kembali</p>
                        <p className="text-sm text-zinc-200">{new Date(trx.return_date).toLocaleDateString("id-ID", { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </div>
                  {/* Bagian Kanan: Status & Catatan */}
                  <div className="flex flex-col md:items-end justify-center md:w-64 shrink-0 border-t md:border-t-0 md:border-l border-zinc-800/60 pt-4 md:pt-0 md:pl-6">
                    <div className={`inline-flex items-center gap-2 rounded-full px-3 py-1.5 text-xs font-semibold border ${status.bg} ${status.color}`}>
                      <StatusIcon className="h-4 w-4" />
                      {status.label}
                    </div>
                    
                    {trx.notes && (
                      <div className="mt-4 bg-zinc-950/50 rounded-lg p-3 border border-zinc-800/50 w-full text-left">
                        <p className="text-[10px] uppercase font-bold tracking-wider text-zinc-500 mb-1">Catatan Admin:</p>
                        <p className="text-xs text-zinc-300 italic">{trx.notes}</p>
                      </div>
                    )}
                  </div>
                  
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}