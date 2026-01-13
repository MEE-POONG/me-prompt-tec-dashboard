import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Mail,
  Trash2,
  Reply,
  FileText,
  Inbox,
  Loader2,
  X,
  Calendar,
  RefreshCcw,
  Phone,
  Briefcase,
  MessageSquare,
  ArrowLeft,
  Star
} from "lucide-react";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

// --- Type Definitions ---
interface HandledBy { name: string; }
interface ContactMessage {
  id: number; name: string; email: string; phone?: string; subject: string;
  content?: string; message?: string; status: string; source?: string;
  resumeUrl?: string; portfolioUrl?: string; createdAt: string; handledBy: HandledBy | null;
  isStarred?: boolean;
}
interface MetaData { total: number; page: number; totalPages: number; }

const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit", minute: "2-digit", day: "numeric", month: "short",
    }).format(date);
  } catch (e) { return dateString; }
};

export default function Menu_Message_Section() {
  // --- State ---
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [meta, setMeta] = useState<MetaData>({ total: 0, page: 1, totalPages: 1 });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  // Modals
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [showErrorModal, setShowErrorModal] = useState(false);
  const [deleteId, setDeleteId] = useState<number | null>(null);

  const selectedMessage = messages.find((m) => m.id === selectedId);

  // --- Logic ---
  useEffect(() => {
    const timer = setTimeout(() => { setDebouncedSearch(searchTerm); }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  const fetchMessages = useCallback(async () => {
    setLoading(true); setError(null);
    try {
      const params = new URLSearchParams();
      params.append("page", "1"); params.append("limit", "20");
      if (statusFilter) params.append("status", statusFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterDate) params.append("date", filterDate);

      const res = await fetch(`/api/contact/contacts?${params.toString()}`);
      if (!res.ok) throw new Error(`Failed to fetch: ${res.status}`);

      const data = await res.json();
      setMessages((data.data as ContactMessage[]) || []);
      setMeta((data.meta as MetaData) || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error("API Error:", err); setError("ไม่สามารถโหลดข้อมูลได้"); setMessages([]);
    } finally { setLoading(false); }
  }, [statusFilter, debouncedSearch, filterDate]);

  useEffect(() => { fetchMessages(); }, [fetchMessages]);

  const handleSelectMessage = async (id: number) => {
    setSelectedId(id);
    const msg = messages.find((m) => m.id === id);
    if (!msg || msg.status !== "new") return;

    try {
      await fetch(`/api/contact/${id}`, {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, status: "in-progress" } : m)));
    } catch (err) { console.error("Failed to update status", err); }
  };

  const handleToggleStar = async (id: number) => {
    const currentMsg = messages.find(m => m.id === id);
    if (!currentMsg) return;
    const newStatus = !currentMsg.isStarred;
    setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: newStatus } : m)));
    try {
      const res = await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isStarred: newStatus }),
      });
      if (!res.ok) throw new Error("Failed to update star");
    } catch (err) {
      console.error("Failed to star message", err);
      setMessages((prev) => prev.map((m) => (m.id === id ? { ...m, isStarred: !newStatus } : m)));
    }
  };

  const handleDeleteClick = (id: number) => { setDeleteId(id); setShowDeleteModal(true); };

  const handleDeleteConfirm = async () => {
    if (!deleteId) return;
    try {
      await fetch(`/api/contact/${deleteId}`, { method: "DELETE" });
      setMessages((prev) => prev.filter((m) => m.id !== deleteId));
      if (selectedId === deleteId) setSelectedId(null);
      setShowDeleteModal(false); setShowSuccessModal(true); setDeleteId(null);
    } catch (err) {
      console.error("Delete failed:", err); setShowDeleteModal(false); setShowErrorModal(true);
    }
  };

  const handleRefresh = async () => { setRefreshing(true); await fetchMessages(); setRefreshing(false); };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-[#f8f9fc] py-6 px-4 md:px-8 relative overflow-hidden font-sans text-slate-800">

      {/* --- Background Aurora --- */}
      <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
        <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
        <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
      </div>

      <div className="relative z-10 flex flex-col h-full max-w-7xl mx-auto w-full">

        {/* === Header & Tools === */}
        <div className={`flex-col md:flex-row justify-between items-center gap-4 mb-6 ${selectedId ? "hidden md:flex" : "flex"}`}>
          <div>
            <h1 className="text-3xl font-black tracking-tight bg-linear-to-r from-violet-700 via-fuchsia-600 to-violet-700 bg-clip-text text-transparent flex items-center gap-2">
              <MessageSquare className="text-violet-600" /> ข้อความติดต่อ
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">จัดการข้อความสอบถามจากหน้าเว็บไซต์</p>
          </div>

          <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row items-center bg-white/60 backdrop-blur-md p-2 rounded-2xl border border-white/50 shadow-sm">
            <div className="relative flex-1 md:w-56 w-full">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
              <input
                type="text" placeholder="ค้นหา..."
                className="w-full pl-9 pr-4 py-2 rounded-xl bg-white/80 border border-white focus:outline-none focus:ring-2 focus:ring-violet-200 text-sm"
                value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="relative w-full md:w-auto">
              <input
                type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)}
                className="w-full md:w-36 pl-3 pr-8 py-2 rounded-xl bg-white/80 border border-white focus:outline-none focus:ring-2 focus:ring-violet-200 text-slate-600 text-sm cursor-pointer"
              />
              {filterDate && <button onClick={() => setFilterDate("")} className="absolute right-8 top-1/2 -translate-y-1/2 text-slate-400 hover:text-red-500"><X size={12} /></button>}
              <Calendar className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" size={14} />
            </div>
            <div className="flex bg-slate-100/50 rounded-xl p-1 w-full md:w-auto">
              <button onClick={() => setStatusFilter("")} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"}`}>ทั้งหมด</button>
              <button onClick={() => setStatusFilter("new")} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "new" ? "bg-white text-violet-600 shadow-sm" : "text-slate-500"}`}>ใหม่</button>
              <button onClick={() => setStatusFilter("starred")} className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${statusFilter === "starred" ? "bg-white text-yellow-500 shadow-sm" : "text-slate-500"}`}>
                <div className="flex items-center gap-1"><Star size={12} className="fill-current" /> สำคัญ</div>
              </button>
            </div>
          </div>
        </div>

        {/* === Main Content === */}
        <div className="flex flex-1 bg-white/70 backdrop-blur-xl rounded-4xl shadow-xl border border-white/60 overflow-hidden h-full relative">

          {/* --- Left Column: List --- */}
          <div className={`w-full md:w-1/3 lg:w-[380px] border-r border-slate-100 flex flex-col bg-white/40 ${selectedId ? "hidden md:flex" : "flex"}`}>
            <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/50 backdrop-blur-sm">
              <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{loading ? "กำลังโหลด..." : `INBOX (${meta.total})`}</span>
              <button onClick={handleRefresh} className={`text-slate-400 hover:text-violet-600 transition-colors p-1.5 hover:bg-white rounded-lg ${refreshing ? "animate-spin" : ""}`}><RefreshCcw size={16} /></button>
            </div>

            <div className="flex-1 overflow-y-auto custom-scrollbar relative p-2 space-y-2">
              {loading && <div className="absolute inset-0 bg-white/60 flex items-center justify-center z-10"><Loader2 className="animate-spin text-violet-500" /></div>}

              {!loading && messages.length === 0 && (
                <div className="p-10 text-center text-slate-400 flex flex-col items-center mt-10">
                  <Inbox size={48} className="mb-3 opacity-20 text-violet-400" />
                  <p className="text-sm">ไม่พบข้อความ</p>
                </div>
              )}

              {messages.map((msg) => (
                <div
                  key={msg.id}
                  onClick={() => handleSelectMessage(msg.id)}
                  // ✅✅ ปรับแต่งสีม่วงอ่อนและกรอบตรงนี้ตามที่ขอ
                  className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 group border relative pr-8
                    ${selectedId === msg.id
                      ? "bg-violet-50 border-violet-500 border-2 shadow-md scale-[1.02]"
                      : "bg-white border-slate-100 hover:border-violet-200 hover:shadow-sm"
                    }
                  `}
                >
                  <button
                    onClick={(e) => { e.stopPropagation(); handleToggleStar(msg.id); }}
                    className={`absolute top-4 right-4 z-10 p-1 rounded-full hover:bg-slate-100 transition-colors ${msg.isStarred ? "text-yellow-400" : "text-slate-300 hover:text-yellow-400"}`}
                  >
                    <Star size={16} className={msg.isStarred ? "fill-yellow-400" : ""} />
                  </button>

                  <div className="flex justify-between items-start mb-1 pr-6">
                    <h4 className={`text-sm truncate pr-2 ${msg.status === "new" ? "font-bold text-slate-800" : "font-medium text-slate-600"}`}>
                      {msg.name || msg.email}
                    </h4>
                  </div>
                  <div className="flex justify-between items-center mb-1">
                    <span className={`text-[10px] whitespace-nowrap ${msg.status === "new" ? "text-violet-600 font-bold" : "text-slate-400"}`}>
                      {formatDate(msg.createdAt)}
                    </span>
                  </div>
                  <p className={`text-sm mb-1 truncate ${msg.status === "new" ? "text-slate-900 font-semibold" : "text-slate-500"}`}>
                    {msg.subject}
                  </p>
                  <p className="text-xs text-slate-400 line-clamp-1">{msg.message || msg.content}</p>
                  {msg.status === "new" && <div className="absolute bottom-4 right-4 w-2 h-2 bg-violet-500 rounded-full ring-2 ring-white"></div>}
                </div>
              ))}
            </div>
          </div>

          {/* --- Right Column: Detail --- */}
          <div className={`w-full md:flex-1 flex flex-col bg-white/60 backdrop-blur-sm relative z-10 ${!selectedId && "hidden md:flex"}`}>
            {selectedMessage ? (
              <>
                <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-white/80 sticky top-0 z-20 backdrop-blur-md">
                  <div className="flex gap-2 items-center">
                    <button onClick={() => setSelectedId(null)} className="md:hidden p-2 hover:bg-slate-100 rounded-full text-slate-600 mr-2"><ArrowLeft size={20} /></button>

                    <button
                      onClick={() => handleToggleStar(selectedMessage.id)}
                      className={`p-2 rounded-xl transition-colors ${selectedMessage.isStarred ? "bg-yellow-50 text-yellow-500" : "hover:bg-slate-100 text-slate-400 hover:text-yellow-400"}`}
                      title="ติดดาว"
                    >
                      <Star size={18} className={selectedMessage.isStarred ? "fill-yellow-500" : ""} />
                    </button>

                    <button className="p-2 hover:bg-slate-100 text-slate-500 rounded-xl transition-colors" title="Reply"><Reply size={18} /></button>
                    <button onClick={() => handleDeleteClick(selectedMessage.id)} className="p-2 hover:bg-red-50 text-slate-400 hover:text-red-600 rounded-xl transition-colors" title="Delete"><Trash2 size={18} /></button>
                  </div>
                  <div className="flex items-center gap-2">
                    {selectedMessage.handledBy && <span className="px-3 py-1 bg-green-50 text-green-600 text-[10px] font-bold rounded-full border border-green-100">ดูแลโดย: {selectedMessage.handledBy.name}</span>}
                    <span className={`px-3 py-1 text-[10px] font-bold rounded-full border ${selectedMessage.status === "new" ? "bg-blue-50 text-blue-600 border-blue-100" : "bg-slate-100 text-slate-500 border-slate-200"}`}>
                      {selectedMessage.status.toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="flex-1 p-8 overflow-y-auto custom-scrollbar">
                  <div className="flex justify-between items-start mb-8">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-linear-to-br from-violet-500 to-fuchsia-500 flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-violet-500/30">
                        {(selectedMessage.name || selectedMessage.email || "?").charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-slate-800">{selectedMessage.name}</h2>
                        <p className="text-xs text-slate-500 font-medium">{selectedMessage.email}</p>
                        {selectedMessage.phone && <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5"><Phone size={10} /> {selectedMessage.phone}</p>}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xs font-bold text-slate-400 mb-1">RECEIVED</p>
                      <p className="text-xs text-slate-600">{formatDate(selectedMessage.createdAt)}</p>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-4xl shadow-sm border border-slate-100 mb-6 relative group">
                    <div className="absolute top-6 right-6 opacity-10 group-hover:opacity-20 transition-opacity"><MessageSquare size={48} /></div>
                    <h3 className="text-lg font-bold text-slate-800 mb-4 pb-4 border-b border-slate-50">{selectedMessage.subject}</h3>
                    <div className="prose max-w-none text-slate-600 text-sm leading-loose whitespace-pre-line">
                      {selectedMessage.message || selectedMessage.content}
                    </div>
                  </div>

                  {(selectedMessage.resumeUrl || selectedMessage.portfolioUrl) && (
                    <div className="flex gap-4 mt-6">
                      {selectedMessage.resumeUrl && (
                        <a href={selectedMessage.resumeUrl.startsWith('http') ? selectedMessage.resumeUrl : `${process.env.NEXT_PUBLIC_FILE_BASE_URL || ''}${selectedMessage.resumeUrl}`} download target="_blank"
                          className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-violet-300 hover:shadow-md transition-all group w-full sm:w-auto">
                          <div className="p-2 bg-violet-50 text-violet-600 rounded-lg group-hover:bg-violet-600 group-hover:text-white transition-colors"><FileText size={20} /></div>
                          <div className="text-left"><p className="text-xs text-slate-400 font-bold">ATTACHMENT</p><p className="text-sm font-bold text-slate-700">Resume File</p></div>
                        </a>
                      )}
                      {selectedMessage.portfolioUrl && (
                        <a href={selectedMessage.portfolioUrl.startsWith('http') ? selectedMessage.portfolioUrl : `${process.env.NEXT_PUBLIC_FILE_BASE_URL || ''}${selectedMessage.portfolioUrl}`} target="_blank" rel="noopener noreferrer"
                          className="flex items-center gap-3 px-4 py-3 bg-white border border-slate-200 rounded-xl hover:border-pink-300 hover:shadow-md transition-all group w-full sm:w-auto">
                          <div className="p-2 bg-pink-50 text-pink-600 rounded-lg group-hover:bg-pink-600 group-hover:text-white transition-colors"><Briefcase size={20} /></div>
                          <div className="text-left"><p className="text-xs text-slate-400 font-bold">LINK</p><p className="text-sm font-bold text-slate-700">Portfolio</p></div>
                        </a>
                      )}
                    </div>
                  )}

                  {/* ❌ เอา Note ออกแล้วตามคำขอ */}
                </div>

                <div className="p-4 border-t border-slate-100 bg-white/80 backdrop-blur-md sticky bottom-0">
                  <div className="relative">
                    <input type="text" placeholder={`ตอบกลับถึง ${selectedMessage.name}...`} className="w-full pl-10 pr-4 py-3 rounded-xl bg-slate-50 border border-slate-200 focus:outline-none focus:ring-2 focus:ring-violet-200 focus:bg-white transition-all text-sm" />
                    <Reply className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                  </div>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-300">
                <div className="p-8 bg-white rounded-full shadow-sm mb-4"><Mail size={48} className="text-violet-200" /></div>
                <p className="text-lg font-bold text-slate-400">เลือกข้อความเพื่ออ่านรายละเอียด</p>
              </div>
            )}
          </div>
        </div>

        {showDeleteModal && <ModalDelete open={showDeleteModal} message="ต้องการลบข้อความนี้ใช่ไหม?" onClose={() => setShowDeleteModal(false)} onConfirm={handleDeleteConfirm} />}
        <ModalSuccess open={showSuccessModal} message="ลบข้อความสำเร็จ!" description="ลบข้อความเรียบร้อยแล้ว" onClose={() => setShowSuccessModal(false)} />
        <ModalError open={showErrorModal} message="เกิดข้อผิดพลาด!" description="ลบข้อความไม่สำเร็จ" onClose={() => setShowErrorModal(false)} />
      </div>
    </div>
  );
}