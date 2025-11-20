import React, { useState } from 'react';
import { useRouter } from 'next/router';
import { 
  Search, Mail, Trash2, Star, Reply, 
  FileText, Clock, Inbox, Filter, ArrowLeft
} from 'lucide-react';

const mockMessages = [
  {
    id: 1,
    sender: "คุณสมชาย ขายดี",
    email: "somchai@example.com",
    phone: "081-234-5678",
    subject: "สนใจจ้างทำเว็บ E-commerce",
    preview: "อยากสอบถามราคาทำเว็บขายของออนไลน์ครับ มีระบบตะกร้าสินค้า...",
    content: "สวัสดีครับ \n\nผมสนใจอยากทำเว็บไซต์ E-commerce...",
    date: "10:30 น.",
    isRead: false,
    isStarred: true,
    tag: "Project"
  },
  {
    id: 2,
    name: "บริษัท เอบีซี จำกัด",
    sender: "HR Department",
    email: "hr@abc.co.th",
    phone: "02-111-2222",
    subject: "เสนอความร่วมมือทางธุรกิจ (MOU)",
    preview: "ทางบริษัทสนใจรับนักศึกษาฝึกงานจาก Me Prompt ครับ...",
    content: "เรียน ผู้บริหาร Me Prompt Technology...",
    date: "09:15 น.",
    isRead: false,
    isStarred: false,
    tag: "Partner"
  },
  {
    id: 3,
    sender: "น้องแนน",
    email: "nan@student.com",
    phone: "-",
    subject: "สอบถามเรื่องฝึกงาน",
    preview: "ปีนี้รับสมัครช่วงเดือนไหนคะ?",
    content: "สวัสดีค่ะ พี่ๆ HR...",
    date: "เมื่อวาน",
    isRead: true,
    isStarred: false,
    tag: "Intern"
  },
  {
    id: 4,
    sender: "System Admin",
    email: "noreply@meprompt.com",
    phone: "-",
    subject: "แจ้งเตือน: Server Maintenance",
    preview: "ระบบจะปิดปรับปรุงในวันเสาร์ที่...",
    content: "แจ้งพนักงานทุกท่าน...",
    date: "2 วันที่แล้ว",
    isRead: true,
    isStarred: false,
    tag: "System"
  },
];

