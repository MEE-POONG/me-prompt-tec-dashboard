import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Mail, Clock, Users } from 'lucide-react';
import { Intern } from "@/Data/dataintern"; 

// Define Types for Props
interface Message {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  date: string;
  status: string;
}

interface DashboardRightPanelProps {
  contactMessages: Message[];
  unreadCount: number;
  onReadMessage: (id: number) => void;
}

export default function DashboardRightPanel({ contactMessages, unreadCount, onReadMessage }: DashboardRightPanelProps) {
  return (
    <div className="space-y-8">
      
      {/* 📩 Contact Messages Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-bold text-gray-800 flex items-center gap-2">
            <Mail size={20} className="text-blue-500"/> ข้อความเข้าใหม่
          </h3>
          {unreadCount > 0 && <span className="bg-red-100 text-red-600 text-xs font-bold px-2 py-1 rounded-full">{unreadCount} new</span>}
        </div>

        <div className="space-y-3">
          {contactMessages.map((msg) => (
            <div 
              key={msg.id} 
              onClick={() => onReadMessage(msg.id)}
              className={`p-3 rounded-xl border transition-all cursor-pointer hover:shadow-md
                ${msg.status === 'new' ? 'bg-blue-50 border-blue-200' : 'bg-white border-gray-100 opacity-70 hover:opacity-100'}
              `}
            >
              <div className="flex justify-between items-start mb-1">
                <h4 className={`text-sm font-bold ${msg.status === 'new' ? 'text-blue-800' : 'text-gray-700'}`}>
                  {msg.subject}
                </h4>
                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                  <Clock size={10}/> {msg.date}
                </span>
              </div>
              <p className="text-xs text-gray-600 line-clamp-2 mb-2">{msg.message}</p>
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-gray-500 bg-white/50 px-2 py-0.5 rounded">
                  จาก: {msg.name}
                </span>
                {msg.status === 'new' && <span className="w-2 h-2 bg-blue-500 rounded-full"></span>}
              </div>
            </div>
          ))}
        </div>

        <button className="w-full mt-4 text-xs text-center text-gray-400 hover:text-blue-600 py-2">
          ดูข้อความทั้งหมด
        </button>
      </div>

      {/* Active Interns */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
        <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center gap-2">
          <Users size={20} className="text-orange-500"/> ทีมงานล่าสุด
        </h3>
        
        <div className="space-y-4">
          {Intern.slice(0, 3).map((intern) => (
            <div key={intern.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-pointer">
              <div className="relative w-10 h-10 rounded-full overflow-hidden border border-gray-200 shrink-0">
                <Image src={intern.imageSrc} alt={intern.name} fill style={{objectFit: "cover"}} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-gray-800 truncate">{intern.name}</p>
                <p className="text-xs text-gray-500 truncate">{intern.title}</p>
              </div>
              <div className="shrink-0">
                <span className="w-3 h-3 bg-green-500 rounded-full block shadow-sm shadow-green-200" title="Online"></span>
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