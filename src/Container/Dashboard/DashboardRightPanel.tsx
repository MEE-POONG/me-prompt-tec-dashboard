import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Clock, Users } from 'lucide-react';
import { Intern } from "@/Data/dataintern"; 

export default function DashboardRightPanel() {
  return (
    <div className="space-y-8">
      {/* 🧑‍💻 Active Interns */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users size={20} className="text-orange-500" /> ทีมงานล่าสุด
        </h3>

        <div className="space-y-4">
          {Intern.slice(0, 3).map((intern) => (
            <div
              key={intern.id}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer"
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <Image src={intern.imageSrc} alt={intern.name} fill style={{ objectFit: 'cover' }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{intern.name}</p>
                <p className="text-xs text-gray-500 truncate">{intern.title}</p>
              </div>
              <div className="shrink-0">
                <span className="w-3 h-3 bg-green-500 rounded-full block shadow-sm shadow-green-200"></span>
              </div>
            </div>
          ))}
        </div>

        <Link href="/intern">
          <button className="w-full mt-6 py-2 text-sm text-blue-600 border border-blue-100 rounded-lg hover:bg-blue-50 transition-colors font-semibold">
            ดูรายชื่อทั้งหมด
          </button>
        </Link>
      </div>
    </div>
  );
}
