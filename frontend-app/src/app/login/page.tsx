"use client";

import { useState } from "react";
import { API_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import {
  Loader2,
  Mail,
  Lock,
  Eye,
  EyeOff,
  AlertCircle,
  Boxes,
  ScanLine,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button"; 
import { Input } from "@/components/ui/input";   

const FEATURES = [
  {
    icon: Boxes,
    title: "Manajemen stok real-time",
    desc: "Pantau setiap pergerakan barang tanpa jeda.",
  },
  {
    icon: ScanLine,
    title: "Pemindaian cepat",
    desc: "Input dan verifikasi item dalam hitungan detik.",
  },
  {
    icon: BarChart3,
    title: "Laporan otomatis",
    desc: "Ringkasan inventaris tersaji tanpa hitung manual.",
  },
] as const;

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const response = await fetch(`${API_URL}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok) {
        // Ambil token & role dengan pembacaan aman (fallback/optional chaining)
        const token = data.access_token || data.token;
        const role = data.user?.role || data.role || "student";

        // 1. Simpan Kredensial
        localStorage.setItem("token", token);
        localStorage.setItem("role", role);

        // 2. Pengalihan Cerdas Berdasarkan Role (Smart Redirect)
        if (role === "admin" || role === "staff") {
          router.push("/dashboard");
        } else {
          router.push("/catalog");
        }
      } else {
        setError(data.message || "Email atau password salah.");
      }
    } catch (err) {
      console.error("Detail kesalahan koneksi:", err); 
      setError("Terjadi kesalahan koneksi ke server.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="grid min-h-screen grid-cols-1 bg-zinc-950 lg:grid-cols-2 selection:bg-indigo-500/30 font-['Inter',_ui-sans-serif,_system-ui,_-apple-system,_BlinkMacSystemFont,_'Segoe_UI',_Roboto,_'Helvetica_Neue',_Arial,_sans-serif] antialiased">
      
      {/* Panel Kiri — Brand Story */}
      <div className="relative hidden overflow-hidden border-r border-zinc-800 lg:flex lg:flex-col lg:justify-between lg:p-12">
        
        {/* ANIMASI KELAP-KELIP */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -left-24 -top-24 h-[500px] w-[500px] animate-[pulse_8s_ease-in-out_infinite] rounded-full bg-indigo-600/15 blur-[120px]" />
          <div className="absolute top-1/2 -right-32 h-[400px] w-[400px] -translate-y-1/2 animate-[pulse_12s_ease-in-out_infinite] rounded-full bg-emerald-600/10 blur-[100px]" />
          <div className="absolute -bottom-32 -left-10 h-[600px] w-[600px] animate-[pulse_10s_ease-in-out_infinite] rounded-full bg-violet-600/15 blur-[120px]" />
        </div>

        {/* Header / Logo */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/50 backdrop-blur-md shadow-sm">
            <Boxes className="h-5 w-5 text-zinc-100" />
          </div>
          <span className="text-xl font-bold tracking-tight text-zinc-100">
            Invenkoryz
          </span>
        </div>

        {/* Hero Section & Features */}
        <div className="relative z-10 max-w-md">
          <h1 className="text-3xl font-bold leading-tight tracking-tight text-zinc-100">
            Kendalikan inventaris Anda dari satu dasbor.
          </h1>
          <p className="mt-4 text-base leading-relaxed text-zinc-300">
            Masuk untuk melanjutkan pengelolaan stok, transaksi, dan laporan secara terpusat.
          </p>

          <div className="mt-10 space-y-4">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="flex items-start gap-4 rounded-xl border border-zinc-700/50 bg-zinc-900/60 p-4 backdrop-blur-md transition-all hover:bg-zinc-800/80 hover:border-zinc-600/50">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-zinc-600 bg-zinc-800/80">
                  <Icon className="h-5 w-5 text-zinc-200" />
                </div>
                <div>
                  <p className="text-base font-semibold text-zinc-100">{title}</p>
                  <p className="mt-1 text-sm text-zinc-400">{desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Text */}
        <p className="relative z-10 text-sm text-zinc-500">
          © {new Date().getFullYear()} Invenkoryz. Seluruh hak cipta dilindungi.
        </p>
      </div>

      {/* Panel Kanan — Form Autentikasi */}
      <div className="flex items-center justify-center p-6 sm:p-10 relative z-10">
        <div className="w-full max-w-sm">
          
          {/* Mobile Logo */}
          <div className="mb-8 flex items-center gap-3 lg:hidden">
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-zinc-700 bg-zinc-800/50 backdrop-blur-md">
              <Boxes className="h-6 w-6 text-zinc-100" />
            </div>
            <span className="text-2xl font-bold tracking-tight text-zinc-100">
              Invenkoryz
            </span>
          </div>

          <h2 className="text-3xl font-bold tracking-tight text-zinc-100">
            Selamat datang kembali
          </h2>
          <p className="mt-2 text-base text-zinc-400">
            Masukkan kredensial Anda untuk mengakses akun.
          </p>

          <form onSubmit={handleLogin} className="mt-8 space-y-6" noValidate>
            
            {/* Input Email */}
            <div className="space-y-2.5">
              <label htmlFor="email" className="text-sm font-medium text-zinc-300">
                Email
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="email"
                  type="email"
                  placeholder="alamat@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="h-12 pl-11 bg-zinc-900/50 border-zinc-800 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                />
              </div>
            </div>

            {/* Input Password */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <label htmlFor="password" className="text-sm font-medium text-zinc-300">
                  Password
                </label>
                <a href="#" className="text-sm font-medium text-zinc-400 hover:text-zinc-300 transition-colors">
                  Lupa password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 h-5 w-5 -translate-y-1/2 text-zinc-500" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="h-12 pl-11 pr-11 bg-zinc-900/50 border-zinc-800 text-base text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-zinc-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-400 backdrop-blur-sm">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={isLoading}
              className="w-full h-12 text-base font-medium bg-zinc-100 text-zinc-950 hover:bg-zinc-300"
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                  Memproses...
                </>
              ) : (
                "Masuk"
              )}
            </Button>
          </form>

          <p className="mt-8 text-center text-sm text-zinc-500">
            Butuh akses? Hubungi administrator sistem Anda.
          </p>
        </div>
      </div>
    </div>
  );
}