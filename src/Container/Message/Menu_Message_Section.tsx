import React, { useState, useEffect, useCallback } from "react";
import {
  Search,
  Mail,
  Trash2,
  Star,
  Reply,
  FileText,
  Inbox,
  Filter,
  ArrowLeft,
  Loader2,
  X,
  Calendar,
  RefreshCcw,
} from "lucide-react";

// --- Type Definitions ---
interface HandledBy {
  name: string;
}

interface ContactMessage {
  id: number;
  name: string;
  email: string;
  subject: string;
  content?: string;
  message?: string;
  status: string;
  createdAt: string;
  handledBy: HandledBy | null;
}

interface MetaData {
  total: number;
  page: number;
  totalPages: number;
}

// Helper format date
const formatDate = (dateString: string) => {
  if (!dateString) return "";
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat("th-TH", {
      hour: "2-digit",
      minute: "2-digit",
      day: "numeric",
      month: "short",
    }).format(date);
  } catch (e) {
    return dateString;
  }
};

export default function Menu_Message_Section() {
  // === State Management ===
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [meta, setMeta] = useState<MetaData>({
    total: 0,
    page: 1,
    totalPages: 1,
  });
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Filter & Search State
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [filterDate, setFilterDate] = useState<string>("");
  const [debouncedSearch, setDebouncedSearch] = useState<string>("");

  // Selection State
  const [selectedId, setSelectedId] = useState<number | null>(null);

  const selectedMessage = messages.find((m) => m.id === selectedId);
  const [refreshing, setRefreshing] = useState(false);

  // === Debounce Search Input ===
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // === Fetch Data from API ===
  const fetchMessages = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // สร้าง Query Parameters
      const params = new URLSearchParams();
      params.append("page", "1"); // TODO: เพิ่ม Logic Pagination ในอนาคตถ้าต้องการเปลี่ยนหน้า
      params.append("limit", "20");

      if (statusFilter) params.append("status", statusFilter);
      if (debouncedSearch) params.append("search", debouncedSearch);
      if (filterDate) params.append("date", filterDate);

      const apiUrl = `/api/contact/contacts?${params.toString()}`;

      const res = await fetch(apiUrl);

      if (!res.ok) {
        throw new Error(
          `Failed to fetch: ${res.statusText} (Status: ${res.status})`
        );
      }

      const data = await res.json();

      // Assumed response structure: { data: [...], meta: {...} }
      setMessages((data.data as ContactMessage[]) || []);
      setMeta((data.meta as MetaData) || { total: 0, page: 1, totalPages: 1 });
    } catch (err) {
      console.error("API Error:", err);
      setError("ไม่สามารถโหลดข้อมูลได้ กรุณาลองใหม่อีกครั้ง");
      setMessages([]); // Clear old data on error
    } finally {
      setLoading(false);
    }
  }, [statusFilter, debouncedSearch, filterDate]);

  // เรียก API เมื่อ Filter หรือ Search เปลี่ยน
  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // === Handlers ===
  const handleSelectMessage = async (id: number) => {
    setSelectedId(id);

    const msg = messages.find((m) => m.id === id);
    if (!msg) return;

    // ถ้าไม่ใช่ new ไม่ต้องอัปเดต
    if (msg.status !== "new") return;

    try {
      await fetch(`/api/contact/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: "in-progress" }),
      });

      // อัปเดตใน state ทันทีแบบ optimistic
      setMessages((prev) =>
        prev.map((m) => (m.id === id ? { ...m, status: "in-progress" } : m))
      );
    } catch (err) {
      console.error("Failed to update status", err);
    }
  };

  const deleteMessage = async (id: number) => {
    if (!confirm("ต้องการลบข้อความนี้ใช่ไหม?")) return;

    try {
      await fetch(`/api/contact/${id}`, {
        method: "DELETE",
      });

      // ลบออกจาก state
      setMessages((prev) => prev.filter((m) => m.id !== id));

      // ถ้าข้อความที่ถูกลบคืออันที่กำลังเปิดอยู่ → รีเซ็ต
      if (selectedId === id) {
        setSelectedId(null);
      }
    } catch (err) {
      console.error("Delete failed:", err);
      alert("ลบไม่สำเร็จ");
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchMessages();
    setRefreshing(false);
  };

  const clearDateFilter = () => {
    setFilterDate("");
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-gray-50 py-6 px-4 md:px-8">
      {/* === Header & Tools === */}
      <div
        className={`flex-col md:flex-row justify-between items-center gap-4 mb-6 ${
          selectedId ? "hidden md:flex" : "flex"
        }`}
      >
        <div>
          <h1 className="text-3xl font-bold bg-linear-to-r from-blue-600 via-violet-700 to-red-400 bg-clip-text text-transparent flex items-center gap-2">
            <Inbox className="text-blue-600" /> ข้อความติดต่อ
          </h1>
          <p className="text-gray-500 text-sm">
            จัดการข้อความสอบถามจากหน้าเว็บไซต์
          </p>
        </div>

        <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row items-center">
          {/* Search Input */}
          <div className="relative flex-1 md:w-64 w-full">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล..."
              className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black bg-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Date Filter */}
          <div className="relative w-full md:w-auto">
            <div className="relative">
              <input
                type="date"
                value={filterDate}
                onChange={(e) => setFilterDate(e.target.value)}
                className="w-full md:w-40 pl-3 pr-8 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-600 text-sm bg-white cursor-pointer"
              />
              {filterDate && (
                <button
                  onClick={clearDateFilter}
                  className="absolute right-8 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500"
                >
                  <X size={14} />
                </button>
              )}
              <Calendar
                className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
                size={16}
              />
            </div>
          </div>

          {/* Status Filter Buttons */}
          <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-full md:w-auto shrink-0">
            <button
              onClick={() => setStatusFilter("")}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === ""
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              ทั้งหมด
            </button>
            <button
              onClick={() => setStatusFilter("new")}
              className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                statusFilter === "new"
                  ? "bg-blue-100 text-blue-700"
                  : "text-gray-500 hover:bg-gray-50"
              }`}
            >
              ใหม่
            </button>
          </div>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="flex flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full relative">
        {/* --- Left Column: Message List --- */}
        <div
          className={`w-full md:w-1/3 lg:w-[400px] border-r border-gray-100 flex flex-col ${
            selectedId ? "hidden md:flex" : "flex"
          }`}
        >
          <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
            <span className="text-sm font-semibold text-gray-600">
              {loading ? "กำลังโหลด..." : `รายการ (${meta.total})`}
            </span>
            <button
              onClick={handleRefresh}
              className={`text-gray-400 hover:text-blue-600 transition-colors ${
                refreshing ? "animate-spin" : ""
              }`}
              title="Reload"
            >
              <RefreshCcw size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto relative">
            {/* Loading State */}
            {loading && (
              <div className="absolute inset-0 bg-white/80 flex items-center justify-center z-10">
                <Loader2 className="animate-spin text-blue-500" />
              </div>
            )}

            {/* Empty / Error State */}
            {!loading && messages.length === 0 && (
              <div className="p-8 text-center text-gray-400 flex flex-col items-center">
                <Inbox size={48} className="mb-2 opacity-20" />
                <p className="mb-1">{error ? error : "ไม่พบข้อมูล"}</p>
                {filterDate && (
                  <p className="text-xs text-gray-300">
                    ลองเปลี่ยนวันที่ค้นหา หรือล้างตัวกรอง
                  </p>
                )}
              </div>
            )}

            {/* Message Loop */}
            {messages.map((msg) => (
              <div
                key={msg.id}
                onClick={() => handleSelectMessage(msg.id)}
                className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group relative
                            ${
                              selectedId === msg.id
                                ? "bg-blue-50 border-l-4 border-l-blue-500"
                                : "border-l-4 border-l-transparent"
                            }
                            ${
                              msg.status === "new"
                                ? "bg-white"
                                : "bg-gray-50/50"
                            }
                        `}
              >
                <div className="flex justify-between items-start mb-1">
                  <h4
                    className={`text-sm truncate pr-2 ${
                      msg.status === "new"
                        ? "font-bold text-gray-900"
                        : "font-medium text-gray-700"
                    }`}
                  >
                    {msg.name || msg.email}
                  </h4>
                  <span
                    className={`text-[10px] whitespace-nowrap ${
                      msg.status === "new"
                        ? "text-blue-600 font-bold"
                        : "text-gray-400"
                    }`}
                  >
                    {formatDate(msg.createdAt)}
                  </span>
                </div>
                <p
                  className={`text-sm mb-1 truncate ${
                    msg.status === "new"
                      ? "text-gray-800 font-semibold"
                      : "text-gray-600"
                  }`}
                >
                  {msg.subject}
                </p>
                <p className="text-xs text-gray-400 line-clamp-1">
                  {msg.message || msg.content}
                </p>

                {msg.status === "new" && (
                  <div className="absolute top-5 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* --- Right Column: Message Detail --- */}
        <div
          className={`w-full md:flex-1 flex flex-col absolute inset-0 md:static bg-white z-10 transition-transform duration-300 ${
            selectedId ? "translate-x-0" : "translate-x-full md:translate-x-0"
          } ${!selectedId && "hidden md:flex"}`}
        >
          {selectedMessage ? (
            <>
              {/* Toolbar */}
              <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                <div className="flex gap-2 items-center">
                  <button
                    onClick={() => setSelectedId(null)}
                    className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600 mr-2"
                  >
                    <ArrowLeft size={20} />
                  </button>

                  <button
                    className="p-2 hover:bg-gray-100 rounded-lg text-gray-500"
                    title="Reply"
                  >
                    <Reply size={18} />
                  </button>
                  <button
                    onClick={() => deleteMessage(selectedMessage.id)}
                    className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg"
                    title="Delete"
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
                <div className="flex gap-2">
                  {selectedMessage.handledBy && (
                    <span className="px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full font-medium">
                      ผู้ดูแล: {selectedMessage.handledBy.name}
                    </span>
                  )}
                  <span
                    className={`px-3 py-1 text-xs rounded-full font-medium ${
                      selectedMessage.status === "new"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-gray-100 text-gray-600"
                    }`}
                  >
                    Status: {selectedMessage.status}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">
                      {selectedMessage.subject}
                    </h2>
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0 uppercase">
                        {(
                          selectedMessage.name ||
                          selectedMessage.email ||
                          "?"
                        ).charAt(0)}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-gray-900">
                          {selectedMessage.name}
                        </p>
                        <p className="text-xs text-gray-500">
                          {selectedMessage.email}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="text-right text-xs text-gray-400 shrink-0 ml-2">
                    {formatDate(selectedMessage.createdAt)}
                  </div>
                </div>

                <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line border-t border-gray-100 pt-6">
                  {selectedMessage.message || selectedMessage.content}
                </div>
              </div>

              {/* Footer Reply Box */}
              <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-500 text-sm text-left px-4 hover:border-blue-400 hover:bg-white transition-all flex items-center gap-2">
                  <Reply size={16} /> ตอบกลับ{" "}
                  {selectedMessage.name || "ผู้ติดต่อ"}...
                </button>
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30">
              <Mail size={64} className="mb-4 opacity-20" />
              <p className="text-lg font-medium text-gray-400">
                เลือกข้อความเพื่ออ่านรายละเอียด
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
