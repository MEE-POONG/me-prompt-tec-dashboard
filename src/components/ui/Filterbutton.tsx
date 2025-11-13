import { Project, projects } from "@/Data/Project_data";
import { Funnel } from "lucide-react";
import React, { useState } from "react";

interface FilterButtonProps {
  tags: string[];
  onFilterChange: (tag: string | null) => void;
}

export default function FilterButton({
  tags,
  onFilterChange,
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleSelect = (tag: string) => {
    const newTag = tag === selectedTag ? null : tag;
    setSelectedTag(newTag);
    onFilterChange(newTag); // ส่งค่าไปให้ parent
    setIsOpen(false);
  };

  return (
    <div className="relative">
      {/* ปุ่มกรอง */}
      <button
        onClick={toggleDropdown}
        className="p-2.5 rounded-full border border-gray-300 hover:bg-gray-100 transition-all flex items-center justify-center"
      >
        <Funnel className="w-5 h-5 text-gray-600" />
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-xl shadow-lg z-20">
          <div className="border-b border-gray-200 px-4 py-2 flex gap-3 justify-between sm:justify-between items-center">
            <div className="mb-2">
              <h1 className="text-black">Tags</h1>
            </div>
            <div className="mb-2">
              {selectedTag && (
                <button
                  onClick={() => handleSelect(selectedTag)}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-500 hover:text-red-500 hover:bg-red-50 rounded-lg"
                >
                  ล้างตัวกรอง
                </button>
              )}
            </div>
          </div>
          <div className="py-2">
            {tags.map((tag) => (
              <button
                key={tag}
                onClick={() => handleSelect(tag)}
                className={`block w-full text-left px-4 py-2 text-sm rounded-lg ${
                  selectedTag === tag
                    ? "bg-blue-100 text-blue-700 font-semibold"
                    : "hover:bg-gray-100 text-gray-700"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