export default function Menu_Message_Section() {
  const [messages, setMessages] = useState(mockMessages);
  const [selectedId, setSelectedId] = useState<number | null>(null);
  const [filterType, setFilterType] = useState<'all' | 'unread' | 'starred'>('all');
  const [searchTerm, setSearchTerm] = useState("");

  const selectedMessage = messages.find(m => m.id === selectedId);

  const filteredMessages = messages.filter(msg => {
    const matchSearch = msg.sender.toLowerCase().includes(searchTerm.toLowerCase()) || 
                        msg.subject.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!matchSearch) return false;
    if (filterType === 'unread') return !msg.isRead;
    if (filterType === 'starred') return msg.isStarred;
    return true;
  });

  const handleSelectMessage = (id: number) => {
    setSelectedId(id);
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isRead: true } : m));
  };

  const handleDelete = (id: number) => {
    if(confirm("ยืนยันการลบข้อความนี้?")) {
      setMessages(prev => prev.filter(m => m.id !== id));
      if (selectedId === id) setSelectedId(null);
    }
  };

  const toggleStar = (id: number, e: React.MouseEvent) => {
    e.stopPropagation();
    setMessages(prev => prev.map(m => m.id === id ? { ...m, isStarred: !m.isStarred } : m));
  };

  return (
    <div className="h-[calc(100vh-100px)] flex flex-col bg-gray-50 py-6 px-4 md:px-8">
      
      {/* === Header & Tools (ซ่อนในมือถือเมื่อเปิดอ่านข้อความ) === */}
      <div className={`flex-col md:flex-row justify-between items-center gap-4 mb-6 ${selectedId ? 'hidden md:flex' : 'flex'}`}>
        <div>
            <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
                <Inbox className="text-blue-600"/> ข้อความติดต่อ
            </h1>
            <p className="text-gray-500 text-sm">จัดการข้อความสอบถามจากหน้าเว็บไซต์</p>
        </div>

        <div className="flex gap-2 w-full md:w-auto flex-col md:flex-row">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text" 
                    placeholder="ค้นหา..." 
                    className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 text-black"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>
            <div className="flex bg-white rounded-xl border border-gray-200 p-1 w-full md:w-auto">
                <button 
                    onClick={() => setFilterType('all')}
                    className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === 'all' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    ทั้งหมด
                </button>
                <button 
                    onClick={() => setFilterType('unread')}
                    className={`flex-1 md:flex-none px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterType === 'unread' ? 'bg-blue-100 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}
                >
                    ยังไม่อ่าน
                </button>
            </div>
        </div>
      </div>

      {/* === Main Content === */}
      <div className="flex flex-1 bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden h-full relative">
         
         {/* --- Left Column: Message List --- */}
         {/* ซ่อน List ในมือถือ ถ้ามีการเลือกข้อความแล้ว */}
         <div className={`w-full md:w-1/3 lg:w-[400px] border-r border-gray-100 flex flex-col ${selectedId ? 'hidden md:flex' : 'flex'}`}>
            <div className="p-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center">
                <span className="text-sm font-semibold text-gray-600">กล่องข้อความ ({filteredMessages.length})</span>
                <button className="text-gray-400 hover:text-gray-600"><Filter size={16}/></button>
            </div>
            
            <div className="flex-1 overflow-y-auto">
                {filteredMessages.length === 0 ? (
                    <div className="p-8 text-center text-gray-400">
                        <p>ไม่พบข้อความ</p>
                    </div>
                ) : (
                    filteredMessages.map((msg) => (
                        <div 
                            key={msg.id} 
                            onClick={() => handleSelectMessage(msg.id)}
                            className={`p-4 border-b border-gray-50 cursor-pointer transition-all hover:bg-blue-50 group relative
                                ${selectedId === msg.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : 'border-l-4 border-l-transparent'}
                                ${!msg.isRead ? 'bg-white' : 'bg-gray-50/50'}
                            `}
                        >
                            <div className="flex justify-between items-start mb-1">
                                <h4 className={`text-sm truncate pr-2 ${!msg.isRead ? 'font-bold text-gray-900' : 'font-medium text-gray-700'}`}>
                                    {msg.sender}
                                </h4>
                                <span className={`text-[10px] whitespace-nowrap ${!msg.isRead ? 'text-blue-600 font-bold' : 'text-gray-400'}`}>
                                    {msg.date}
                                </span>
                            </div>
                            <p className={`text-sm mb-1 truncate ${!msg.isRead ? 'text-gray-800 font-semibold' : 'text-gray-600'}`}>
                                {msg.subject}
                            </p>
                            <p className="text-xs text-gray-400 line-clamp-1">
                                {msg.preview}
                            </p>
                            
                            <button 
                                onClick={(e) => toggleStar(msg.id, e)}
                                className={`absolute bottom-4 right-4 transition-colors ${msg.isStarred ? 'text-yellow-400' : 'text-gray-300 hover:text-yellow-400'}`}
                            >
                                <Star size={16} fill={msg.isStarred ? "currentColor" : "none"} />
                            </button>
                            {!msg.isRead && <div className="absolute top-5 left-2 w-2 h-2 bg-blue-600 rounded-full"></div>}
                        </div>
                    ))
                )}
            </div>
         </div>

         {/* --- Right Column: Message Detail --- */}
         {/* แสดง Detail ในมือถือเฉพาะตอนมี selectedId */}
         <div className={`w-full md:flex-1 flex flex-col absolute inset-0 md:static bg-white z-10 transition-transform duration-300 ${selectedId ? 'translate-x-0' : 'translate-x-full md:translate-x-0'} ${!selectedId && 'hidden md:flex'}`}>
            {selectedMessage ? (
                <>
                    {/* Toolbar */}
                    <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                        <div className="flex gap-2 items-center">
                            {/* ✅ ปุ่มย้อนกลับ (Back) สำหรับมือถือ */}
                            <button 
                                onClick={() => setSelectedId(null)} 
                                className="md:hidden p-2 hover:bg-gray-100 rounded-full text-gray-600 mr-2"
                            >
                                <ArrowLeft size={20} />
                            </button>

                            <button className="p-2 hover:bg-gray-100 rounded-lg text-gray-500" title="Reply">
                                <Reply size={18}/>
                            </button>
                            <button onClick={() => handleDelete(selectedMessage.id)} className="p-2 hover:bg-red-50 text-gray-500 hover:text-red-600 rounded-lg" title="Delete">
                                <Trash2 size={18}/>
                            </button>
                        </div>
                        <div className="flex gap-2">
                            <span className="px-3 py-1 bg-gray-100 text-gray-600 text-xs rounded-full font-medium">
                                Tag: {selectedMessage.tag}
                            </span>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-white">
                        <div className="flex justify-between items-start mb-6">
                             <div>
                                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-2">{selectedMessage.subject}</h2>
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold text-lg shrink-0">
                                        {selectedMessage.sender.charAt(0)}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-gray-900">{selectedMessage.sender}</p>
                                        <p className="text-xs text-gray-500">{selectedMessage.email} • {selectedMessage.phone}</p>
                                    </div>
                                </div>
                             </div>
                             <div className="text-right text-xs text-gray-400 shrink-0 ml-2">
                                {selectedMessage.date}
                             </div>
                        </div>

                        <div className="prose max-w-none text-gray-700 text-sm leading-relaxed whitespace-pre-line border-t border-gray-100 pt-6">
                            {selectedMessage.content}
                        </div>
                        
                        {/* Attachments */}
                        <div className="mt-8 pt-6 border-t border-gray-100">
                            <h4 className="text-xs font-bold text-gray-400 uppercase mb-3">Attachments</h4>
                            <div className="flex gap-3">
                                <div className="flex items-center gap-2 p-3 border border-gray-200 rounded-lg bg-gray-50 hover:bg-blue-50 cursor-pointer transition-colors">
                                    <FileText size={20} className="text-blue-500"/>
                                    <span className="text-xs font-medium text-gray-600">company_profile.pdf</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Footer Reply Box */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50 sticky bottom-0">
                        <button className="w-full py-3 border border-gray-300 rounded-lg text-gray-500 text-sm text-left px-4 hover:border-blue-400 hover:bg-white transition-all flex items-center gap-2">
                            <Reply size={16}/> คลิกเพื่อตอบกลับ {selectedMessage.sender}...
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex-1 flex flex-col items-center justify-center text-gray-300 bg-gray-50/30">
                    <Mail size={64} className="mb-4 opacity-20"/>
                    <p className="text-lg font-medium text-gray-400">เลือกข้อความเพื่ออ่านรายละเอียด</p>
                </div>
            )}
         </div>

      </div>
    </div>
  );
}