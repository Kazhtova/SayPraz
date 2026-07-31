import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,

  // 💡 Mencegah warning 'multiple lockfiles' & kunci workspace root
  outputFileTracingRoot: path.join(__dirname, "../../"),
};

export default nextConfig;