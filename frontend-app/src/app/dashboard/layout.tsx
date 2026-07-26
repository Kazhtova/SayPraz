import { Navbar } from "@/components/Navbar";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-zinc-950 font-sans antialiased text-zinc-100">
      {/* Navbar hanya muncul untuk seluruh rute /dashboard/* */}
      <Navbar />
      
      {/* Konten halaman (Aset, Kategori, Edit, Tambah) */}
      {children}
    </div>
  );
}