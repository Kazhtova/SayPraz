/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Boxes, LogOut, Package, FolderOpen, User, ArrowLeftRight, PackageSearch, History 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  // === STATE UNTUK ROLE ===
  const [role, setRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // Ambil role dari localStorage saat komponen di-mount di browser
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("role");
    router.push("/login");
  };

  // Mencegah render yang tidak konsisten antara Server dan Client (Hydration Error)
  if (!isMounted) return null;

  // === DAFTAR MENU BERDASARKAN ROLE ===
  const adminLinks = [
    { name: "Aset Inventaris", href: "/dashboard", icon: Package },
    { name: "Kategori", href: "/dashboard/categories", icon: FolderOpen },
    { name: "Transaksi Peminjaman", href: "/dashboard/transactions", icon: ArrowLeftRight },
  ];

  const userLinks = [
    { name: "Katalog Aset", href: "/catalog", icon: PackageSearch },
    { name: "Riwayat Peminjaman", href: "/my-transactions", icon: History },
  ];

  // Tentukan link dan tampilan profil mana yang dipakai
  const navLinks = role === "admin" ? adminLinks : userLinks;
  const roleName = role === "admin" ? "Administrator" : "Siswa / Guru";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* KIRI: Logo & Navigasi Utama */}
          <div className="flex items-center gap-8">
            {/* Brand Logo (Arahkan ke rute awal sesuai role) */}
            <Link 
              href={role === "admin" ? "/dashboard" : "/catalog"} 
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-600 text-white shadow-inner shadow-white/10">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-100">{APP_NAME}</span>
            </Link>

            {/* Menu Links (Desktop) */}
            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                // Logika Aktif: Benar-benar sama dengan URL, atau berada di dalam sub-rutenya
                const isActive = pathname === link.href || (link.href !== "/dashboard" && link.href !== "/catalog" && pathname.startsWith(link.href));
                
                return (
                  <Link key={link.href} href={link.href}>
                    <div className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50" 
                        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <Icon className="h-4 w-4" />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* KANAN: Profil Pengguna & Logout */}
          <div className="flex items-center gap-4">
            
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-zinc-800">
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-200 leading-none">Pengguna</span>
                {/* Tampilkan Role yang sedang login */}
                <span className="text-xs text-zinc-500 mt-0.5 uppercase tracking-wide">{roleName}</span>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="text-zinc-400 hover:text-red-400 hover:bg-red-400/10 gap-2 h-9"
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline font-medium">Keluar</span>
            </Button>
            
          </div>

        </div>
      </div>
    </nav>
  );
}