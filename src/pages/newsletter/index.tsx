import type { NextApiRequest, NextApiResponse } from "next";
import React, { useEffect, useState } from "react";
import Layouts from "@/components/Layouts";
import { Mail, Search, Trash2, ChevronLeft, ChevronRight, RefreshCcw, Download, Users, Calendar, ArrowUpDown } from "lucide-react";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

type Subscriber = {
  id: string;
  email: string;
  createdAt: string;
};

export default function NewsletterPage() {
  const [items, setItems] = useState<Subscriber[]>([]);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // 'asc' = เก่าสุดก่อน, 'desc' = ใหม่สุดก่อน
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("asc");

  const totalPages = Math.max(1, Math.ceil(total / pageSize));

  // ฟังก์ชันดึงข้อมูล (สำหรับแสดงผลหน้าเว็บ)
  const fetchData = async (pageOverride?: number) => {
    const p = pageOverride ?? page;
    setLoading(true);

    try {
      const params = new URLSearchParams({
        page: String(p),
        pageSize: String(pageSize),
        sort: sortOrder,
      });
      if (search.trim()) params.set("search", search.trim());

      const res = await fetch(`/api/newsletter?${params.toString()}`);
      const json = await res.json();

      if (json.success) {
        setItems(json.data);
        setTotal(json.total || 0);
        if (pageOverride) setPage(pageOverride);
      }
    } catch (error) {
      console.error("Fetch error:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(1);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sortOrder]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData(1);
  };

  const toggleSort = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    
    try {
      const res = await fetch(`/api/newsletter?id=${deleteId}`, {
        method: "DELETE",
      });
      const json = await res.json();

      if (json.success) {
        fetchData();
        setDeleteId(null);
      } else {
        alert(json.message ?? "ลบไม่สำเร็จ");
      }
    } catch (error) {
      console.error("Delete error:", error);
    }
  };

  // ✅ แก้ไข: ฟังก์ชัน Export CSV (ดึงข้อมูลทั้งหมดจาก API)
  const handleExportCSV = async () => {
    try {
        const confirmed = confirm(`คุณต้องการดาวน์โหลดรายชื่อทั้งหมดจำนวน ${total} รายชื่อใช่ไหม?`);
        if (!confirmed) return;

        // เรียก API ใหม่โดยขอข้อมูลจำนวนมาก (100,000) เพื่อให้ได้ครบทุกคน
        const res = await fetch(`/api/newsletter?page=1&pageSize=100000&sort=${sortOrder}`);
        const json = await res.json();

        if (!json.success || !json.data) {
            alert("เกิดข้อผิดพลาดในการดึงข้อมูล");
            return;
        }

        const allItems: Subscriber[] = json.data;

        if (allItems.length === 0) {
            alert("ไม่มีข้อมูลให้ส่งออก");
            return;
        }

        const headers = ["Email,Subscribe Date"];
        const rows = allItems.map(item => {
            // จัด Format วันที่ให้เป็นแบบไทย และมีเวลา
            const date = new Date(item.createdAt).toLocaleDateString("th-TH", {
                year: 'numeric', month: '2-digit', day: '2-digit', 
                hour: '2-digit', minute: '2-digit'
            });
            // ใส่ "" ครอบวันที่เพื่อป้องกัน Excel แสดงผลผิดเพี้ยน
            return `${item.email},"${date}"`; 
        });

        const csvContent = "\uFEFF" + [headers, ...rows].join("\n");
        const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const link = document.createElement("a");
        link.setAttribute("href", url);
        link.setAttribute("download", `subscribers_all_${new Date().toISOString().slice(0, 10)}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);

    } catch (error) {
        console.error("Export error:", error);
        alert("เกิดข้อผิดพลาดในการส่งออกไฟล์");
    }
  };

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8f9fc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        
        {/* --- Background Aurora --- */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
             <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
             <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-pink-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
             <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-7xl mx-auto relative z-10">
          
          {/* Header */}
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div className="flex items-center gap-4">
                <div className="p-3.5 bg-linear-to-br from-violet-600 to-fuchsia-600 text-white rounded-2xl shadow-lg shadow-violet-500/30">
                    <Mail size={32} strokeWidth={1.5} />
                </div>
                <div>
                    <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-violet-800 via-fuchsia-700 to-violet-800 bg-clip-text text-transparent">
                        จัดการ Newsletter
                    </h1>
                    <p className="text-slate-500 mt-1 font-medium">
                        รายชื่อผู้ติดตามข่าวสารทั้งหมด <span className="bg-violet-50 text-violet-600 px-2 py-0.5 rounded-md font-bold ml-1">{total} คน</span>
                    </p>
                </div>
            </div>
            
            <div className="flex gap-3">
                <button 
                  onClick={() => fetchData()} 
                  className="p-3 bg-white text-slate-500 hover:text-violet-600 hover:bg-violet-50 rounded-xl shadow-sm transition-all border border-slate-100"
                  title="Refresh Data"
                >
                  <RefreshCcw size={20} className={loading ? "animate-spin" : ""} />
                </button>

                <button 
                  onClick={handleExportCSV} 
                  className="flex items-center gap-2 px-5 py-3 bg-green-600 hover:bg-green-700 text-white font-bold rounded-xl shadow-lg shadow-green-500/20 transition-all hover:-translate-y-1"
                >
                  <Download size={20} />
                  <span className="hidden sm:inline">Export All CSV</span>
                </button>
            </div>
          </div>

          {/* Search Bar & Sort Button */}
          <div className="flex flex-col md:flex-row gap-4 mb-8">
            <div className="bg-white/70 backdrop-blur-xl p-4 rounded-2xl shadow-sm border border-white/50 flex-1">
                <form onSubmit={handleSearch} className="relative w-full">
                    <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <Search size={20} className="text-slate-400" />
                    </div>
                    <input 
                        type="text" 
                        placeholder="ค้นหาอีเมล..." 
                        className="pl-11 pr-4 py-3 w-full bg-white/50 border border-white rounded-xl focus:bg-white focus:border-violet-300 focus:ring-4 focus:ring-violet-100 transition-all text-slate-800 placeholder-slate-400 font-medium outline-none shadow-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </form>
            </div>

            <button 
                onClick={toggleSort}
                className="flex items-center justify-center gap-2 px-6 py-4 bg-white/80 backdrop-blur-xl text-slate-600 font-bold rounded-2xl shadow-sm border border-white/60 hover:bg-white hover:text-violet-600 transition-all min-w-[200px]"
            >
                <ArrowUpDown size={18} />
                <span>
                    {sortOrder === "asc" ? "เรียง: เก่าสุดก่อน" : "เรียง: ใหม่สุดก่อน"}
                </span>
            </button>
          </div>

          {/* Table Section */}
          <div className="bg-white/80 backdrop-blur-xl rounded-4xl shadow-sm overflow-hidden border border-white/60">
            <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                <thead className="bg-slate-50/50 text-slate-500 uppercase text-xs font-bold tracking-wider border-b border-slate-100">
                    <tr>
                    <th className="p-5 pl-8 text-center w-16">#</th>
                    <th className="p-5">อีเมล (Email)</th>
                    <th className="p-5">วันที่สมัคร</th>
                    <th className="p-5 pr-8 text-right">จัดการ</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-50 text-sm">
                    {loading ? (
                        <tr><td colSpan={4} className="p-10 text-center text-slate-400">กำลังโหลดข้อมูล...</td></tr>
                    ) : items.length === 0 ? (
                        <tr><td colSpan={4} className="p-10 text-center text-slate-400">ไม่พบรายชื่อผู้ติดตาม</td></tr>
                    ) : (
                    items.map((item, index) => (
                        <tr key={item.id} className="hover:bg-violet-50/30 transition-colors group">
                        <td className="p-5 pl-8 text-center text-slate-400">
                            {(page - 1) * pageSize + index + 1}
                        </td>
                        <td className="p-5 font-bold text-slate-700 group-hover:text-violet-600 transition-colors">
                             <div className="flex items-center gap-3">
                                <div className="p-2 bg-slate-100 rounded-full"><Users size={16}/></div>
                                {item.email}
                             </div>
                        </td>
                        <td className="p-5 text-slate-500 font-mono text-xs">
                             <div className="flex items-center gap-2">
                                <Calendar size={14}/>
                                {new Date(item.createdAt).toLocaleDateString("th-TH", {
                                    year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                                })}
                             </div>
                        </td>
                        <td className="p-5 pr-8 text-right">
                            <button
                            onClick={() => setDeleteId(item.id)}
                            className="p-2 bg-white border border-slate-200 hover:border-red-200 hover:bg-red-50 hover:text-red-600 text-slate-400 rounded-lg shadow-sm transition-all"
                            title="ลบรายชื่อ"
                            >
                            <Trash2 size={18} />
                            </button>
                        </td>
                        </tr>
                    ))
                    )}
                </tbody>
                </table>
            </div>

            {/* Pagination */}
            {total > pageSize && (
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50/50 border-t border-slate-100">
                    <span className="text-sm text-slate-500">
                        หน้า {page} จาก {totalPages}
                    </span>
                    <div className="flex gap-2">
                        <button
                            disabled={page === 1}
                            onClick={() => fetchData(page - 1)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-slate-600"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            disabled={page === totalPages}
                            onClick={() => fetchData(page + 1)}
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm text-slate-600"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>
            )}
          </div>

          {/* Delete Modal */}
          {deleteId && (
            <ModalDelete
              message="คุณแน่ใจหรือไม่ที่จะลบรายชื่อนี้? การลบนี้ไม่สามารถกู้คืนได้"
              onClose={() => setDeleteId(null)}
              onConfirm={handleDelete}
            />
          )}

        </div>
      </div>
    </Layouts>
  );
}