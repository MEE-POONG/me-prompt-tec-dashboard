import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  
  // 👇 เพิ่มส่วนนี้เข้าไปครับ
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co', // อนุญาตให้โหลดรูปจากเว็บ placehold.co
      },
    ],
  },
};

export default nextConfig;