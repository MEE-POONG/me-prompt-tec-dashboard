import { useState } from 'react';
import CustomAlert from '@/components/CustomAlert';

export default function AlertExample() {
    const [alert, setAlert] = useState({
        open: false,
        title: '',
        message: '',
        type: 'info' as 'success' | 'error' | 'warning' | 'info'
    });

    // ฟังก์ชันแสดง Alert แทน window.alert()
    const showAlert = (message: string, type: 'success' | 'error' | 'warning' | 'info' = 'info', title?: string) => {
        setAlert({
            open: true,
            title: title || '',
            message,
            type
        });
    };

    return (
        <div className="p-8 space-y-4">
            <h1 className="text-2xl font-bold mb-6">Custom Alert Examples</h1>

            {/* ตัวอย่างการใช้งาน */}
            <button
                onClick={() => showAlert('อัปเดตเสร็จแล้ว! เปลี่ยน 25 คน', 'success', 'สำเร็จ!')}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
            >
                Success Alert
            </button>

            <button
                onClick={() => showAlert('เกิดข้อผิดพลาด กรุณาลองใหม่อีกครั้ง', 'error', 'ผิดพลาด!')}
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
            >
                Error Alert
            </button>

            <button
                onClick={() => showAlert('คุณแน่ใจหรือไม่ว่าต้องการดำเนินการต่อ?', 'warning', 'คำเตือน')}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
            >
                Warning Alert
            </button>

            <button
                onClick={() => showAlert('นี่คือข้อมูลที่คุณควรทราบ', 'info', 'ข้อมูล')}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
                Info Alert
            </button>

            {/* Custom Alert Component */}
            <CustomAlert
                open={alert.open}
                title={alert.title}
                message={alert.message}
                type={alert.type}
                onClose={() => setAlert({ ...alert, open: false })}
            />
        </div>
    );
}
