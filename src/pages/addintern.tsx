import React from "react";
import Layouts from "@/components/Layouts"; // อย่าลืม import Layouts นะครับ
import { Upload } from "lucide-react"; // (Optional) เพิ่มไอคอนสวยๆ
import Link from "next/link";
export default function AddInternPage() {
  return (
    <Layouts>
      {/* ส่วนเนื้อหาหลัก */}
      <div className="p-6 md:p-8 text-black w-full max-w-6xl mx-auto">
        
        {/* === ส่วนหัวข้อ === */}
        <h1 className="text-2xl lg:text-3xl font-bold mb-8">
          เพิ่มข้อมูล
        </h1>

        {/* === ฟอร์มหลัก === */}
        <form>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">

            {/* --- คอลัมน์ซ้าย (รูป & Portfolio) --- */}
            <div className="space-y-6">
              
              {/* ช่องอัปโหลดรูป */}
              <div>
                {/* (สำหรับ Layout) นี่คือกล่องสีเทาๆ ครับ 
                  (การใช้งานจริง) คุณจะต้องซ่อน <input type="file" /> 
                  และใช้ JavaScript สั่งงานมันเมื่อคลิกที่ div นี้
                */}
                <div className="aspect-square bg-gray-100 rounded-lg border-2 border-dashed border-gray-300
                                flex flex-col items-center justify-center 
                                text-gray-500 cursor-pointer hover:bg-gray-200 transition-colors">
                  <Upload size={40} className="mb-2" />
                  <span className="font-semibold">คลิกเพิ่มรูปภาพ</span>
                </div>
              </div>

              {/* Porfolio */}
              <div>
                <label htmlFor="portfolio" className="block text-lg font-bold text-gray-800 mb-2">
                  Portfolio
                </label>
                <input 
                  type="text" 
                  id="portfolio"
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>

            </div>

            {/* --- คอลัมน์ขวา (ข้อมูล) --- */}
            <div className="space-y-6">

              {/* Name */}
              <div>
                <label htmlFor="name" className="block text-lg font-bold text-gray-800 mb-2">
                  Name:
                </label>
                <input 
                  type="text" 
                  id="name"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              {/* Facebook */}
              <div>
                <label htmlFor="facebook" className="block text-lg font-bold text-gray-800 mb-2">
                  Facebook
                </label>
                <input 
                  type="text" 
                  id="facebook"
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              {/* Instagram */}
              <div>
                <label htmlFor="instagram" className="block text-lg font-bold text-gray-800 mb-2">
                  Instagram
                </label>
                <input 
                  type="text" 
                  id="instagram"
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>

              {/* Github */}
              <div>
                <label htmlFor="github" className="block text-lg font-bold text-gray-800 mb-2">
                  Github
                </label>
                <input 
                  type="text" 
                  id="github"
                  placeholder="https://..."
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50"
                />
              </div>
              
              {/* ตำแหน่ง (Dropdown) */}
              <div>
                <label htmlFor="position" className="block text-lg font-bold text-gray-800 mb-2">
                  ตำแหน่ง
                </label>
                <select 
                  id="position"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 appearance-none"
                >
                  <option value="">-- กรุณาเลือกตำแหน่ง --</option>
                  <option value="intern">นักศึกษาฝึกงาน</option>
                  
                </select>
              </div>

            </div>
          </div>

          {/* === ปุ่ม Submit === */}
          {/* (ในรูปไม่มี แต่ฟอร์มควรจะต้องมีปุ่มบันทึกครับ) */}
          <div className="flex justify-end pt-8 mt-8 border-t border-gray-200">
            <button 
              type="submit"
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition-colors"
            >
              บันทึกข้อมูล
            </button>
          </div>

        </form>
      </div>
    </Layouts>
  );
}