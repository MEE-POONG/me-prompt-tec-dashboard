import React from "react";
import { useRouter } from "next/navigation";

interface ModalSuccessProps {
  message?: string;
  description?: string;
  open: boolean;
  href?: string;
  onClose?: () => void;
}

const CheckCircleIcon = () => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    fill="none"
    viewBox="0 0 24 24"
    strokeWidth={1.5}
    stroke="currentColor"
    className="w-16 h-16 text-green-500 mx-auto mb-4"
  >
    <path
      strokeLinecap="round"
      strokeLinejoin="round"
      d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
    />
  </svg>
);

export default function ModalSuccess({
  message = "สำเร็จ!",
  description = "ดำเนินการเรียบร้อยแล้ว",
  open,
  onClose,
  href,
}: ModalSuccessProps) {
  const router = useRouter();

  if (!open) return null;

  const handleClick = async () => {
    if (href) {
      await router.push(href); // ⬅️ ไปลิ้งก่อน
    }

    if (onClose) {
      onClose(); // ⬅️ ค่อยปิด modal ทีหลัง
    }
  };

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
        <CheckCircleIcon />

        <h3 className="text-2xl font-bold text-gray-800 mb-2">{message}</h3>

        <p className="text-gray-600 text-lg mb-5">{description}</p>

        <button
          onClick={handleClick}
          className="mt-6 px-6 py-2 bg-purple-500 text-white rounded-full hover:bg-purple-600 transition-all duration-300 hover:scale-105"
        >
          ตกลง
        </button>
      </div>
    </div>
  );
}
