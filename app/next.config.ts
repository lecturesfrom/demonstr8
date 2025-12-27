import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // Fix workspace root detection (ignores stray lockfiles outside project)
  outputFileTracingRoot: path.join(__dirname, "./"),
};

export default nextConfig;
