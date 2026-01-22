import React from 'react';
import { X, AlertTriangle } from 'lucide-react';

interface ConfirmModalProps {
    open: boolean;
    title?: string;
    message: string;
    confirmText?: string;
    cancelText?: string;
    onConfirm: () => void;
    onCancel: () => void;
    type?: 'danger' | 'warning' | 'info';
}

export default function ConfirmModal({
    open,
    title = 'ยืนยันการดำเนินการ',
    message,
    confirmText = 'ยืนยัน',
    cancelText = 'ยกเลิก',
    onConfirm,
    onCancel,
    type = 'warning'
}: ConfirmModalProps) {
    if (!open) return null;

    const colors = {
        danger: {
            icon: 'text-red-500',
            button: 'bg-red-600 hover:bg-red-700'
        },
        warning: {
            icon: 'text-amber-500',
            button: 'bg-amber-600 hover:bg-amber-700'
        },
        info: {
            icon: 'text-blue-500',
            button: 'bg-blue-600 hover:bg-blue-700'
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200"
                onClick={onCancel}
            />

            {/* Modal */}
            <div className="relative bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 animate-in zoom-in-95 fade-in duration-200">
                {/* Close Button */}
                <button
                    onClick={onCancel}
                    className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 transition-colors"
                >
                    <X size={20} />
                </button>

                {/* Content */}
                <div className="p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-4">
                        <div className={`w-16 h-16 rounded-full bg-${type === 'danger' ? 'red' : type === 'warning' ? 'amber' : 'blue'}-50 flex items-center justify-center`}>
                            <AlertTriangle className={`w-8 h-8 ${colors[type].icon}`} />
                        </div>
                    </div>

                    {/* Title */}
                    <h3 className="text-xl font-bold text-slate-800 text-center mb-2">
                        {title}
                    </h3>

                    {/* Message */}
                    <p className="text-sm text-slate-600 text-center mb-6 whitespace-pre-wrap">
                        {message}
                    </p>

                    {/* Buttons */}
                    <div className="flex gap-3">
                        <button
                            onClick={onCancel}
                            className="flex-1 px-4 py-2.5 rounded-lg border-2 border-slate-300 text-slate-700 font-medium hover:bg-slate-50 transition-colors"
                        >
                            {cancelText}
                        </button>
                        <button
                            onClick={() => {
                                onConfirm();
                                onCancel();
                            }}
                            className={`flex-1 px-4 py-2.5 rounded-lg text-white font-medium transition-colors ${colors[type].button}`}
                        >
                            {confirmText}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
