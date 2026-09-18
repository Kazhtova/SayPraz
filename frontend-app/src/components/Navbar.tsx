/* eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  Boxes, LogOut, Package, FolderOpen, User, ArrowLeftRight, 
  PackageSearch, History, Menu, X, TrendingDown, Wrench, 
  ChevronDown, BookOpen
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { APP_NAME } from "@/lib/constants";

export function Navbar() {
  const pathname = usePathname();
  const router = useRouter();

  const [role, setRole] = useState<string | null>(null);
  const [userName, setUserName] = useState<string>("Pengguna");
  const [isMounted, setIsMounted] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false); 
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    const storedName = localStorage.getItem("name"); 
    
    setRole(storedRole);
    if (storedName && storedName.trim() !== "" && storedName.toLowerCase() !== "pengguna") {
      setUserName(storedName);
    }
    setIsMounted(true);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsDropdownOpen(false);
  }, [pathname]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.clear(); 
    router.push("/login");
  };

  if (!isMounted) return null;

  const userLinks = [
    { name: "Katalog Aset", href: "/catalog", icon: PackageSearch },
    { name: "Riwayat Peminjaman", href: "/my-transactions", icon: History },
  ];

  const isAdminOrStaff = role === "admin" || role === "staff";
  const isActivityActive = pathname.startsWith("/dashboard/transactions") || pathname.startsWith("/dashboard/history");

  const roleDisplayNames: Record<string, string> = {
    admin: "Administrator",
    student: "Siswa",
    teacher: "Guru",
    staff: "Staf"
  };
  const roleName = role ? (roleDisplayNames[role] || "Pengguna") : "Pengguna";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800/80 bg-zinc-950/85 backdrop-blur-2xl transition-all">
      <div className="mx-auto max-w-[1536px] px-4 sm:px-6 lg:px-8">
        <div className="relative flex h-20 items-center justify-between">
          
          {/* 1. LOGO & BRANDING (KIRI) */}
          <div className="flex items-center shrink-0 z-10">
            <Link 
              href={isAdminOrStaff ? "/dashboard" : "/catalog"} 
              className="flex items-center gap-3 transition-transform hover:scale-[1.02] active:scale-[0.98] outline-none focus-visible:ring-2 focus-visible:ring-zinc-500 rounded-xl"
            >
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-gradient-to-br from-zinc-500 via-zinc-600 to-zinc-700 text-white shadow-lg shadow-zinc-500/20 border border-zinc-400/20">
                <Boxes className="h-5 w-5 drop-shadow-md" />
              </div>
              <span className="text-xl font-bold tracking-tight text-zinc-100">{APP_NAME}</span>
            </Link>
          </div>

          {/* 2. NAVIGASI DESKTOP (TEPAT DI TENGAH SECARA ABSOLUT) */}
          <div className="hidden xl:flex absolute inset-x-0 justify-center items-center pointer-events-none">
            <div className="flex items-center gap-1.5 p-1.5 rounded-2xl bg-zinc-900/80 border border-zinc-800 shadow-xl shadow-black/40 backdrop-blur-xl pointer-events-auto">
              
              {isAdminOrStaff ? (
                <>
                  {/* Aset Inventaris */}
                  <Link href="/dashboard" className="outline-none shrink-0">
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      pathname === "/dashboard" 
                        ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <Package className={`h-4 w-4 shrink-0 transition-colors ${pathname === "/dashboard" ? "text-zinc-200" : "text-zinc-500"}`} />
                      <span>Aset Inventaris</span>
                    </div>
                  </Link>

                  {/* Kategori */}
                  <Link href="/dashboard/categories" className="outline-none shrink-0">
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      pathname.startsWith("/dashboard/categories") 
                        ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <FolderOpen className={`h-4 w-4 shrink-0 transition-colors ${pathname.startsWith("/dashboard/categories") ? "text-zinc-200" : "text-zinc-500"}`} />
                      <span>Kategori</span>
                    </div>
                  </Link>

                  {/* Dropdown Aktivitas (Transaksi & Riwayat) */}
                  <div className="relative shrink-0" ref={dropdownRef}>
                    <button
                      type="button"
                      onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                      className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 cursor-pointer ${
                        isActivityActive || isDropdownOpen
                          ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent"
                      }`}
                    >
                      <ArrowLeftRight className={`h-4 w-4 shrink-0 transition-colors ${isActivityActive || isDropdownOpen ? "text-zinc-200" : "text-zinc-500"}`} />
                      <span>Aktivitas</span>
                      <ChevronDown className={`h-4 w-4 transition-transform duration-200 ${isDropdownOpen ? "rotate-180" : ""}`} />
                    </button>

                    {isDropdownOpen && (
                      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-xl bg-zinc-950 border border-zinc-800 shadow-2xl p-1.5 z-50 animate-in fade-in-50 zoom-in-95 duration-150">
                        <Link 
                          href="/dashboard/transactions" 
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                            pathname.startsWith("/dashboard/transactions") ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                          }`}
                        >
                          <ArrowLeftRight className="h-4 w-4" />
                          <span>Peminjaman Aset</span>
                        </Link>
                        <Link 
                          href="/dashboard/history" 
                          onClick={() => setIsDropdownOpen(false)}
                          className={`flex items-center gap-2.5 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors mt-0.5 ${
                            pathname.startsWith("/dashboard/history") ? "bg-zinc-800 text-zinc-100" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                          }`}
                        >
                          <History className="h-4 w-4" />
                          <span>Riwayat Lengkap</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  {/* Depresiasi */}
                  <Link href="/dashboard/depreciation" className="outline-none shrink-0">
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      pathname.startsWith("/dashboard/depreciation") 
                        ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <TrendingDown className={`h-4 w-4 shrink-0 transition-colors ${pathname.startsWith("/dashboard/depreciation") ? "text-zinc-200" : "text-zinc-500"}`} />
                      <span>Depresiasi</span>
                    </div>
                  </Link>

                  {/* Pemeliharaan */}
                  <Link href="/dashboard/maintenances" className="outline-none shrink-0">
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      pathname.startsWith("/dashboard/maintenances") 
                        ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <Wrench className={`h-4 w-4 shrink-0 transition-colors ${pathname.startsWith("/dashboard/maintenances") ? "text-zinc-200" : "text-zinc-500"}`} />
                      <span>Pemeliharaan</span>
                    </div>
                  </Link>

                  {/* Jurnal Finansial */}
                  <Link href="/dashboard/journals" className="outline-none shrink-0">
                    <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                      pathname.startsWith("/dashboard/journals") 
                        ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                        : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent" 
                    }`}>
                      <BookOpen className={`h-4 w-4 shrink-0 transition-colors ${pathname.startsWith("/dashboard/journals") ? "text-zinc-200" : "text-zinc-500"}`} />
                      <span>Jurnal</span>
                    </div>
                  </Link>
                </>
              ) : (
                userLinks.map((link) => {
                  const Icon = link.icon;
                  const isActive = pathname === link.href || pathname.startsWith(link.href);
                  return (
                    <Link key={link.href} href={link.href} className="outline-none shrink-0">
                      <div className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-sm font-semibold whitespace-nowrap transition-all duration-200 ${
                        isActive 
                          ? "bg-zinc-800 text-zinc-100 shadow-md border border-zinc-700/80 ring-1 ring-white/10" 
                          : "text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-200 border border-transparent" 
                      }`}>
                        <Icon className={`h-4 w-4 shrink-0 transition-colors ${isActive ? "text-zinc-200" : "text-zinc-500"}`} />
                        <span>{link.name}</span>
                      </div>
                    </Link>
                  );
                })
              )}
            </div>
          </div>

          {/* 3. USER PROFILE & LOGOUT (KANAN) */}
          <div className="flex items-center gap-3 shrink-0 z-10">
            <div className="hidden sm:flex items-center gap-3.5 pr-3.5 border-r border-zinc-800/80">
              <div className="flex flex-col items-end">
                <span className="text-sm font-semibold text-zinc-100 leading-none max-w-[130px] truncate">{userName}</span>
                <span className="text-[11px] text-zinc-400 mt-1 uppercase tracking-wider font-medium">{roleName}</span>
              </div>
              <div className="h-10 w-10 rounded-full bg-gradient-to-tr from-zinc-800 to-zinc-700 border border-zinc-600 shadow-sm flex items-center justify-center shrink-0">
                <User className="h-5 w-5 text-zinc-300" />
              </div>
            </div>

            <Button 
              variant="ghost" 
              size="sm"
              onClick={handleLogout}
              className="hidden sm:flex text-zinc-400 hover:text-red-400 hover:bg-red-950/30 hover:border-red-900/50 border border-transparent gap-2 h-10 px-3.5 rounded-xl text-sm transition-all duration-200"
            >
              <LogOut className="h-4 w-4" />
              <span className="font-medium">Keluar</span>
            </Button>

            {/* Tombol Hamburger Mobile */}
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="xl:hidden text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800/60 rounded-xl h-10 w-10"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>

        </div>
      </div>

      {/* 4. PANEL MENU MOBILE */}
      {isMobileMenuOpen && (
        <div className="xl:hidden border-b border-zinc-800 bg-zinc-950/95 backdrop-blur-2xl px-5 pt-4 pb-6 space-y-4 animate-in slide-in-from-top-2 duration-200 overflow-y-auto max-h-[80vh]">
          
          <div className="flex items-center gap-3.5 p-3.5 rounded-xl bg-zinc-900/60 border border-zinc-800/80">
            <div className="h-10 w-10 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
              <User className="h-5 w-5 text-zinc-300" />
            </div>
            <div className="flex flex-col">
              <span className="text-sm font-semibold text-zinc-100">{userName}</span>
              <span className="text-[11px] text-zinc-400 uppercase tracking-widest">{roleName}</span>
            </div>
          </div>

          <div className="space-y-1.5">
            {isAdminOrStaff ? (
              <>
                <Link href="/dashboard">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname === "/dashboard" ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <Package className={`h-4 w-4 ${pathname === "/dashboard" ? "text-zinc-200" : "text-zinc-500"}`} /> Aset Inventaris
                  </div>
                </Link>
                <Link href="/dashboard/categories">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/categories") ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <FolderOpen className={`h-4 w-4 ${pathname.startsWith("/dashboard/categories") ? "text-zinc-200" : "text-zinc-500"}`} /> Kategori
                  </div>
                </Link>
                
                <div className="pt-2 pb-1 px-3 text-[11px] font-bold text-zinc-500 uppercase tracking-wider">Aktivitas & Log</div>
                
                <Link href="/dashboard/transactions">
                  <div className={`flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/transactions") ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <ArrowLeftRight className={`h-4 w-4 ${pathname.startsWith("/dashboard/transactions") ? "text-zinc-200" : "text-zinc-500"}`} /> Peminjaman
                  </div>
                </Link>
                <Link href="/dashboard/history">
                  <div className={`flex items-center gap-3 pl-6 pr-4 py-2.5 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/history") ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <History className={`h-4 w-4 ${pathname.startsWith("/dashboard/history") ? "text-zinc-200" : "text-zinc-500"}`} /> Riwayat Lengkap
                  </div>
                </Link>

                <div className="pt-2" />
                
                <Link href="/dashboard/depreciation">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/depreciation") ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <TrendingDown className={`h-4 w-4 ${pathname.startsWith("/dashboard/depreciation") ? "text-zinc-200" : "text-zinc-500"}`} /> Depresiasi
                  </div>
                </Link>
                <Link href="/dashboard/maintenances">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/maintenances") ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <Wrench className={`h-4 w-4 ${pathname.startsWith("/dashboard/maintenances") ? "text-zinc-200" : "text-zinc-500"}`} /> Pemeliharaan
                  </div>
                </Link>
                <Link href="/dashboard/journals">
                  <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${pathname.startsWith("/dashboard/journals") ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"}`}>
                    <BookOpen className={`h-4 w-4 ${pathname.startsWith("/dashboard/journals") ? "text-zinc-200" : "text-zinc-500"}`} /> Jurnal Finansial
                  </div>
                </Link>
              </>
            ) : (
              userLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href || pathname.startsWith(link.href);
                return (
                  <Link key={link.href} href={link.href}>
                    <div className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-colors ${
                      isActive 
                        ? "bg-zinc-800 text-zinc-100 border border-zinc-700/60" 
                        : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200"
                    }`}>
                      <Icon className={`h-4 w-4 ${isActive ? "text-zinc-200" : "text-zinc-500"}`} />
                      {link.name}
                    </div>
                  </Link>
                );
              })
            )}
          </div>

          <Button 
            variant="outline" 
            onClick={handleLogout}
            className="w-full justify-start text-red-400 border-red-900/40 bg-red-950/20 hover:bg-red-900/40 hover:text-red-300 gap-3 h-11 rounded-xl mt-2 text-sm font-medium"
          >
            <LogOut className="h-4 w-4" />
            <span>Keluar dari Akun</span>
          </Button>

        </div>
      )}
    </nav>
  );
}