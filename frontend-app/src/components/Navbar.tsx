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

  const [role, setRole] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const storedRole = localStorage.getItem("role");
    setRole(storedRole);
    setIsMounted(true);
  }, []);

  const handleLogout = () => {
    // 💡 PERBAIKAN: Bersihkan seluruh isi localStorage demi keamanan
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

  const navLinks = role === "admin" ? adminLinks : userLinks;

  // 💡 PERBAIKAN: Gunakan objek mapping agar Clean Code (menghindari if-else / ternary panjang)
  const roleDisplayNames: Record<string, string> = {
    admin: "Administrator",
    student: "Siswa",
    teacher: "Guru",
    staff: "Staf"
  };
  const roleName = role ? (roleDisplayNames[role] || "Pengguna") : "Pengguna";

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-950/80 backdrop-blur-md">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          
          <div className="flex items-center gap-8">
            <Link 
              href={role === "admin" ? "/dashboard" : "/catalog"} 
              className="flex items-center gap-3 transition-opacity hover:opacity-80"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-zinc-600 text-white shadow-inner shadow-white/10">
                <Boxes className="h-5 w-5" />
              </div>
              <span className="text-lg font-bold tracking-tight text-zinc-100">{APP_NAME}</span>
            </Link>

            <div className="hidden md:flex items-center gap-1">
              {navLinks.map((link) => {
                const Icon = link.icon;
                
                // 💡 PERBAIKAN LOGIKA ACTIVE STATE: 
                // Jika rutenya /dashboard atau /catalog, harus cocok persis (exact match).
                // Jika rute lain (seperti /dashboard/categories), boleh menggunakan startsWith.
                const isExactMatch = pathname === link.href;
                const isSubMatch = link.href !== "/dashboard" && link.href !== "/catalog" && pathname.startsWith(link.href);
                const isActive = isExactMatch || isSubMatch;
                
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

          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-3 pr-4 border-r border-zinc-800">
              <div className="h-8 w-8 rounded-full bg-zinc-800 border border-zinc-700 flex items-center justify-center">
                <User className="h-4 w-4 text-zinc-400" />
              </div>
              <div className="flex flex-col">
                <span className="text-sm font-semibold text-zinc-200 leading-none">Pengguna</span>
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