import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    unoptimized: true, // 👈 Tambahkan baris ini
    remotePatterns: [
      {
        protocol: "https",
        hostname: "uptwnpbntfpkcyefkxck.supabase.co",
        port: "",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "*.supabase.co",
        port: "",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;