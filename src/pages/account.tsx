import Layouts from "@/components/Layouts";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// 1. Type Definition
type Account = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
  position: string;
};

export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState(""); // <--- 2. เพิ่ม State สำหรับค้นหา

  useEffect(() => {
    const storedData = localStorage.getItem("accounts");
    if (storedData) {
      setAccounts(JSON.parse(storedData) as Account[]);
    }
  }, []);

  const handleDelete = (id: string) => {
    if (confirm("คุณต้องการลบ Account นี้ใช่หรือไม่?")) {
      const updatedAccounts = accounts.filter((acc) => acc.id !== id);
      setAccounts(updatedAccounts);
      localStorage.setItem("accounts", JSON.stringify(updatedAccounts));
    }
  };

  // 3. ฟังก์ชันกรองข้อมูล (Search Logic)
  // ค้นหาจาก ชื่อ, อีเมล หรือ ตำแหน่ง
  const filteredAccounts = accounts.filter((acc) => 
    acc.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    acc.position.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full min-h-screen flex justify-center items-start">
        <div className="w-full max-w-5xl p-6 bg-white rounded-lg shadow-md overflow-x-auto">
          <h1 className="mb-6 text-2xl font-semibold text-center text-gray-800">
            จัดการ account
          </h1>

          {/* 4. ปรับส่วน Header ให้มีช่องค้นหา และปุ่มเพิ่ม */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
            
            {/* --- ช่องค้นหา --- */}
            <div className="w-full md:w-1/3 relative">
              <input 
                type="text"
                placeholder="🔍 ค้นหา ชื่อ, อีเมล, ตำแหน่ง..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
              />
            </div>

            {/* --- ปุ่มเพิ่ม --- */}
            <Link href="/addaccount">
              <button className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 whitespace-nowrap">
                + เพิ่ม Account
              </button>
            </Link>
          </div>

          <table className="min-w-full w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  ชื่อ-นามสกุล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  ตำแหน่ง
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  อีเมล
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  รหัสผ่าน
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">
                  เบอร์โทร
                </th>
                <th className="px-6 py-3 text-center text-xs font-medium text-black-500 uppercase tracking-wider">
                  การดำเนินการ
                </th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {/* 5. ใช้ filteredAccounts แทน accounts ในการวนลูป */}
              {filteredAccounts.length > 0 ? (
                filteredAccounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {acc.fullName}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                      {acc.position || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {acc.email}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {acc.password}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                      {acc.phone || "-"}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                      <Link href={`/addaccount?id=${acc.id}`}>
                        <button className="cursor-pointer px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
                          แก้ไข
                        </button>
                      </Link>
                      <button onClick={() => handleDelete(acc.id)} className="cursor-pointer px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110">
                        ลบ
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-10 text-center text-gray-400">
                    {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "- ยังไม่มีข้อมูล -"}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layouts>
  );
}