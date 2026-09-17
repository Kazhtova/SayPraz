/* eslint-disable react-hooks/static-components */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { 
  Wrench, CheckCircle2, Clock, Plus, Loader2, Search, AlertCircle, Package, ArrowUpDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { API_URL } from "@/lib/constants";

interface MaintenanceRecord {
  id: number;
  asset_id: number;
  title: string;
  issue_description: string;
  action_taken?: string | null;
  vendor_name?: string | null;
  cost: number;
  status: "pending" | "in_progress" | "completed";
  start_date: string;
  completion_date?: string | null;
  asset?: {
    id: number;
    name: string;
    qr_code: string;
    brand: string;
    purchase_price: number;
    total_cost_of_ownership?: number;
  };
}

interface AssetOption {
  id: number;
  name: string;
  qr_code: string;
  status: string;
  is_disposed?: boolean;
}

const getTodayLocalDate = () => {
  const d = new Date();
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

const formatDateOnly = (dateStr?: string | null) => {
  if (!dateStr) return "-";
  return dateStr.split("T")[0];
};

const formatRupiah = (val: number) => {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(val || 0);
};

// ==========================================
// SKELETON TABLE PRESISI 1:1 (LEGA & PROPORSI PAS)
// ==========================================
function TableSkeleton() {
  return (
    <tbody className="divide-y divide-zinc-800/60">
      {[...Array(5)].map((_, i) => (
        <tr key={i} className="animate-pulse">
          {/* 1. Aset & Tiket (22%) */}
          <td className="px-5 py-4 w-[22%]">
            <div className="space-y-2">
              <div className="h-4 w-40 rounded bg-zinc-800" />
              <div className="h-3 w-28 rounded bg-zinc-800/50" />
            </div>
          </td>

          {/* 2. Kerusakan & Solusi (24%) */}
          <td className="px-5 py-4 w-[24%]">
            <div className="space-y-2">
              <div className="h-4 w-4/5 rounded bg-zinc-800" />
              <div className="h-3 w-3/5 rounded bg-zinc-800/40" />
            </div>
          </td>

          {/* 3. Vendor & Tanggal (18%) */}
          <td className="px-5 py-4 w-[18%]">
            <div className="space-y-2">
              <div className="h-4 w-28 rounded bg-zinc-800" />
              <div className="h-3 w-20 rounded bg-zinc-800/50" />
            </div>
          </td>

          {/* 4. Biaya Servis (14%) */}
          <td className="px-5 py-4 text-center w-[14%]">
            <div className="h-4 w-24 rounded bg-zinc-800 mx-auto" />
          </td>

          {/* 5. Status Badge (11%) */}
          <td className="px-4 py-4 text-center w-[11%]">
            <div className="h-6 w-20 rounded-full bg-zinc-800 mx-auto" />
          </td>

          {/* 6. Tombol Aksi (11%) */}
          <td className="px-4 py-4 text-center w-[11%]">
            <div className="h-8 w-24 rounded-md bg-zinc-800 mx-auto" />
          </td>
        </tr>
      ))}
    </tbody>
  );
}

export default function MaintenancePage() {
  const router = useRouter();
  const [records, setRecords] = useState<MaintenanceRecord[]>([]);
  const [availableAssets, setAvailableAssets] = useState<AssetOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  // Modal State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompleteModal, setShowCompleteModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Form State: Buka Tiket
  const [formCreate, setFormCreate] = useState({
    asset_id: "",
    title: "",
    issue_description: "",
    vendor_name: "",
    start_date: getTodayLocalDate(),
  });

  // Form State: Selesaikan Tiket
  const [selectedTicket, setSelectedTicket] = useState<MaintenanceRecord | null>(null);
  const [formComplete, setFormComplete] = useState({
    action_taken: "",
    completion_date: getTodayLocalDate(),
    final_cost: "0",
  });

  const fetchData = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) { router.push("/login"); return; }

    try {
      const [resMaintenances, resAssets] = await Promise.all([
        fetch(`${API_URL}/api/maintenances`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        }),
        fetch(`${API_URL}/api/assets`, {
          headers: { Authorization: `Bearer ${token}`, Accept: "application/json" }
        })
      ]);

      if (resMaintenances.ok) {
        const json = await resMaintenances.json();
        setRecords(json.data || []);
      }

      if (resAssets.ok) {
        const json = await resAssets.json();
        setAvailableAssets((json.data || []).filter((a: AssetOption) => !a.is_disposed));
      }
    } catch (err) {
      console.error("Gagal memuat data:", err);
    } finally {
      setTimeout(() => setLoading(false), 250);
    }
  }, [router]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData();
  }, [fetchData]);

  // Eksekusi Buka Tiket Servis
  const handleCreateTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    const token = localStorage.getItem("token");

    const payload = {
      asset_id: Number(formCreate.asset_id),
      title: formCreate.title.trim(),
      issue_description: formCreate.issue_description.trim(),
      vendor_name: formCreate.vendor_name ? formCreate.vendor_name.trim() : null,
      start_date: formCreate.start_date || getTodayLocalDate(),
    };

    try {
      const res = await fetch(`${API_URL}/api/maintenances`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();

      if (!res.ok) {
        alert(resJson.message || "Gagal membuat tiket perbaikan.");
        return;
      }

      setShowCreateModal(false);
      setFormCreate({
        asset_id: "",
        title: "",
        issue_description: "",
        vendor_name: "",
        start_date: getTodayLocalDate(),
      });
      fetchData();
    } catch {
      alert("Terjadi masalah jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  // Eksekusi Selesaikan Tiket Servis
  const handleCompleteTicket = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedTicket) return;
    setSubmitting(true);
    const token = localStorage.getItem("token");

    const payload = {
      action_taken: formComplete.action_taken.trim(),
      completion_date: formComplete.completion_date || getTodayLocalDate(),
      final_cost: Number(formComplete.final_cost) || 0,
    };

    try {
      const res = await fetch(`${API_URL}/api/maintenances/${selectedTicket.id}/complete`, {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });

      const resJson = await res.json();

      if (!res.ok) {
        alert(resJson.message || "Gagal menyelesaikan tiket perbaikan.");
        return;
      }

      setShowCompleteModal(false);
      setSelectedTicket(null);
      setFormComplete({
        action_taken: "",
        completion_date: getTodayLocalDate(),
        final_cost: "0",
      });
      fetchData();
    } catch {
      alert("Terjadi masalah jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  const filteredRecords = records.filter((r) => {
    const matchesSearch = 
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.asset?.name && r.asset.name.toLowerCase().includes(search.toLowerCase())) ||
      (r.asset?.qr_code && r.asset.qr_code.toLowerCase().includes(search.toLowerCase()));

    const matchesStatus = 
      statusFilter === "all" ? true : r.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
      input[type="date"]::-webkit-calendar-picker-indicator {
        filter: invert(0.6);
        cursor: pointer;
      }
    `}} />
  );

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans antialiased py-8 px-4 sm:px-6 lg:px-8">
      <FontKillerStyles />
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header Section */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight flex items-center gap-2.5 text-zinc-100">
              <Wrench className="h-7 w-7 text-zinc-300" /> Pemeliharaan & Tiket Servis
            </h1>
            <p className="text-zinc-400 text-sm mt-1">
              Pantau log reparasi unit aset, vendor servis, serta pencatatan otomatis biaya ke jurnal keuangan.
            </p>
          </div>
          <Button 
            onClick={() => setShowCreateModal(true)}
            className="bg-zinc-100 hover:bg-white text-zinc-950 font-semibold gap-2 h-10 px-5 shadow-lg shadow-black/40 rounded-lg text-sm shrink-0"
          >
            <Plus className="h-4 w-4" /> Buka Tiket Servis
          </Button>
        </div>

        {/* Filter Toolbar */}
        <div className="flex flex-col sm:flex-row items-center gap-3">
          <div className="relative w-full sm:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
            <Input 
              placeholder="Cari tiket, aset..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10 bg-zinc-900/50 border-zinc-800 h-10 text-sm rounded-lg focus-visible:ring-zinc-500/50"
            />
          </div>

          <div className="relative w-full sm:w-52">
            <ArrowUpDown className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 pointer-events-none" />
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="pl-10 appearance-none flex h-10 w-full items-center rounded-lg border border-zinc-800 bg-zinc-900/50 pr-8 text-sm text-zinc-100 focus:outline-none focus:ring-1 focus:ring-zinc-400 cursor-pointer transition-all"
            >
              <option value="all" className="bg-zinc-900">Semua Status</option>
              <option value="in_progress" className="bg-zinc-900">Dalam Pengerjaan</option>
              <option value="completed" className="bg-zinc-900">Selesai (Ditutup)</option>
            </select>
          </div>
        </div>

        {/* Tabel Tiket: Kolom Longgar & Seimbang */}
        <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 overflow-hidden shadow-xl shadow-black/20">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-sm text-zinc-400 table-fixed min-w-[760px]">
              <thead className="border-b border-zinc-800 bg-zinc-900/60 text-xs uppercase text-zinc-400 tracking-wider">
                <tr>
                  <th className="px-5 py-3.5 w-[22%] font-semibold">Aset & Tiket</th>
                  <th className="px-5 py-3.5 w-[24%] font-semibold">Kerusakan & Solusi</th>
                  <th className="px-5 py-3.5 w-[18%] font-semibold">Vendor & Tanggal</th>
                  <th className="px-5 py-3.5 text-center w-[14%] font-semibold">Biaya Servis</th>
                  <th className="px-4 py-3.5 text-center w-[11%] font-semibold">Status</th>
                  <th className="px-4 py-3.5 text-center w-[11%] font-semibold">Aksi</th>
                </tr>
              </thead>
              {loading ? (
                <TableSkeleton />
              ) : filteredRecords.length === 0 ? (
                <tbody>
                  <tr>
                    <td colSpan={6} className="text-center py-16 text-zinc-500">
                      <div className="flex flex-col items-center justify-center gap-2">
                        <Package className="h-9 w-9 text-zinc-700" />
                        <p className="text-sm">{search ? "Tiket perbaikan tidak ditemukan." : "Belum ada riwayat perbaikan aset."}</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              ) : (
                <tbody className="divide-y divide-zinc-800/60">
                  {filteredRecords.map((item) => (
                    <tr key={item.id} className="hover:bg-zinc-800/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="font-semibold text-zinc-100 text-sm truncate">{item.title}</div>
                        <div className="text-xs text-zinc-500 font-mono mt-1 truncate">
                          {item.asset?.qr_code} • {item.asset?.name}
                        </div>
                      </td>
                      <td className="px-5 py-4">
                        <p className="line-clamp-2 text-zinc-300 text-sm leading-relaxed">{item.issue_description}</p>
                        {item.action_taken && (
                          <p className="text-xs text-emerald-400/90 mt-1 font-mono line-clamp-1">
                            Solusi: {item.action_taken}
                          </p>
                        )}
                      </td>
                      <td className="px-5 py-4 text-xs">
                        <div className="text-zinc-200 font-medium text-sm truncate">{item.vendor_name || "Internal Sarpras"}</div>
                        <div className="text-zinc-400 mt-1">Mulai: {formatDateOnly(item.start_date)}</div>
                        {item.completion_date && (
                          <div className="text-emerald-400 font-medium mt-0.5">Selesai: {formatDateOnly(item.completion_date)}</div>
                        )}
                      </td>
                      <td className="px-5 py-4 text-center font-mono font-medium text-zinc-100 text-sm">
                        {formatRupiah(Number(item.cost))}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.status === "completed" ? (
                          <span className="inline-flex items-center gap-1.5 text-xs text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-3 py-1 rounded-full font-medium">
                            <CheckCircle2 className="h-3.5 w-3.5" /> Selesai
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 text-xs text-amber-400 bg-amber-500/10 border border-amber-500/20 px-3 py-1 rounded-full font-medium">
                            <Clock className="h-3.5 w-3.5 animate-pulse" /> Proses
                          </span>
                        )}
                      </td>
                      <td className="px-4 py-4 text-center">
                        {item.status === "in_progress" ? (
                          <Button
                            size="sm"
                            onClick={() => {
                              setSelectedTicket(item);
                              setShowCompleteModal(true);
                            }}
                            className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs h-8 px-3.5 rounded-md font-medium"
                          >
                            Selesaikan
                          </Button>
                        ) : (
                          <span className="text-xs text-zinc-600 font-mono">Ditutup</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              )}
            </table>
          </div>
        </div>

      </div>

      {/* MODAL BUKA TIKET */}
      {showCreateModal && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowCreateModal(false)}
        >
          <div 
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1.5 text-left">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <Wrench className="h-5 w-5 text-amber-400" /> Buka Tiket Servis Baru
              </h3>
              <p className="text-xs text-zinc-400">
                Aset yang dipilih otomatis beralih status ke <strong>Dalam Perbaikan (in_repair)</strong>.
              </p>
            </div>

            <form onSubmit={handleCreateTicket} className="space-y-4 text-sm">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">Pilih Unit Aset <span className="text-red-500">*</span></label>
                <select 
                  required
                  value={formCreate.asset_id}
                  onChange={(e) => setFormCreate({...formCreate, asset_id: e.target.value})}
                  className="w-full bg-zinc-900/60 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                >
                  <option value="">-- Pilih Aset --</option>
                  {availableAssets.map((a) => (
                    <option key={a.id} value={a.id}>
                      [{a.qr_code}] {a.name} ({a.status})
                    </option>
                  ))}
                </select>
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">Judul Masalah / Servis <span className="text-red-500">*</span></label>
                <Input 
                  required
                  placeholder="Cth: Penggantian Kipas & Pembersihan Debu"
                  value={formCreate.title}
                  onChange={(e) => setFormCreate({...formCreate, title: e.target.value})}
                  className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-10"
                />
              </div>

              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">Deskripsi Gejala / Kerusakan <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Tuliskan kendala teknis yang dialami unit..."
                  value={formCreate.issue_description}
                  onChange={(e) => setFormCreate({...formCreate, issue_description: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-zinc-300">Vendor / Bengkel</label>
                  <Input 
                    placeholder="Opsional (Cth: Asus Center)"
                    value={formCreate.vendor_name}
                    onChange={(e) => setFormCreate({...formCreate, vendor_name: e.target.value})}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-10 text-xs"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-zinc-300">Tanggal Masuk <span className="text-red-500">*</span></label>
                  <Input 
                    type="date"
                    required
                    max={getTodayLocalDate()}
                    value={formCreate.start_date}
                    onChange={(e) => setFormCreate({...formCreate, start_date: e.target.value})}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-10 [color-scheme:dark]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCreateModal(false)}
                  className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-10"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-zinc-100 hover:bg-white text-zinc-950 font-semibold h-10"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : "Buat Tiket"}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL SELESAIKAN SERVIS */}
      {showCompleteModal && selectedTicket && (
        <div 
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 animate-in fade-in duration-200"
          onClick={() => setShowCompleteModal(false)}
        >
          <div 
            className="bg-zinc-950 border border-zinc-800 rounded-2xl max-w-md w-full p-6 sm:p-7 space-y-5 shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="space-y-1 text-left">
              <h3 className="text-lg font-bold text-zinc-100 flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-emerald-400" /> Selesaikan Tiket Perbaikan
              </h3>
              <p className="text-xs text-zinc-400 font-mono">
                Aset: {selectedTicket.asset?.name} ({selectedTicket.asset?.qr_code})
              </p>
            </div>

            <form onSubmit={handleCompleteTicket} className="space-y-4 text-sm">
              <div className="space-y-1.5 text-left">
                <label className="text-xs font-medium text-zinc-300">Tindakan / Solusi Teknisi <span className="text-red-500">*</span></label>
                <textarea 
                  required
                  rows={3}
                  placeholder="Cth: Penggantian pasta thermal, pembersihan motherboard, tes beban..."
                  value={formComplete.action_taken}
                  onChange={(e) => setFormComplete({...formComplete, action_taken: e.target.value})}
                  className="w-full bg-zinc-900/50 border border-zinc-800 rounded-lg p-2.5 text-zinc-200 text-sm focus:outline-none focus:border-zinc-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-zinc-300">Tanggal Selesai <span className="text-red-500">*</span></label>
                  <Input 
                    type="date"
                    required
                    max={getTodayLocalDate()}
                    value={formComplete.completion_date}
                    onChange={(e) => setFormComplete({...formComplete, completion_date: e.target.value})}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-100 h-10 [color-scheme:dark]"
                  />
                </div>
                <div className="space-y-1.5 text-left">
                  <label className="text-xs font-medium text-zinc-300">Biaya Riil Servis (Rp) <span className="text-red-500">*</span></label>
                  <Input 
                    type="number"
                    min="0"
                    required
                    value={formComplete.final_cost}
                    onChange={(e) => setFormComplete({...formComplete, final_cost: e.target.value})}
                    className="bg-zinc-900/50 border-zinc-800 text-zinc-100 font-mono h-10"
                  />
                </div>
              </div>

              <div className="p-3 bg-zinc-900/60 border border-zinc-800 rounded-lg text-xs text-zinc-400 flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                <span>
                  Aset dikembalikan ke status <strong>Tersedia (available)</strong> dan sistem menerbitkan <strong>Jurnal Pengeluaran Beban Servis</strong>.
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCompleteModal(false)}
                  className="w-full bg-zinc-900 border-zinc-800 text-zinc-300 hover:bg-zinc-800 hover:text-zinc-100 h-10"
                >
                  Batal
                </Button>
                <Button 
                  type="submit" 
                  disabled={submitting}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-semibold h-10 gap-1.5"
                >
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                  Tutup Tiket
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}