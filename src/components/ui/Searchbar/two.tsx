import React from "react";
import { LayoutGrid, List } from "lucide-react";
import Searchbar from ".";

interface SearchbarTwoProps {
    value: string;
    onSearch: (value: string) => void;
    viewType: "grid" | "list";
    onViewChange: (view: "grid" | "list") => void;
    placeholder?: string;
    action?: React.ReactNode;
}

export default function SearchbarTwo({ value, onSearch, viewType, onViewChange, placeholder = "ค้นหา...", action }: SearchbarTwoProps) {
    return (
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 bg-white p-2 pr-4 rounded-2xl shadow-sm border border-gray-200">
            {/* Search Bar */}
            <Searchbar
                value={value}
                onSearch={onSearch}
                placeholder={placeholder}
                className="flex-1"
            />

            {/* Right Controls */}
            <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                {/* View Toggle */}
                <div className="flex bg-gray-100 p-1 rounded-xl border border-gray-200">
                    <button
                        onClick={() => onViewChange("grid")}
                        className={`p-2 rounded-lg transition-all duration-200 ${viewType === "grid"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <LayoutGrid size={20} />
                    </button>
                    <button
                        onClick={() => onViewChange("list")}
                        className={`p-2 rounded-lg transition-all duration-200 ${viewType === "list"
                            ? "bg-white text-blue-600 shadow-sm"
                            : "text-gray-500 hover:text-gray-700"
                            }`}
                    >
                        <List size={20} />
                    </button>
                </div>

                {action}
            </div>
        </div>
    );
}
