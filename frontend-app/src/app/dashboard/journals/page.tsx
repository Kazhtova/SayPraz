/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  BookOpen, Search, ArrowUpDown, ChevronLeft, ChevronRight, Scale, 
  ArrowDownLeft, ArrowUpRight, Package, CheckCircle2, AlertTriangle
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

export default function JournalsPage() {
  const router = useRouter();
  const [journals, setJournals] = useState<JournalEntry[]>([]);
  const [pagination, setPagination] = useState<PaginationMeta | null>(null);
  const [summary, setSummary] = useState({ total_debit: 0, total_credit: 0, is_balanced: true });
  const [loading, setLoading] = useState(true);

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
      setTimeout(() => setLoading(false), 250);
    }
  }, [router, currentPage, search, entryTypeFilter]);

  useEffect(() => {
    fetchJournals();
  }, [fetchJournals]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased p-6 lg:p-8 space-y-8">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight flex items-center gap-3 text-zinc-100">
          <BookOpen className="h-7 w-7 text-zinc-300" /> Jurnal Akuntansi & Buku Besar
        </h1>
        <p className="text-zinc-400 text-sm mt-1">
          Buku catatan otomatis untuk setiap mutasi finansial aset (akuisisi, depresiasi, pemeliharaan servis, dan pelepasan).
        </p>
      </div>

      {/* Ringkasan Saldo Debit & Kredit */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Debit</span>
            <ArrowDownLeft className="h-4 w-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-400">
            {formatRupiah(summary.total_debit)}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Total Kredit</span>
            <ArrowUpRight className="h-4 w-4 text-rose-400" />
          </div>
          <div className="text-2xl font-bold font-mono text-rose-400">
            {formatRupiah(summary.total_credit)}
          </div>
        </div>

        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-5 space-y-2">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="text-xs font-semibold uppercase tracking-wider">Status Neraca Saldo</span>
            <Scale className="h-4 w-4 text-zinc-300" />
          </div>
          <div className="flex items-center gap-2 pt-1">
            {summary.is_balanced ? (
              <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-semibold">
                <CheckCircle2 className="h-4 w-4" /> Seimbang (Balanced)
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-semibold">
                <AlertTriangle className="h-4 w-4" /> Belum Seimbang
              </span>
            )}
          </div>
        </div>

      </div>

      {/* Filter Toolbar */}
      <div className="flex flex-col sm:flex-row items-center gap-4">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <Input 
            placeholder="Cari akun, aset, keterangan..."
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="pl-10 bg-zinc-900/50 border-zinc-800 h-10 text-sm"
          />
        </div>

        <div className="relative w-full sm:w-48">
          <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
          <select 
            value={entryTypeFilter}
            onChange={(e) => { setEntryTypeFilter(e.target.value); setCurrentPage(1); }}
            className="pl-10 appearance-none flex h-10 w-full items-center rounded-md border border-zinc-800 bg-zinc-900/50 pr-8 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer"
          >
            <option value="all" className="bg-zinc-900">Semua Posisi</option>
            <option value="debit" className="bg-zinc-900">Debit Saja</option>
            <option value="credit" className="bg-zinc-900">Kredit Saja</option>
          </select>
        </div>
      </div>

      {/* Tabel Jurnal */}
      <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl shadow-black/20">
        <div className="overflow-x-auto min-h-[350px]">
          <table className="w-full text-left text-sm text-zinc-400">
            <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
              <tr>
                <th className="px-6 py-4">Tanggal & Ref</th>
                <th className="px-6 py-4">Nama Akun</th>
                <th className="px-6 py-4">Keterangan / Aset</th>
                <th className="px-6 py-4 text-right">Debit</th>
                <th className="px-6 py-4 text-right">Kredit</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800/60">
              {loading ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-500">Memuat jurnal...</td>
                </tr>
              ) : journals.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-20 text-center text-zinc-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <Package className="h-8 w-8 text-zinc-700" />
                      <p>Tidak ada catatan jurnal transaksi.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                journals.map((item) => (
                  <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors font-mono text-xs">
                    <td className="px-6 py-4">
                      <div className="text-zinc-200">{item.transaction_date}</div>
                      <span className="text-[10px] text-zinc-500 uppercase">#{item.reference_type}</span>
                    </td>
                    <td className="px-6 py-4 font-sans font-medium text-zinc-200">
                      {item.account_name}
                    </td>
                    <td className="px-6 py-4 font-sans max-w-sm">
                      <div className="text-zinc-300 text-xs">{item.description}</div>
                      {item.asset && (
                        <div className="text-[11px] text-zinc-500 font-mono mt-0.5">
                          {item.asset.qr_code} • {item.asset.name}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-emerald-400">
                      {item.entry_type === "debit" ? formatRupiah(Number(item.amount)) : "-"}
                    </td>
                    <td className="px-6 py-4 text-right font-medium text-rose-400">
                      {item.entry_type === "credit" ? formatRupiah(Number(item.amount)) : "-"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {pagination && pagination.last_page > 1 && (
          <div className="border-t border-zinc-800 px-6 py-4 flex items-center justify-between bg-zinc-900/30">
            <div className="text-xs text-zinc-400 font-sans">
              Menampilkan {pagination.from || 0} - {pagination.to || 0} dari {pagination.total} transaksi
            </div>
            <div className="flex gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                disabled={currentPage === 1 || loading}
                className="h-8 bg-zinc-900 border-zinc-800 text-zinc-300 gap-1 text-xs"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Prev
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => setCurrentPage(p => Math.min(p + 1, pagination.last_page))}
                disabled={currentPage === pagination.last_page || loading}
                className="h-8 bg-zinc-900 border-zinc-800 text-zinc-300 gap-1 text-xs"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </Button>
            </div>
          </div>
        )}
      </div>

    </div>
  );
}