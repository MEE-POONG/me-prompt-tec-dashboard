import React, { useState, useEffect } from "react";
import { X, Loader2 } from "lucide-react";
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
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [color, setColor] = useState("#3B82F6");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Sync state when modal opens or project changes
    useEffect(() => {
        if (isOpen && project) {
            setName(project.name || "");
            setDescription(project.description || "");
            setColor(project.color || "#3B82F6");
            setError(null);
            setIsLoading(false);
        }
    }, [isOpen, project]);

    if (!isOpen || !project) return null;

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsLoading(true);
        setError(null);

        try {
            await onUpdate({
                name: name.trim(),
                description: description.trim(),
                color,
            });
            // If onUpdate completes successfully without throwing, close modal logic is handled by parent
        } catch (err: any) {
            setError(err.message || "Something went wrong while saving.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div
            className="fixed inset-0 z-9999 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={!isLoading ? onClose : undefined}
        >
            <div
                className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in zoom-in-95 duration-200"
                onClick={(e) => e.stopPropagation()}
            >
                <div className="flex justify-between items-center p-6 border-b border-gray-100">
                    <h3 className="text-xl font-bold text-gray-800">Edit Project</h3>
                    <button
                        onClick={!isLoading ? onClose : undefined}
                        disabled={isLoading}
                        className="text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 disabled:opacity-50"
                    >
                        <X size={24} />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    {error && (
                        <div className="p-3 bg-red-50 border border-red-200 text-red-600 rounded-xl text-sm mb-4">
                            {error}
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-semibold text-gray-700 mb-1">
                            Project Name
                        </label>
                        <input
                            name="name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            disabled={isLoading}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all disabled:bg-gray-50 disabled:text-gray-500"
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
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            disabled={isLoading}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none disabled:bg-gray-50 disabled:text-gray-500"
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
                            ].map((colorOption) => (
                                <label key={colorOption} className={`relative ${isLoading ? "cursor-not-allowed opacity-60" : "cursor-pointer"}`}>
                                    <input
                                        type="radio"
                                        name="color"
                                        value={colorOption}
                                        checked={color === colorOption}
                                        onChange={() => setColor(colorOption)}
                                        disabled={isLoading}
                                        className="peer sr-only"
                                    />
                                    <div
                                        className="w-8 h-8 rounded-full border-2 border-transparent peer-checked:border-gray-800 peer-checked:scale-110 transition-all"
                                        style={{ backgroundColor: colorOption }}
                                    />
                                </label>
                            ))}
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            disabled={isLoading}
                            className="flex-1 px-4 py-2.5 border border-gray-200 text-gray-600 font-semibold rounded-xl hover:bg-gray-50 transition-colors disabled:opacity-50"
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            disabled={isLoading || !name.trim()}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white font-semibold rounded-xl hover:bg-blue-700 shadow-lg shadow-blue-200 transition-all active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 size={18} className="animate-spin" />
                                    <span>Saving...</span>
                                </>
                            ) : (
                                "Save Changes"
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};
