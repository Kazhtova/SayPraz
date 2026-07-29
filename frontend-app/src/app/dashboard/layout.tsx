/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    // 1. Ambil token dan role dari penyimpanan browser
    const token = localStorage.getItem("token");
    const role = localStorage.getItem("role");

    // 2. LOGIKA PENJAGA GERBANG
    if (!token) {
      // Jika tidak ada token (belum login), tendang ke login
      router.replace("/login");
    } else if (role !== "admin") {
      // Jika BUKAN admin (student, teacher, staff), tendang ke katalog
      router.replace("/catalog");
    } else {
      // Lolos verifikasi, izinkan masuk
      setIsAuthorized(true);
    }
  }, [router]);

  // 3. Tampilan Loading (Mencegah tampilan berkedip/bocor sebelum dialihkan)
  if (!isAuthorized) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-500 gap-3">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
        <p className="text-sm font-medium">Memverifikasi hak akses Admin...</p>
      </div>
    );
  }

  // 4. Jika lolos verifikasi, tampilkan Navbar & halaman dasbor
  return (
    <div className="min-h-screen bg-zinc-950 font-sans antialiased text-zinc-100">
      {/* Navbar hanya muncul untuk seluruh rute /dashboard/* */}
      <Navbar />
      
      {/* Konten halaman (Aset, Kategori, Edit, Tambah) */}
      {children}
    </div>
  );
}