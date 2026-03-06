"use client";
import React, { useState } from "react";
import { Archive } from "lucide-react";

interface ModalArchiveProps {
    message?: string;
    open: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void> | void;
}

const ModalArchive = ({
    message = "คุณต้องการเก็บข้อมูลนี้เข้าคลังใช่หรือไม่?",
    open,
    onClose,
    onConfirm,
}: ModalArchiveProps) => {
    const [loading, setLoading] = useState(false);

    if (!open) return null;

    const handleConfirm = async () => {
        try {
            setLoading(true);
            await onConfirm();
            onClose();
        } catch (error) {
            console.error("Archive Error:", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80 transform scale-100 animate-in zoom-in-95 duration-200">
                <div className="w-16 h-16 bg-purple-50 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Archive className="w-8 h-8 text-purple-500" />
                </div>

                <p className="text-xl font-semibold mb-6 text-gray-800">{message}</p>

                <div className="flex gap-3 mt-4">
                    <button
                        onClick={onClose}
                        disabled={loading}
                        className="flex-1 bg-gray-100 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-200 disabled:opacity-50 transition-all duration-300"
                    >
                        ยกเลิก
                    </button>

                    <button
                        onClick={handleConfirm}
                        disabled={loading}
                        className="flex-1 bg-purple-600 text-white px-4 py-2 rounded-lg hover:bg-purple-700 disabled:opacity-50 hover:scale-105 transition-all duration-300 shadow-md shadow-purple-200"
                    >
                        {loading ? "กำลังเก็บ..." : "เก็บเข้าคลัง"}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ModalArchive;
