import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // Página estática de cadastro em eventos (public/cadastro) — /cadastro abre o index.html
  async rewrites() {
    return [{ source: "/cadastro", destination: "/cadastro/index.html" }];
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "qbpxwufhjeyrrzxthllo.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
