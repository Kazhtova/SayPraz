/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Package, Calendar, Clock, Loader2, CheckCircle2, 
  XCircle, RefreshCw, CalendarDays, Inbox
} from "lucide-react";
import { API_URL } from "@/lib/constants";
import { Navbar } from "@/components/Navbar";

// Definisikan tipe data sesuai relasi Eloquent di Laravel
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

export default function MyTransactionsPage() {
  const router = useRouter();
  
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState<string>("all");

  const handleLogout = useCallback(() => {
    localStorage.clear();
    router.replace("/login"); 
  }, [router]);

  // Menggunakan teknik Parallel Fetching agar data riwayat termuat semua dan cepat
  const loadTransactions = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    setIsLoading(true);
    try {
      // 1. Tembak halaman pertama
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

      // 2. Jika ada lebih dari 1 halaman, eksekusi Parallel Promise
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

      // Pastikan data unik berdasarkan ID transaksi
      const uniqueData = Array.from(new Map(combinedData.map(item => [item.id, item])).values());
      
      // Urutkan dari yang terbaru (meskipun Laravel sudah sort, kita pastikan lagi di Frontend)
      uniqueData.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      
      setTransactions(uniqueData);

    } catch (error) {
      console.error("Gagal memuat riwayat transaksi:", error);
    } finally {
      setIsLoading(false);
    }
  }, [handleLogout, router]);

  useEffect(() => {
    loadTransactions();
  }, [loadTransactions]);

  // === LOGIKA FILTERING TRANSAKSI ===
  const filteredTransactions = transactions.filter((trx) => {
    if (filter === "all") return true;
    return trx.status === filter;
  });

  // Helper Formatter Tanggal
  const formatDate = (dateString: string | null) => {
    if (!dateString) return "-";
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('id-ID', { 
      day: 'numeric', month: 'short', year: 'numeric' 
    }).format(date);
  };

  // Helper Komponen Badge Status Dinamis
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
        
        {/* HEADER SECTION */}
        <div className="flex flex-col border-b border-zinc-800/60 pb-8">
          <h1 className="text-3xl font-bold tracking-tight text-zinc-100">Riwayat Peminjaman</h1>
          <p className="text-zinc-400 text-sm mt-2 mb-6 leading-relaxed">
            Pantau status pengajuan dan kelola aset yang sedang Anda pinjam di sini.
          </p>

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

        {/* LOADING & EMPTY STATES */}
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-20 text-zinc-500 gap-3">
            <Loader2 className="h-8 w-8 animate-spin text-zinc-600" />
            <p>Memuat riwayat transaksi...</p>
          </div>
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
            {/* DAFTAR TRANSAKSI (CARD LAYOUT) */}
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
                    {/* 💡 PENGAMANAN: Tambahkan operator "?." agar tidak error jika relasi asset terhapus/kosong */}
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

                    {/* Jika sudah disetujui/dikembalikan, tampilkan data aktual */}
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

      </main>
    </div>
  );
}