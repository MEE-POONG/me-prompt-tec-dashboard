import Layouts from "@/components/Layouts";
import Link from "next/link";
import React, { useState, useEffect } from "react";

type Account = {
  id: string;
  fullName: string;
  email: string;
  password: string;
  phone: string;
};

export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);

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

  return (
    <Layouts>
      <div className="p-6 md:p-8 text-black w-full min-h-screen flex justify-center items-start">
        <div className="w-full max-w-4xl p-6 bg-white rounded-lg shadow-md overflow-x-auto">
          <h1 className="mb-6 text-2xl font-semibold text-center text-gray-800">
            จัดการ account
          </h1>

          <div className="flex justify-end mb-4">
            <Link href="/addaccount">
              <button className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50">
                + เพิ่ม Account
              </button>
            </Link>
          </div>

          <table className="min-w-full w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 ">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">ชื่อ-นามสกุล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">อีเมล</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">รหัสผ่าน</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-black-500 uppercase tracking-wider">เบอร์โทร</th>
                <th className="px-6 py-3 text-center text-xs font-medium text-black-500 uppercase tracking-wider">การดำเนินการ</th>
              </tr>
            </thead>
            
            <tbody className="bg-white divide-y divide-gray-200">
              {accounts.length > 0 ? (
                accounts.map((acc) => (
                  <tr key={acc.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{acc.fullName}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{acc.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{acc.password}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">{acc.phone || "-"}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                      <Link href={`/addaccount?id=${acc.id}`}>
                        <button className="px-3 py-1 bg-yellow-400 text-white rounded hover:bg-yellow-500 transition">แก้ไข</button>
                      </Link>
                      <button onClick={() => handleDelete(acc.id)} className="px-3 py-1 bg-red-500 text-white rounded hover:bg-red-600 transition">ลบ</button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-gray-400">- ยังไม่มีข้อมูล -</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </Layouts>
  );
}