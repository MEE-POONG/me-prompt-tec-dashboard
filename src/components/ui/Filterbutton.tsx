import { Funnel } from "lucide-react";
import React, { useState } from "react";

interface FilterButtonProps {
  tags: string[];
  techStacks: string[];
  onFilterChange: (filters: { tag: string | null; tech: string | null }) => void;
}

export default function FilterButton({
  tags,
  techStacks,
  onFilterChange,
}: FilterButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedTag, setSelectedTag] = useState<string | null>(null);
  const [selectedTech, setSelectedTech] = useState<string | null>(null);

  const toggleDropdown = () => setIsOpen(!isOpen);

  const handleTagSelect = (tag: string) => {
    const newTag = selectedTag === tag ? null : tag;
    setSelectedTag(newTag);
    onFilterChange({ tag: newTag, tech: selectedTech });
  };

  const handleTechSelect = (tech: string) => {
    const newTech = selectedTech === tech ? null : tech;
    setSelectedTech(newTech);
    onFilterChange({ tag: selectedTag, tech: newTech });
  };

  const clearFilters = () => {
    setSelectedTag(null);
    setSelectedTech(null);
    onFilterChange({ tag: null, tech: null });
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
        <div className="absolute right-0 mt-2 w-[350px] bg-white border border-gray-200 rounded-xl shadow-lg z-20 p-4">

          {/* Header + Clear */}
          <div className="flex justify-between items-center mb-3">
            <h1 className="text-black font-medium">ตัวกรอง</h1>
            {(selectedTag || selectedTech) && (
              <button
                onClick={clearFilters}
                className="text-sm text-red-500 hover:bg-red-50 px-2 py-1 rounded-lg"
              >
                ล้างทั้งหมด
              </button>
            )}
          </div>

          {/* Layout 2 คอลัมน์: Tags | Tech Stack */}
          <div className="grid grid-cols-2 gap-4">

            {/* Tags */}
            <div>
              <h2 className="text-gray-700 font-semibold mb-2 text-sm">Tags</h2>
              <div className="flex flex-col gap-1">
                {tags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => handleTagSelect(tag)}
                    className={`text-left text-sm px-3 py-1 rounded-lg ${
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

            {/* Tech Stack */}
            <div>
              <h2 className="text-gray-700 font-semibold mb-2 text-sm">Tech Stack</h2>
              <div className="flex flex-col gap-1">
                {techStacks.map((tech) => (
                  <button
                    key={tech}
                    onClick={() => handleTechSelect(tech)}
                    className={`text-left text-sm px-3 py-1 rounded-lg ${
                      selectedTech === tech
                        ? "bg-green-100 text-green-700 font-semibold"
                        : "hover:bg-gray-100 text-gray-700"
                    }`}
                  >
                    {tech}
                  </button>
                ))}
              </div>
            </div>

          </div>
        </div>
      )}
    </div>
  );
}
