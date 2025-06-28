import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        hostname: "learning-courses-platform.fly.storage.tigris.dev",
        port: "",
        protocol: "https"
      }
    ]
  }
};

export default nextConfig;
