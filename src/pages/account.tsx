import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import { SquarePen, Trash2, UserPlus, Search, Users } from "lucide-react";
import Link from "next/link";

type Account = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  position: string | null;
  role: string | null;
  isVerified: boolean;
};

export default function AccountPage() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/account");
      if (res.ok) {
        const data = await res.json();
        setAccounts(data);
      } else {
        console.error("Failed to fetch accounts");
      }
    } catch (error) {
      console.error("Error fetching accounts:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAccounts();
  }, []);

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/account/${id}`, { method: "DELETE" });
      if (res.ok) {
        setAccounts((prev) => prev.filter((acc) => acc.id !== id));
        setShowDeleteModal(false);
      } else {
        console.error("ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  const filteredAccounts = accounts.filter(
    (acc) =>
      (acc.name || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.email || "").toLowerCase().includes(searchTerm.toLowerCase()) ||
      (acc.position || "").toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8f9fc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        {/* --- 🌟 Background Aurora (Theme ฟ้า/ม่วง) --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                <Users size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-slate-800 via-blue-800 to-slate-800 bg-clip-text text-transparent">
                  จัดการบัญชีผู้ใช้
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                  ผู้ดูแลระบบและสมาชิกทั้งหมด{" "}
                  <span className="bg-blue-50 text-blue-600 px-2 py-0.5 rounded-md font-bold ml-1">
                    {accounts.length} บัญชี
                  </span>
                </p>
              </div>
            </div>

            <Link href="/addaccount">
              <button className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-1">
                <UserPlus size={20} />
                <span>เพิ่มบัญชีผู้ใช้</span>
              </button>
            </Link>
          </div>

          {/* Search Bar */}
          <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/50 mb-8 flex items-center">
            <div className="relative w-full md:w-96">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search size={20} className="text-slate-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหา ชื่อ, อีเมล, ตำแหน่ง..."
                className="pl-11 pr-4 py-3 w-full bg-white/50 border border-white rounded-xl focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm overflow-hidden border border-white/60">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                  <tr>
                    <th className="p-5 pl-8">ชื่อ-นามสกุล</th>
                    <th className="p-5">ตำแหน่ง</th>
                    <th className="p-5">อีเมล</th>
                    <th className="p-5 text-center">บทบาท</th>
                    <th className="p-5 text-center">เบอร์โทร</th>
                    <th className="p-5 text-center">สถานะยืนยันอีเมล</th>
                    <th className="p-5 pr-8 text-right">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                  {loading ? (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-slate-400"
                      >
                        กำลังโหลดข้อมูล...
                      </td>
                    </tr>
                  ) : filteredAccounts.length > 0 ? (
                    filteredAccounts.map((acc) => (
                      <tr
                        key={acc.id}
                        className="hover:bg-blue-50/30 transition-colors group"
                      >
                        <td className="p-5 pl-8 font-bold text-slate-800 group-hover:text-blue-600 transition-colors">
                          {acc.name || "-"}
                        </td>
                        <td className="p-5 text-slate-600 font-medium">
                          {acc.position || "-"}
                        </td>
                        <td className="p-5 text-slate-500">{acc.email}</td>
                        <td className="p-5 text-center">
                          <span
                            className={`px-3 py-1 rounded-full text-xs font-bold border ${
                              acc.role === "admin"
                                ? "bg-purple-50 text-purple-600 border-purple-100"
                                : acc.role === "staff"
                                ? "bg-blue-50 text-blue-600 border-blue-100"
                                : "bg-slate-100 text-slate-500 border-slate-200"
                            }`}
                          >
                            {(acc.role || "-").toUpperCase()}
                          </span>
                        </td>
                        <td className="p-5 text-center text-slate-500 font-mono">
                          {acc.phone || "-"}
                        </td>
                        <td className="p-5 text-center">
                          {acc.isVerified ? (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                              ✔ ยืนยันแล้ว
                            </span>
                          ) : (
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                              ✖ ยังไม่ยืนยัน
                            </span>
                          )}
                        </td>
                        <td className="p-5 pr-8 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <Link href={`/addaccount?id=${acc.id}`}>
                              <button className="p-2 bg-white border border-slate-200 hover:border-blue-200 hover:bg-blue-50 hover:text-blue-600 text-slate-400 rounded-lg shadow-sm transition-all">
                                <SquarePen size={18} />
                              </button>
                            </Link>
                            <button
                              onClick={() => {
                                setSelectedId(acc.id);
                                setShowDeleteModal(true);
                              }}
                              className="p-2 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg shadow-sm transition-all"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-10 text-center text-slate-400"
                      >
                        {searchTerm
                          ? "ไม่พบข้อมูลที่ค้นหา"
                          : "ยังไม่มีข้อมูลบัญชีผู้ใช้"}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>

          {showDeleteModal && selectedId && (
            <ModalDelete
              message="คุณแน่ใจหรือว่าต้องการลบบัญชีผู้ใช้นี้?"
              onClose={() => setShowDeleteModal(false)}
              onConfirm={() => handleDelete(selectedId)}
            />
          )}
        </div>
      </div>
    </Layouts>
  );
}
