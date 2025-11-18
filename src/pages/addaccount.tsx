import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { useRouter } from "next/router";

// 1. อัปเดต Type ให้มี position
type Account = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  position: string; 
};

export default function AddOrEditAccount() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  const [position, setPosition] = useState(""); 
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false); // State สถานะการโหลด

  const router = useRouter();
  
  useEffect(() => {
    if (!router.isReady) return; 

    const { id } = router.query;
    
    if (id && typeof id === 'string') {
      setIsEditMode(true);
      setEditId(id);

      const storedAccounts = localStorage.getItem("accounts");
      if (storedAccounts) {
        const accounts = JSON.parse(storedAccounts) as Account[];
        const accountToEdit = accounts.find(acc => acc.id === id);
        
        if (accountToEdit) {
          setFullName(accountToEdit.fullName);
          setEmail(accountToEdit.email);
          setPassword(accountToEdit.password);
          setPhone(accountToEdit.phone);
          setPosition(accountToEdit.position || ""); 
        }
      }
    } else {
      setIsEditMode(false);
      setEditId(null);
    }
  }, [router.isReady, router.query]); 

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true); // เริ่มโหลด

    // จำลองเวลาโหลด 1.5 วินาที (เพื่อให้เห็นอนิเมชั่นหมุน)
    await new Promise(resolve => setTimeout(resolve, 1500)); 
    
    const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[];
    
    if (isEditMode && editId) {
      // --- กรณีแก้ไข ---
      const updatedAccounts = storedAccounts.map(acc => {
        if (acc.id === editId) {
          return { ...acc, fullName, email, password, phone, position };
        }
        return acc;
      });
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
      
    } else {
      // --- กรณีเพิ่มใหม่ ---
      const newAccountData: Account = {
        id: Date.now().toString(), 
        fullName,
        email,
        password,
        phone,
        position,
      };
      storedAccounts.push(newAccountData);
      localStorage.setItem("accounts", JSON.stringify(storedAccounts));
    }

    setIsProcessing(false); // หยุดโหลด
    router.push('/account'); 
  };

  return (
    <Layouts>
      <div className="p-6 md:p-8 w-full min-h-screen flex justify-center items-start">
        <div className="w-full max-w-lg p-6 bg-white rounded-lg shadow-lg border border-gray-100">
          
          <h1 className="text-2xl font-semibold text-center text-gray-900 mb-6">
            {isEditMode ? "แก้ไข Account" : "เพิ่ม Account ใหม่"}
          </h1>

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">ชื่อ-นามสกุล</label>
              <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" required />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">ตำแหน่ง</label>
              <input 
                type="text" 
                value={position} 
                onChange={(e) => setPosition(e.target.value)} 
                className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" 
                placeholder="เช่น Developer, Designer"
                required 
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">อีเมล</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">รหัสผ่าน</label>
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" required />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-900 mb-1">เบอร์โทร</label>
              <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="w-full px-3 py-2 border border-gray-300 rounded-md text-black" />
            </div>

            <div className="flex justify-end space-x-4 mt-6">
              <button 
                type="button" 
                onClick={() => router.push('/account')} 
                className="cursor-pointer px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"
                disabled={isProcessing}
              >
                ยกเลิก
              </button>
              
              <button 
                type="submit" 
                // แก้ไข: เพิ่ม transition delay... ให้กับสีเหลือง (แก้ไข) ด้วย
                className={`cursor-pointer px-4 py-2 text-white rounded-md font-medium flex items-center justify-center space-x-2 
                  ${isEditMode 
                    ? "bg-yellow-500 hover:bg-yellow-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110" 
                    : "bg-green-500 hover:bg-green-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110"}
                  ${isProcessing ? "opacity-75 cursor-not-allowed" : ""} `} 
                disabled={isProcessing}
              >
                {/* ส่วนนี้คือ SVG หมุนๆ */}
                {isProcessing && (
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                )}
                {/* ข้อความในปุ่ม */}
                {isProcessing 
                  ? "กำลังบันทึก..." 
                  : (isEditMode ? "บันทึกการแก้ไข" : "บันทึก")
                }
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layouts>
  );
}