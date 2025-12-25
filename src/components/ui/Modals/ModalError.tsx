import { XCircle } from "lucide-react";

interface ModalErrorProps {
  message?: string;
  description?: string;
  open: boolean;
  onClose: () => void;
}

export default function ModalError({
  message = "@4I-4%2!",
  description = "D!H*2!2#3@42#DI #82%-C+!H-5#1I",
  open,
  onClose,
}: ModalErrorProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white rounded-2xl p-8 max-w-sm w-full text-center shadow-2xl transform scale-100 animate-in zoom-in-95 duration-200">
        <XCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />

        <h3 className="text-2xl font-bold text-gray-800 mb-2">{message}</h3>

        <p className="text-gray-600 text-lg mb-5">{description}</p>

        <button
          onClick={onClose}
          className="mt-6 px-6 py-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all duration-300 hover:scale-105"
        >
          4
        </button>
      </div>
    </div>
  );
}
