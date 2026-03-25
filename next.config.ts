import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "www.congress.gov",
      },
      {
        protocol: "https",
        hostname: "www.senate.ca.gov",
      },
      {
        protocol: "https",
        hostname: "www.assembly.ca.gov",
      },
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
