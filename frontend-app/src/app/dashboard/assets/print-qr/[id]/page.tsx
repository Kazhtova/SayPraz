/* eslint-disable react-hooks/static-components */
/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Printer, ArrowLeft, Loader2, AlertCircle, ScanLine } from "lucide-react";
import { Button } from "@/components/ui/button";
import { API_URL } from "@/lib/constants";

interface Asset {
  id: number;
  name: string;
  brand: string;
  qr_code: string;
  category_name?: string;
  purchase_year?: number;
}

export default function PrintQrPage() {
  const params = useParams();
  const router = useRouter();
  const assetId = params.id as string;

  const [asset, setAsset] = useState<Asset | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const loadAssetDetails = useCallback(async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/api/assets/${assetId}`, {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
        }
      });

      const result = await response.json();

      if (response.ok && result.data) {
        setAsset(result.data);
      } else {
        setError("Data aset tidak ditemukan.");
      }
    } catch (err) {
      setError("Terjadi kesalahan jaringan saat mengambil data aset.");
    } finally {
      setIsLoading(false);
    }
  }, [assetId, router]);

  useEffect(() => {
    loadAssetDetails();
  }, [loadAssetDetails]);

  const handlePrint = () => {
    window.print();
  };

  // Menyamakan font dengan keseluruhan aplikasi
  const FontKillerStyles = () => (
    <style dangerouslySetInnerHTML={{__html: `
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
      * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
      
      @media print {
        @page { size: 50mm 50mm; margin: 0; }
        body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
      }
    `}} />
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 text-zinc-100">
        <FontKillerStyles />
        <Loader2 className="h-10 w-10 animate-spin text-indigo-500 mb-4" />
        <p className="font-medium text-zinc-400">Menyiapkan kanvas cetak...</p>
      </div>
    );
  }

  if (error || !asset) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-zinc-950 p-6 text-zinc-100">
        <FontKillerStyles />
        <div className="bg-zinc-900/50 border border-red-500/20 p-8 rounded-3xl flex flex-col items-center text-center max-w-sm backdrop-blur-md">
          <AlertCircle className="h-12 w-12 text-red-400 mb-4" />
          <p className="font-bold text-lg text-zinc-200">{error}</p>
          <Button onClick={() => router.back()} className="mt-6 bg-zinc-800 hover:bg-zinc-700 text-white rounded-xl h-10 px-6">
            Kembali
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 py-12 print:bg-white print:py-0 flex flex-col items-center relative overflow-hidden font-sans">
      <FontKillerStyles />

      {/* EFEK GLOW BACKGROUND (HANYA DI LAYAR) */}
      <div className="print:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* KONTROL UI NAVIGASI & CETAK (GLASSMORPHISM) */}
      <div className="print:hidden relative z-10 w-full max-w-sm mb-10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 shadow-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl h-10 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Batal
        </Button>
        <Button onClick={handlePrint} className="bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl h-10 px-5 shadow-lg shadow-indigo-900/20 transition-all hover:scale-105 active:scale-95">
          <Printer className="h-4 w-4 mr-2" /> Cetak
        </Button>
      </div>

      {/* KANVAS KERTAS STIKER (BERSIH & PUTIH UNTUK PRINTER) */}
      <div className="relative z-10 bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] print:shadow-none print:border-none print:rounded-none flex flex-col items-center justify-center w-[320px] print:w-[50mm] print:h-[50mm] print:p-0 print:m-0 overflow-hidden">
        
        {/* Watermark Logo (Opsional/Estetika) */}
        <div className="absolute -right-4 -top-4 opacity-[0.03] pointer-events-none">
          <ScanLine className="w-32 h-32 text-black" />
        </div>

        {/* Header Stiker */}
        <div className="text-center mb-2 w-full border-b-[1.5px] border-zinc-200 pb-1.5 relative z-10">
          <h1 className="font-black text-[20px] tracking-tighter text-black uppercase leading-none">INVENKORYZ</h1>
          <p className="text-[8px] font-bold text-zinc-500 uppercase tracking-[0.2em] mt-0.5">Sistem Inventaris</p>
        </div>

        {/* Gambar QR Code Utama - Diperbesar */}
        <div className="bg-white p-0.5 mb-2 relative z-10">
          <QRCodeSVG 
            value={asset.qr_code} 
            size={164} // <-- DIPERBESAR DARI 128 KE 164
            bgColor={"#ffffff"} 
            fgColor={"#000000"} 
            level={"M"} 
            includeMargin={false}
          />
        </div>

        {/* Identitas Aset */}
        <div className="text-center w-full relative z-10">
          <h2 className="text-[13px] font-extrabold text-black leading-tight truncate px-1">{asset.name}</h2>
          <p className="text-[9px] font-medium text-zinc-600 mb-1 truncate uppercase tracking-wide">
            {asset.brand} {asset.purchase_year ? `• ${asset.purchase_year}` : ""}
          </p>
          <span className="inline-block bg-black text-white text-[11px] font-mono font-bold px-3 py-[2px] rounded-[4px] tracking-widest mt-0.5">
            {asset.qr_code}
          </span>
        </div>

      </div>

      {/* PANDUAN PENGGUNA (HANYA DI LAYAR) */}
      <div className="print:hidden relative z-10 mt-10 text-center space-y-1">
        <p className="text-xs font-medium text-zinc-500">
          <span className="text-indigo-400 font-bold">Tips:</span> Gunakan kertas stiker ukuran <span className="text-zinc-300">50mm x 50mm</span> (Printer Thermal).
        </p>
        <p className="text-[11px] text-zinc-600">
          Pastikan opsi margin pada browser diatur ke None saat mencetak.
        </p>
      </div>

    </div>
  );
}