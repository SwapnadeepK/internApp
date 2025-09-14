import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  reactStrictMode: true,           // Enables React strict mode
  swcMinify: true,                 // Use SWC for faster minification
  images: {
    domains: ["example.com"],      // Allow loading images from specific domains
  },
  env: {
    CUSTOM_API_URL: process.env.CUSTOM_API_URL, // Expose custom env variables
  },
  experimental: {
    appDir: true,                  // Enable the new App Router
  },
};

export default nextConfig;