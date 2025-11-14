import Layouts from "@/components/Layouts";
import { Link } from "lucide-react";
import React from "react";
import { useState, useEffect } from "react";

export default function account() {
  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full">
        
        {/* === ส่วนหัวข้อและปุ่ม (จากโค้ดเดิม) === */}
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md overflow-x-auto">
      <h1 className="mb-6 text-2xl font-semibold text-center text-gray-800">
        จัดการ account
      </h1>
          <table className="min-w-full w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">รหัสผ่าน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">เบอร์โทร</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
          </table>
           <div className="flex space-x-3">
                  <Link href=""className="bg-green-500 hover:bg-green-600  text-white font-bold py-2 px-5 rounded-lg transition-colors">
                  
                  </Link>
                  </div>
        </div>
        </div>
    </Layouts>
  );
}
