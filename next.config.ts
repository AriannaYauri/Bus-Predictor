import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    // ❗ Permite compilar aunque haya errores de ESLint
    ignoreDuringBuilds: true,
  },/* config options here */
};

export default nextConfig;
