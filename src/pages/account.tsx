import Layouts from "@/components/Layouts";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import { SquarePen, Trash2 } from "lucide-react";
import Link from "next/link";
import React, { useState, useEffect } from "react";

// กำหนด Type ให้ตรงกับข้อมูลจาก API (และ Schema)
// เครื่องหมาย ? หรือ | null หมายถึงข้อมูลอาจจะเป็นค่าว่างได้
type Account = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  position: string | null;
  role: string | null;
};

export default function AccountPage() {
  // ระบุ Type ให้กับ useState
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ฟังก์ชันดึงข้อมูลจาก API
  const fetchAccounts = async () => {
    try {
      const res = await fetch("/api/account");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        console.error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    }
  };

  // โหลดข้อมูลเมื่อหน้าเว็บโหลดเสร็จ
  useEffect(() => {
    fetchAccounts();
  }, []);

  // ฟังก์ชันลบข้อมูล (ระบุ type ให้ id เป็น string)
  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/${id}`, { method: "DELETE" });
      if (res.ok) {
        // ลบสำเร็จ อัปเดตหน้าจอโดยกรองเอา ID ที่ลบออกไป
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
        // ถ้าต้องการแจ้ง success ให้ใช้ modal success แทน alert
      } else {
        console.error("ลบไม่สำเร็จ");
        // สามารถใช้ modal แจ้ง error แทน alert
      }
    } catch (error) {
      console.error("Error deleting:", error);
      // ใช้ modal แจ้ง error แทน alert
    }
  };

  // ฟังก์ชันกรองข้อมูลสำหรับค้นหา
  const filteredAccounts = accounts.filter(
    (acc) =>
      (acc.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layouts>
      <div className="w-full p-6 bg-white overflow-x-auto">
        {/* Header: ช่องค้นหา และ ปุ่มเพิ่ม */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-12 gap-4 mt-5 ">
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-violet-700 to-red-400 bg-clip-text text-transparent">
            จัดการบัญชีผู้ใช้
          </h1>
          {/* ช่องค้นหา */}
          <div className="w-full md:w-1/3 relative">
            <input
              type="text"
              placeholder="🔍 ค้นหา ชื่อ, อีเมล, ตำแหน่ง..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 text-black"
            />
          </div>

          {/* ปุ่มเพิ่ม */}
          <Link href="/addaccount">
            <button className="cursor-pointer px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 transition delay-150 duration-300 ease-in-out hover:-translate-y-1 hover:scale-110 whitespace-nowrap">
              เพิ่มบัญชีผู้ใช้
            </button>
          </Link>
        </div>

        {/* ตารางข้อมูล */}
        <table className="min-w-full w-full divide-y divide-gray-200">
          <thead className="bg-gray-50 text-black">
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
                บทบาท
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
            {filteredAccounts.length > 0 ? (
              filteredAccounts.map((acc) => (
                <tr key={acc.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {acc.name || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 font-medium">
                    {acc.position || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {acc.email}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {acc.role || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    ********
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600">
                    {acc.phone || "-"}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-center space-x-2">
                    {/* ปุ่มแก้ไข */}
                    <Link href={`/addaccount?id=${acc.id}`}>
                      <button className="text-yellow-500 hover:scale-105 rounded-full p-2 hover:bg-yellow-100 transition duration-150 ease-in-out">
                        <SquarePen size={25} />
                      </button>
                    </Link>
                    {/* ปุ่มลบ */}
                    <button
                      onClick={() => {
                        setSelectedId(acc.id); // <-- เซ็ต id ของ user ที่จะลบ
                        setShowDeleteModal(true);
                      }}
                      className="text-red-600 hover:scale-105 rounded-full p-2 hover:bg-red-100 transition duration-150 ease-in-out"
                    >
                      <Trash2 size={25} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={6}
                  className="px-6 py-10 text-center text-gray-400"
                >
                  {searchTerm ? "ไม่พบข้อมูลที่ค้นหา" : "- ยังไม่มีข้อมูล -"}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showDeleteModal && selectedId && (
        <ModalDelete
          message="คุณแน่ใจหรือว่าต้องการลบบัญชีผู้ใช้นี้?"
          onClose={() => setShowDeleteModal(false)}
          onConfirm={() => handleDelete(selectedId)} // <-- wrapper function ไม่มี argument
          href="" // ส่ง path ถ้าต้องการ redirect
        />
      )}
    </Layouts>
  );
}
