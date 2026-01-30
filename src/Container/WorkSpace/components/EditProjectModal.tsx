import React, { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Project } from "@/types/workspace";

interface EditProjectModalProps {
    isOpen: boolean;
    onClose: () => void;
    project: Project | null;
    onUpdate: (updatedData: { name: string; description: string; color: string }) => Promise<void>;
}

export const EditProjectModal: React.FC<EditProjectModalProps> = ({
    isOpen,
    onClose,
    project,
    onUpdate,
}) => {
    if (!isOpen || !project) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        const updatedData = {
            name: formData.get("name") as string,
            description: formData.get("description") as string,
            color: formData.get("color") as string,
        };
        await onUpdate(updatedData);
    };

    return (
        <div
            className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Edit Project</h3>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
                    >
                        <X size={24} />
                    </button>
                </div>
                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            name="name"
                            defaultValue={project.name}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                            placeholder="Enter project name"
                            required
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Description
                        </label>
                        <textarea
                            name="description"
                            defaultValue={project.description}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none"
                            placeholder="Project details..."
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Theme Color
                        </label>
                        <div className="flex gap-3 mt-2">
                            {[
                                "#3B82F6",
                                "#8B5CF6",
                                "#10B981",
                                "#F59E0B",
                                "#EF4444",
                            ].map((color) => (
                                <label key={color} className="relative cursor-pointer">
                                    <input
                                        type="radio"
                                        name="color"
                                        value={color}
                                        defaultChecked={project.color === color}
                                        className="peer sr-only"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-800 peer-checked:scale-110 transition-all"
                                        style={{ backgroundColor: color }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95"
                        >
                            Save Changes
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
