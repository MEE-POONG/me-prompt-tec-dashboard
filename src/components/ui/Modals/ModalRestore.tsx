"use client";
import React, { useState } from "react";
import { History } from "lucide-react";

interface ModalRestoreProps {
  message?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void;
}

const ModalRestore = ({
  message = "คุณต้องการคืนค่าข้อมูลนี้ใช่หรือไม่?",
  open,
  onClose,
  onConfirm,
}: ModalRestoreProps) => {
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);
      await onConfirm();
      onClose();
    } catch (error) {
      console.error("Restore Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80 transform scale-100 animate-in zoom-in-95 duration-200">
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4">
          <History className="w-8 h-8 text-blue-500" />
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
            className="flex-1 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 disabled:opacity-50 hover:scale-105 transition-all duration-300 shadow-md shadow-blue-200"
          >
            {loading ? "กำลังคืนค่า..." : "คืนค่า"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalRestore;
