"use client";
import { CircleX } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

interface ModalDeleteProps {
  message?: string;
  href?: string;
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void> | void; // รองรับ async และ non-async
}

const ModalDelete = ({
  message = "คุณต้องการลบข้อมูลนี้หรือไม่?",
  href = "",
  open,
  onClose,
  onConfirm,
}: ModalDeleteProps) => {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  if (!open) return null;

  const handleConfirm = async () => {
    try {
      setLoading(true);

      await onConfirm(); // เรียกฟังก์ชันลบ

      if (href) {
        router.push(href);
      }

      onClose();
    } catch (error) {
      console.error("Delete Error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-100">
      <div className="bg-white p-6 rounded-2xl shadow-xl text-center w-80">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="w-16 h-16 text-red-500 mx-auto mb-4"
        >
          <CircleX />
        </svg>

        <p className="text-xl font-semibold mb-6 text-black">{message}</p>

        <div className="flex gap-3 mt-4">
          <button
            onClick={onClose}
            disabled={loading}
            className="flex-1 bg-gray-200 text-gray-700 px-4 py-2 rounded-lg hover:bg-gray-300 disabled:opacity-50 hover:scale-105 transition-all duration-300"
          >
            ยกเลิก
          </button>

          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg hover:bg-red-700 disabled:opacity-50 hover:scale-105 transition-all duration-300"
          >
            {loading ? "กำลังลบ..." : "ลบข้อมูล"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ModalDelete;
