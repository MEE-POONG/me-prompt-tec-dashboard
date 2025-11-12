import Image from "next/image";
import { Geist, Geist_Mono } from "next/font/google";
import Layouts from "@/components/Layouts";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function Home() {
  return (
    <Layouts>
      <div className="flex justify-content-center">
        <h1 className="text-black">หน้า แรก และ report</h1>
      </div>
    </Layouts>
  );
}
