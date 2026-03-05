import React from "react";
import { Search } from "lucide-react";

interface SearchbarProps {
  value: string; // ค่าที่พิมพ์อยู่ตอนนี้
  onSearch: (value: string) => void; // callback ให้ parent รับค่าการพิมพ์
  placeholder?: string;
  className?: string;
}

export default function Searchbar({ value, onSearch, placeholder = "ค้นหา...", className = "" }: SearchbarProps) {
  return (
    <div className={`relative w-full ${className}`}>
      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
        <Search size={20} className="text-gray-400" />
      </div>
      <input
        type="text"
        placeholder={placeholder}
        className="w-full pl-11 pr-4 py-3 bg-gray-50 border border-transparent rounded-xl focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-100 transition-all text-gray-800 placeholder-gray-400 font-medium outline-none"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
      />
    </div>
  );
}
