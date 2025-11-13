import React from "react";


interface SearchbarProps {
  value: string; // ค่าที่พิมพ์อยู่ตอนนี้
  onSearch: (value: string) => void; // callback ให้ parent รับค่าการพิมพ์
}

export default function Searchbar({ value, onSearch }: SearchbarProps) {
  return (
    <div className="relative w-full max-w-md">
      <input
        type="text"
        value={value}
        onChange={(e) => onSearch(e.target.value)}
        placeholder=" ค้นหาโปรเจกต์..."
        className="w-full rounded-full border border-gray-300 bg-white py-2.5 pl-10 pr-4 text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-transparent shadow-sm transition-all"
      />
    </div>
  );
}
