import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Project } from "@/types/workspace";

interface SidebarCalendarProps {
    currentDate: Date;
    onDateChange: (date: Date) => void;
    selectedDate: string | null;
    onSelectDate: (dateStr: string | null) => void;
    projects: Project[];
}

export const SidebarCalendar: React.FC<SidebarCalendarProps> = ({
    currentDate,
    onDateChange,
    selectedDate,
    onSelectDate,
    projects,
}) => {
    return (
        <div className="w-full lg:w-80 space-y-6 shrink-0">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-gray-800">
                        {currentDate.toLocaleString("default", {
                            month: "long",
                            year: "numeric",
                        })}
                    </h3>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() =>
                                onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() - 1)))
                            }
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        >
                            <ChevronLeft size={16} />
                        </button>
                        <button
                            onClick={() =>
                                onDateChange(new Date(currentDate.setMonth(currentDate.getMonth() + 1)))
                            }
                            className="p-1 hover:bg-gray-100 rounded text-gray-600"
                        >
                            <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-gray-400 font-medium mb-2">
                    {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                        <span key={i}>{d}</span>
                    ))}
                </div>
                <div className="grid grid-cols-7 text-center gap-y-3 text-sm text-gray-700">
                    {[
                        ...Array(
                            new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay()
                        ),
                    ].map((_, i) => (
                        <span key={`empty-${i}`} />
                    ))}
                    {[
                        ...Array(
                            new Date(
                                currentDate.getFullYear(),
                                currentDate.getMonth() + 1,
                                0
                            ).getDate()
                        ),
                    ].map((_, i) => {
                        const day = i + 1;
                        const dateStr = `${currentDate.getFullYear()}-${(
                            currentDate.getMonth() + 1
                        )
                            .toString()
                            .padStart(2, "0")}-${day.toString().padStart(2, "0")}`;
                        const isSelected = selectedDate === dateStr;
                        const hasEvent = projects.some(
                            (p) => new Date(p.createdAt).toISOString().split("T")[0] === dateStr
                        );
                        return (
                            <div
                                key={day}
                                className="relative flex justify-center flex-col items-center"
                            >
                                <button
                                    onClick={() => onSelectDate(isSelected ? null : dateStr)}
                                    className={`h-7 w-7 rounded-full flex items-center justify-center transition-all ${isSelected
                                            ? "bg-blue-600 text-white shadow-lg"
                                            : "hover:bg-gray-100"
                                        } ${hasEvent && !isSelected ? "font-bold text-blue-600" : ""}`}
                                >
                                    {day}
                                </button>
                                {hasEvent && !isSelected && (
                                    <div className="mt-0.5 w-1 h-1 bg-blue-500 rounded-full"></div>
                                )}
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
