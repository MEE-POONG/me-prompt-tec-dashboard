import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { useRouter } from "next/router";

// 1. กำหนด Type ของข้อมูล
type Account = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

export default function AddOrEditAccount() {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [phone, setPhone] = useState("");
  
  const [isEditMode, setIsEditMode] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);

  const router = useRouter();
  
  // 2. ตรวจสอบ URL เพื่อดูว่าเป็นโหมด "เพิ่ม" หรือ "แก้ไข"
  useEffect(() => {
    if (!router.isReady) return; 

    const { id } = router.query;
    
    // เช็กว่า id มีค่า และเป็น string เท่านั้น (แก้ปัญหา Type Error)
    if (id && typeof id === 'string') {
      console.log("โหมดแก้ไข ID:", id);
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
        }
      }
    } else {
      console.log("โหมดเพิ่มใหม่");
      setIsEditMode(false);
      setEditId(null);
    }
  }, [router.isReady, router.query]); 

  // 3. ฟังก์ชันบันทึก (รองรับทั้งเพิ่มและแก้ไข)
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const storedAccounts = JSON.parse(localStorage.getItem("accounts") || "[]") as Account[];
    
    if (isEditMode && editId) {
      // --- กรณีแก้ไข ---
      const updatedAccounts = storedAccounts.map(acc => {
        if (acc.id === editId) {
          return { ...acc, fullName, email, password, phone };
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
      };
      storedAccounts.push(newAccountData);
      localStorage.setItem("accounts", JSON.stringify(storedAccounts));
    }

    router.push('/account'); // กลับไปหน้าตาราง
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
              <button type="button" onClick={() => router.push('/account')} className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300">ยกเลิก</button>
              <button type="submit" className={`px-4 py-2 text-white rounded-md font-medium ${isEditMode ? "bg-yellow-500 hover:bg-yellow-600" : "bg-green-500 hover:bg-green-600"}`}>
                {isEditMode ? "บันทึกการแก้ไข" : "บันทึก"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </Layouts>
  );
}