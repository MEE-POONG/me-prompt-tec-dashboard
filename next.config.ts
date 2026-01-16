import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Enable standalone output for Docker deployment
  output: 'standalone',

  // 👇 เพิ่มส่วนนี้เข้าไปครับ
  images: {
    unoptimized: true, // ปิด image optimization เพื่อแก้ปัญหา 500 error
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // อนุญาตให้โหลดรูปจากเว็บ placehold.co
      },
      {
        protocol: 'https',
        hostname: 'imagedelivery.net', // Cloudflare Images
      },
    ],
  },
};

export default nextConfig;