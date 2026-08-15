"use client";

import { Scanner } from '@yudiel/react-qr-scanner';
import { X, ScanLine, AlertCircle } from 'lucide-react';
import { Button } from './ui/button';
import { useState } from 'react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (decodedText: string) => void;
}

export function QrScannerModal({ isOpen, onClose, onScan }: QrScannerModalProps) {
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-200">
      <div className="bg-zinc-950 border border-zinc-800 rounded-3xl w-full max-w-md overflow-hidden shadow-2xl flex flex-col">
        
        {/* Header Modal */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/80 bg-zinc-900/40">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-zinc-500/10 rounded-lg text-zinc-400">
              <ScanLine className="h-5 w-5" />
            </div>
            <div>
              <h3 className="font-bold text-zinc-100">Scan QR Aset</h3>
              <p className="text-[11px] text-zinc-400">Arahkan kamera ke stiker QR</p>
            </div>
          </div>
          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => {
              setErrorMessage(null);
              onClose();
            }} 
            className="text-zinc-400 hover:text-black rounded-xl"
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Area Kamera Scanner */}
        <div className="relative aspect-square w-full bg-black flex items-center justify-center overflow-hidden">
          {errorMessage ? (
            <div className="p-6 text-center flex flex-col items-center gap-3">
              <AlertCircle className="h-10 w-10 text-rose-500 mb-1" />
              <p className="text-sm font-semibold text-zinc-200">{errorMessage}</p>
              <p className="text-xs text-zinc-500 leading-relaxed max-w-xs">
                Pastikan izin kamera di browser sudah <strong className="text-zinc-300">Allowed</strong> dan aplikasi diakses menggunakan <code className="text-zinc-100">localhost</code> atau protokol <code className="text-zinc-100">HTTPS</code>.
              </p>
              <Button 
                onClick={() => setErrorMessage(null)} 
                className="mt-2 bg-zinc-800 hover:bg-zinc-700 text-xs text-white rounded-xl h-9 px-4"
              >
                Coba Lagi
              </Button>
            </div>
          ) : (
            <>
              <Scanner 
                onScan={(result) => {
                  if (result && result.length > 0) {
                    onScan(result[0].rawValue);
                  }
                }}
                onError={(error: unknown) => {
                  // Mencegah error TypeScript & ESLint dengan Type Casting
                  const errObj = error as Record<string, unknown>;
                  const msg = 
                    (typeof errObj?.message === 'string' && errObj.message) ||
                    (typeof errObj?.name === 'string' && errObj.name) ||
                    "Kamera tidak dapat diakses.";

                  console.warn("Scanner Status:", msg);
                  
                  const strMsg = String(msg);
                  if (strMsg.includes("NotAllowedError") || strMsg.includes("Permission")) {
                    setErrorMessage("Izin akses kamera ditolak oleh browser.");
                  } else if (strMsg.includes("NotFoundError")) {
                    setErrorMessage("Perangkat kamera tidak ditemukan.");
                  }
                }}
                scanDelay={1000}
                styles={{
                  container: { width: '100%', height: '100%' },
                  video: { objectFit: 'cover' }
                }}
              />
              
              {/* Overlay Target UI */}
              <div className="absolute inset-0 pointer-events-none border-[40px] border-black/40">
                <div className="w-full h-full border-2 border-zinc-500/50 rounded-2xl relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                   <div className="absolute top-1/2 left-0 w-full h-0.5 bg-zinc-500/50 animate-[scan_2s_ease-in-out_infinite]" />
                </div>
              </div>
            </>
          )}
        </div>

        <div className="p-4 text-center bg-zinc-900/40 text-xs text-zinc-400">
          Pastikan QR Code berada di dalam kotak area scan.
        </div>
      </div>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0%, 100% { transform: translateY(-50px); opacity: 0; }
          50% { transform: translateY(50px); opacity: 1; }
        }
      `}} />
    </div>
  );
}