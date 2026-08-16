/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import { QRCodeSVG } from "qrcode.react";
import { Printer, ArrowLeft, AlertCircle } from "lucide-react";
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

const FontKillerStyles = () => (
  <style dangerouslySetInnerHTML={{__html: `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;900&display=swap');
    * { font-family: 'Inter', ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important; }
    
    @media print {
      @page { 
        size: auto; 
        margin: 0mm; 
      }
      
      body { 
        background: white !important; 
        -webkit-print-color-adjust: exact; 
        print-color-adjust: exact; 
      }

      nav, header, footer, aside { 
        display: none !important; 
      }

      body * { 
        visibility: hidden; 
      }
      
      #print-section, #print-section * { 
        visibility: visible !important; 
      }
      
      /* SKALA CETAK DIPERBESAR SECARA PRESISI */
      #print-section { 
        position: fixed !important; 
        left: 50% !important; 
        top: 50% !important; 
        /* Skala diperbesar 1.35x lipat agar tampil dominan dan sangat jelas */
        transform: translate(-50%, -50%) scale(1.35) !important;
        transform-origin: center center !important;
        width: 340px !important; 
        height: auto !important; 
        margin: 0 !important;
        padding: 24px !important;
        background: white !important;
        border: 2px solid #000000 !important;
        border-radius: 20px !important;
        box-shadow: none !important;
        display: flex !important;
        flex-direction: column !important;
        align-items: center !important;
        justify-content: center !important;
      }
    }
  `}} />
);

function PrintSkeleton() {
  return (
    <div className="min-h-screen bg-zinc-950 py-12 flex flex-col items-center relative overflow-hidden font-sans">
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      <div className="relative z-10 w-full max-w-sm mb-10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 shadow-2xl animate-pulse">
        <div className="h-10 w-28 bg-zinc-800 rounded-xl"></div>
        <div className="h-10 w-28 bg-zinc-800 rounded-xl"></div>
      </div>

      <div className="relative z-10 bg-white border border-zinc-200 p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center w-[340px] animate-pulse">
        <div className="text-center mb-2 w-full border-b-[1.5px] border-zinc-200 pb-1.5 flex flex-col items-center gap-1.5">
          <div className="h-5 w-40 bg-zinc-200 rounded-md"></div>
          <div className="h-2 w-24 bg-zinc-200 rounded-sm"></div>
        </div>
        <div className="bg-zinc-200 w-[200px] h-[200px] rounded-lg mb-2"></div>
        <div className="text-center w-full flex flex-col items-center gap-2 mt-2">
          <div className="h-4 w-48 bg-zinc-200 rounded-md"></div>
          <div className="h-2 w-32 bg-zinc-200 rounded-sm mb-1"></div>
          <div className="h-5 w-32 bg-zinc-200 rounded-md mt-0.5"></div>
        </div>
      </div>
    </div>
  );
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

  if (isLoading) {
    return (
      <>
        <FontKillerStyles />
        <PrintSkeleton />
      </>
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
    <div className="min-h-screen bg-zinc-950 py-12 flex flex-col items-center relative overflow-hidden font-sans">
      <FontKillerStyles />

      {/* EFEK GLOW BACKGROUND */}
      <div className="print:hidden absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none z-0"></div>

      {/* KONTROL UI NAVIGASI & CETAK */}
      <div className="print:hidden relative z-10 w-full max-w-sm mb-10 flex items-center justify-between bg-zinc-900/60 backdrop-blur-xl p-4 rounded-2xl border border-zinc-800/80 shadow-2xl">
        <Button variant="ghost" onClick={() => router.back()} className="text-zinc-400 hover:text-white hover:bg-zinc-800 rounded-xl h-10 transition-colors">
          <ArrowLeft className="h-4 w-4 mr-2" /> Kembali
        </Button>
        <Button onClick={handlePrint} className="bg-zinc-600 hover:bg-zinc-800 text-white rounded-xl h-10 px-5 shadow-lg shadow-zinc-900/40 transition-all hover:scale-105 active:scale-95">
          <Printer className="h-4 w-4 mr-2" /> Cetak
        </Button>
      </div>

      {/* KOTAK STIKER QR DENGAN UKURAN LEBIH BESAR & TEGAS */}
      <div 
        id="print-section" 
        className="relative z-10 bg-white border-2 border-black p-6 rounded-[2rem] shadow-[0_20px_60px_-15px_rgba(0,0,0,0.5)] flex flex-col items-center justify-center w-[340px] overflow-hidden"
      >
        {/* Header Stiker */}
        <div className="text-center mb-3 w-full border-b-2 border-black pb-2">
          <h1 className="font-black text-[22px] tracking-tight text-black uppercase leading-none">INVENKORYZ</h1>
          <p className="text-[10px] font-bold text-zinc-700 uppercase tracking-[0.2em] mt-1">Sistem Inventaris</p>
        </div>

        {/* QR Code Diperbesar (size 200px) */}
        <div className="bg-white p-1 mb-3 flex items-center justify-center">
          <QRCodeSVG 
            value={asset.qr_code} 
            size={200} 
            bgColor={"#ffffff"} 
            fgColor={"#000000"} 
            level={"M"} 
            includeMargin={false}
          />
        </div>

        {/* Detail Identitas Aset */}
        <div className="text-center w-full flex flex-col items-center">
          <h2 className="text-[15px] font-bold text-black leading-tight max-w-[280px] truncate">{asset.name}</h2>
          <p className="text-[11px] font-semibold text-zinc-700 mt-0.5 truncate uppercase tracking-wider">
            {asset.brand} {asset.purchase_year ? `• ${asset.purchase_year}` : ""}
          </p>
          <span className="inline-block bg-black text-white text-[12px] font-mono font-bold px-3.5 py-1 rounded-md tracking-widest mt-2">
            {asset.qr_code}
          </span>
        </div>
      </div>

      {/* PANDUAN PENGGUNA */}
      <div className="print:hidden relative z-10 mt-10 text-center space-y-1">
        <p className="text-xs font-medium text-zinc-500">
          <span className="text-slate-100 font-bold">Note:</span> Ini Adalah Menu Untuk Melihat Dan Mencetak<strong className="text-zinc-300"> Qr Code Unique</strong> Untuk Setiap Masing Masing Barang.
        </p>
      </div>
    </div>
  );
}