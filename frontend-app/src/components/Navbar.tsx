/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Boxes, LogOut, Package, FolderOpen, User, ArrowLeftRight, PackageSearch, History, Menu, X 
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Pengguna");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); // 💡 TAMBAHAN: State Mobile Menu

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name"); 
    
    setRole(storedRole);
    if (storedName && storedName.trim() !== "" && storedName.toLowerCase() !== "pengguna") {
    setUserName(storedName);
    }
    setIsMounted(true);
  }, []);

  // Otomatis tutup mobile menu jika halaman berpindah
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [pathname]);

  const handleLogout = () => {
    localStorage.clear(); 
    router.push("/login");
  };

  if (!isMounted) return null;

  const adminLinks = [
    { name: "Aset Inventaris", href: "/dashboard", icon: Package },
    { name: "Kategori", href: "/dashboard/categories", icon: FolderOpen },
    { name: "Transaksi Peminjaman", href: "/dashboard/transactions", icon: ArrowLeftRight },
  ];

  const userLinks = [
    { name: "Katalog Aset", href: "/catalog", icon: PackageSearch },
    { name: "Riwayat Peminjaman", href: "/my-transactions", icon: History },
  ];

  // 💡 PERBAIKAN: Admin & Staff diarahkan ke Dasbor Admin
  const isAdminOrStaff = role === "admin" || role === "staff";
  const navLinks = isAdminOrStaff ? adminLinks : userLinks;

  const roleDisplayNames: Record<string, string> = {
    admin: "Administrator",
    student: "Siswa",
    teacher: "Guru",
    staff: "Staf"
  };
  const roleName = role ? (roleDisplayNames[role] || "Pengguna") : "Pengguna";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/70 backdrop-blur-xl transition-all">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          {/* LOGO & BRANDING */}
          <div className="flex items-center gap-8">
            <Link 
              href={isAdminOrStaff ? "/dashboard" : "/catalog"} 
              className="flex items-center gap-3 transition-opacity hover:opacity-80 outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-lg"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-500 to-zinc-600 text-white shadow-lg shadow-zinc-500/20 border border-zinc-400/20">
                <Boxes className="h-5 w-5 drop-shadow-md" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-100">{APP_NAME}</span>
            </Link>

            {/* NAVIGASI DESKTOP (SEGMENTED CONTROL STYLE) */}
            <div className="hidden md:flex items-center gap-1.5 p-1.5 rounded-xl bg-zinc-900/40 border border-zinc-800/50 shadow-inner">
              {navLinks.map((link) => {
                const Icon = link.icon;
                
                const isExactMatch = pathname === link.href;
                const isSubMatch = link.href !== "/dashboard" && link.href !== "/catalog" && pathname.startsWith(link.href);
                const isActive = isExactMatch || isSubMatch;
                
                return (
                  <Link key={link.href} href={link.href} className="outline-none">
                    <div className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                      isActive 
                        ? "bg-zinc-800 text-zinc-100 shadow-sm border border-zinc-700/50 ring-1 ring-black/20" 
                        : "text-zinc-400 hover:bg-zinc-800/40 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <Icon className={`h-4 w-4 transition-colors duration-300 ${isActive ? "text-zinc-400" : "text-zinc-500"}`} />
                      {link.name}
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* USER PROFILE & LOGOUT (DESKTOP) */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-3 pr-5 border-r border-zinc-800/60">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-zinc-200 leading-none">{userName}</span>
                <span className="text-[10px] text-zinc-400 mt-1 uppercase tracking-widest font-medium">{roleName}</span>
              </div>
              <div className="h-9 w-9 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600 shadow-sm flex items-center justify-center relative overflow-hidden">
                <User className="h-4 w-4 text-zinc-300" />
                <div className="absolute inset-0 bg-white/5 opacity-0 hover:opacity-100 transition-opacity"></div>
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex text-zinc-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900/50 border border-transparent gap-2 h-9 rounded-lg transition-all duration-300"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Keluar</span>
            </Button>

            {/* 💡 TAMBAHAN: Tombol Hamburger untuk Layar HP */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-lg h-9 w-9"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

        </div>
      </div>

      {/* 💡 TAMBAHAN: PANEL MENU MOBILE (DROPDOWN MODAL) */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-4 pt-3 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200">
          
          {/* User Info Mobile */}
          <div className="flex items-center gap-3 p-3 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User className="h-5 w-5 text-zinc-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100">{userName}</span>
              <span className="text-[10px] text-zinc-400 uppercase tracking-widest">{roleName}</span>
            </div>
          </div>

          {/* Links Navigasi Mobile */}
          <div className="space-y-1">
            {navLinks.map((link) => {
              const Icon = link.icon;
              const isActive = pathname === link.href || (link.href !== "/dashboard" && link.href !== "/catalog" && pathname.startsWith(link.href));
              
              return (
                <Link key={link.href} href={link.href}>
                  <div className={`flex items-center gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive 
                      ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" 
                      : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                  }`}>
                    <Icon className={`h-4 w-4 ${isActive ? "text-zinc-200" : "text-zinc-500"}`} />
                    {link.name}
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Tombol Logout Mobile */}
          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full justify-start text-red-400 border-red-900/40 bg-red-950/20 hover:bg-red-900/40 hover:text-red-300 gap-3 h-10 rounded-lg mt-2"
          >
            <LogOut className="h-4 w-4" />
            <span className="font-medium text-sm">Keluar dari Akun</span>
          </Button>

        </div>
      )}
    </nav>
  );
}