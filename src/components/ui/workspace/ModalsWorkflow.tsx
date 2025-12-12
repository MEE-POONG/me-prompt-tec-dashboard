import React, { useState } from "react";
import {
  X,
  AlignLeft,
  CheckCircle2,
  Users,
  User,
  CheckSquare,
  Tag,
  Calendar,
  Paperclip,
  Plus,
  Clock,
  FileText,
  MoveRight,
  MessageSquare,
} from "lucide-react";

interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  type: "topci" | "comment" | "upload" | "move";
}

interface CommentItem {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
}

interface ModalWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  task?: {
    id: string;
    title: string;
    description?: string;
    tag?: string;
    startDate?: Date;
    endDate?: Date;
  };
}

interface CardContentBlock {
  id: string;
  type: "checklist" | "tags" | "date" | "attachment";
}

export default function ModalsWorkflow({
  isOpen,
  onClose,
  task,
}: ModalWorkflowProps) {
  const [title, setTitle] = useState(task?.title || "ชื่อหัวข้อ");
  const [description, setDescription] = useState(task?.description || "");
  const [activeTab, setActiveTab] = useState<"comment" | "activity">("comment");
  const [newComment, setNewComment] = useState("");
  const [isAccepted, setIsAccepted] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<CardContentBlock[]>([]);

  // Mock Data for Activities
  const [activities] = useState<ActivityItem[]>([
    {
      id: "1",
      user: "Admin",
      action: "เปลี่ยนสถานะการ์ดเป็น",
      target: "In Progress",
      type: "move",
      timestamp: new Date(Date.now() - 1000 * 60 * 30), // 30 mins ago
    },
    {
      id: "2",
      user: "Poom",
      action: "แก้ไขรายละเอียดงาน",
      type: "topci",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
    },
    {
      id: "3",
      user: "Admin",
      action: "แนบไฟล์",
      target: "design-v2.fig",
      type: "upload",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
    },
    {
      id: "4",
      user: "Admin",
      action: "สร้างการ์ดนี้",
      type: "topci",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48), // 2 days ago
    },
  ]);

  // Mock Data for Comments
  const [comments] = useState<CommentItem[]>([
    {
      id: "1",
      user: "Poom",
      text: "ฝากตรวจสอบไฟล์แนบด้วยนะครับ",
      timestamp: new Date(Date.now() - 1000 * 60 * 60 * 5),
    },
  ]);

  const addContentBlock = (type: CardContentBlock["type"]) => {
    setContentBlocks([...contentBlocks, { id: Date.now().toString(), type }]);
  };

  const removeContentBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter((b) => b.id !== id));
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl w-full max-w-5xl h-auto max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
        {/* === Header === */}
        <div className="bg-linear-to-r from-blue-600 to-indigo-600 text-white px-8 py-5 flex items-center justify-between shrink-0 shadow-md z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsAccepted(!isAccepted)}
              className={`
                    text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-sm
                    hover:shadow-md active:scale-95
                    ${
                      isAccepted
                        ? "bg-green-500 hover:bg-green-400 text-white"
                        : "bg-yellow-400 hover:bg-yellow-300 text-blue-900 hover:-translate-y-0.5"
                    }
                `}
            >
              {isAccepted ? "รับงานแล้ว" : "รับงาน"}
              <CheckCircle2
                size={16}
                strokeWidth={3}
                className={isAccepted ? "scale-110" : ""}
              />
            </button>
          </div>
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2 cursor-pointer hover:bg-white/10 px-3 py-1.5 rounded-full transition-colors">
              <Users size={18} className="opacity-90" />
              <span className="text-sm font-semibold opacity-90">Members</span>
            </div>
            <button
              onClick={onClose}
              className="hover:bg-white/20 p-2 rounded-full transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* === Content Body === */}
        <div className="flex-1 overflow-y-auto p-8 lg:p-12 bg-white">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-12">
            {/* --- Left Column (Main) --- */}
            <div className="lg:col-span-3 space-y-10">
              {/* Title Section */}
              {/* Title Section */}
              <div className="group relative">
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full text-3xl font-black text-gray-800 placeholder-gray-400 outline-none bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl px-4 py-3 -ml-4 transition-all duration-200 shadow-xs"
                  placeholder="ชื่อหัวข้อ"
                />
                <div className="absolute right-2 top-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                  <span className="text-xs text-gray-400 font-medium bg-white px-2 py-1 rounded-md shadow-sm border border-gray-100">
                    Click to edit
                  </span>
                </div>
              </div>

              {/* Description Section */}
              <div>
                <div className="flex items-center gap-3 mb-4 text-gray-800">
                  <AlignLeft
                    className="w-6 h-6 text-blue-600"
                    strokeWidth={2.5}
                  />
                  <h2 className="text-2xl font-bold">รายละเอียด</h2>
                </div>
                <div className="relative group">
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    rows={4}
                    className="w-full text-lg text-gray-700 placeholder-gray-400 outline-none bg-white border-2 border-gray-200 hover:border-blue-300 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 rounded-xl p-4 -ml-4 resize-none leading-relaxed transition-all duration-200 shadow-xs"
                    placeholder="เพิ่มรายละเอียดเพิ่มเติมเกี่ยวกับงานนี้..."
                  />
                </div>
              </div>

              {/* Dynamic Content Area */}
              <div className="space-y-4">
                {contentBlocks.length === 0 ? (
                  /* Placeholder Card Area */
                  <div className="w-full h-48 border-3 border-dashed border-gray-200 bg-gray-50/50 rounded-3xl flex flex-col items-center justify-center gap-3 text-gray-400 hover:bg-gray-50 hover:border-blue-300 hover:text-blue-500 transition-all cursor-pointer group">
                    <Plus
                      size={40}
                      className="text-gray-300 group-hover:text-blue-400 transition-colors"
                    />
                    <span className="font-semibold text-sm">
                      พื้นที่สำหรับการ์ด หรือไฟล์แนบ
                    </span>
                  </div>
                ) : (
                  contentBlocks.map((block) => (
                    <div
                      key={block.id}
                      className="relative bg-white border border-gray-200 rounded-2xl p-6 shadow-sm group hover:shadow-md transition-shadow animate-in fade-in slide-in-from-bottom-2"
                    >
                      <button
                        onClick={() => removeContentBlock(block.id)}
                        className="absolute top-4 right-4 text-gray-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                      >
                        <X size={20} />
                      </button>

                      {block.type === "checklist" && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 text-gray-800">
                            <CheckSquare className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold">To-do List</h3>
                          </div>
                          <div className="space-y-2 pl-2">
                            <div className="flex items-center gap-3">
                              <input
                                type="checkbox"
                                className="w-5 h-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                              />
                              <input
                                type="text"
                                placeholder="รายการที่ต้องทำ..."
                                className="flex-1 outline-none border-b border-transparent focus:border-gray-200 p-1"
                              />
                            </div>
                            <div className="flex items-center gap-3">
                              <Plus size={20} className="text-gray-400" />
                              <span className="text-gray-400 text-sm cursor-pointer hover:text-gray-600">
                                เพิ่มรายการ...
                              </span>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "tags" && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 text-gray-800">
                            <Tag className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold">Tags</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {["Design", "Important", "Frontend"].map((tag) => (
                              <span
                                key={tag}
                                className="px-3 py-1 bg-blue-50 text-blue-700 font-bold rounded-lg text-sm border border-blue-100 cursor-pointer hover:bg-blue-100"
                              >
                                {tag}
                              </span>
                            ))}
                            <button className="px-3 py-1 bg-gray-100 text-gray-500 font-bold rounded-lg text-sm border border-gray-200 hover:bg-gray-200">
                              + Add
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === "date" && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 text-gray-800">
                            <Calendar className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold">Dates</h3>
                          </div>
                          <div className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl inline-flex border border-gray-100">
                            <div className="text-center">
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Start
                              </p>
                              <p className="font-bold text-gray-800">
                                Dec 12, 2025
                              </p>
                            </div>
                            <MoveRight className="text-gray-400" />
                            <div className="text-center">
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Due
                              </p>
                              <p className="font-bold text-gray-800">
                                Dec 15, 2025
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "attachment" && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 text-gray-800">
                            <Paperclip className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold">Attachments</h3>
                          </div>
                          <div className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors cursor-pointer w-max min-w-[300px]">
                            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center text-red-500">
                              <FileText size={24} />
                            </div>
                            <div>
                              <p className="font-bold text-gray-800 text-sm">
                                Project-Brief.pdf
                              </p>
                              <p className="text-xs text-gray-400">
                                Added just now
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ))
                )}
              </div>

              {/* Tabs Section */}
              <div className="pt-4">
                {/* Tabs */}
                <div className="flex gap-8 border-b-2 border-gray-100 mb-8">
                  <button
                    onClick={() => setActiveTab("comment")}
                    className={`pb-4 text-lg font-bold transition-all relative px-2 ${
                      activeTab === "comment"
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    คอมเมนต์
                    {activeTab === "comment" && (
                      <div className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/30"></div>
                    )}
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`pb-4 text-lg font-bold transition-all relative px-2 flex items-center gap-2 ${
                      activeTab === "activity"
                        ? "text-blue-600"
                        : "text-gray-400 hover:text-gray-600"
                    }`}
                  >
                    กิจกรรม
                    <span className="bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
                      {activities.length}
                    </span>
                    {activeTab === "activity" && (
                      <div className="absolute bottom-[-2px] left-0 w-full h-[4px] bg-blue-600 rounded-t-full shadow-lg shadow-blue-500/30"></div>
                    )}
                  </button>
                </div>

                {/* --- Content based on Tab --- */}

                {activeTab === "comment" && (
                  <div className="space-y-6">
                    {/* Comment List (Mock) */}
                    <div className="space-y-4">
                      {comments.map((c) => (
                        <div key={c.id} className="flex gap-4 group">
                          <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0">
                            {c.user[0]}
                          </div>
                          <div className="space-y-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-gray-900">
                                {c.user}
                              </span>
                              <span className="text-xs text-gray-400">
                                {c.timestamp.toLocaleTimeString([], {
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}
                              </span>
                            </div>
                            <div className="bg-white border border-gray-200 p-3 rounded-2xl rounded-tl-none shadow-sm text-gray-700">
                              {c.text}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Input Area */}
                    <div className="flex gap-5">
                      <div className="w-11 h-11 rounded-full bg-linear-to-br from-gray-200 to-gray-300 shrink-0 mt-1 flex items-center justify-center shadow-inner">
                        <User className="w-6 h-6 text-white" fill="white" />
                      </div>
                      <div className="flex-1 space-y-4">
                        <div className="bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10 p-5 rounded-3xl min-h-[100px] transition-all duration-300">
                          <textarea
                            value={newComment}
                            onChange={(e) => setNewComment(e.target.value)}
                            placeholder="แสดงความคิดเห็น หรือ @mention..."
                            className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 resize-none h-full text-base"
                          />
                        </div>
                        <div className="flex justify-end">
                          <button className="bg-yellow-400 hover:bg-yellow-300 text-blue-900 font-bold px-8 py-2.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 text-sm flex items-center gap-2">
                            ส่งคอมเมนต์ <Plus size={16} strokeWidth={3} />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === "activity" && (
                  <div className="space-y-0 relative border-l-2 border-slate-100 ml-4">
                    {activities.map((act) => (
                      <div
                        key={act.id}
                        className="flex gap-4 mb-6 relative pl-6 group"
                      >
                        {/* Timeline Dot */}
                        <div className="absolute -left-[9px] top-1 w-4 h-4 rounded-full bg-white border-4 border-slate-200 group-hover:border-blue-400 transition-colors"></div>

                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-x-2 text-sm text-gray-700">
                            <span className="font-bold text-black">
                              {act.user}
                            </span>
                            <span className="text-gray-500">{act.action}</span>
                            {act.target && (
                              <span className="font-semibold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-md">
                                {act.target}
                              </span>
                            )}
                          </div>
                          <div className="mt-1 flex items-center gap-2 text-xs text-gray-400">
                            <Clock size={12} />
                            {act.timestamp.toLocaleString("th-TH")}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* --- Right Column (Actions) --- */}
            <div className="space-y-6 pt-2">
              <h3 className="text-xl font-black text-gray-800 mb-6 uppercase tracking-wider flex items-center gap-2">
                <Plus size={20} className="text-blue-600" strokeWidth={3} />{" "}
                เพิ่มลงในการ์ด
              </h3>

              <div className="space-y-3">
                <TaskActionButton
                  icon={<CheckSquare size={20} />}
                  label="To-do List"
                />
                <TaskActionButton icon={<Tag size={20} />} label="Tags" />
                <TaskActionButton icon={<Calendar size={20} />} label="Dates" />
                <TaskActionButton
                  icon={<Paperclip size={20} />}
                  label="Attachment"
                />
              </div>

              <div className="mt-8 p-6 bg-blue-50/50 rounded-3xl border border-blue-100">
                <h4 className="font-bold text-gray-800 mb-2 text-sm uppercase opacity-70">
                  สถานะปัจจุบัน
                </h4>
                <div className="flex flex-wrap gap-2">
                  <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                    No Tags
                  </span>
                  <span className="bg-white px-3 py-1 rounded-lg text-xs font-bold text-gray-600 shadow-sm border border-gray-100">
                    No Due Date
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Subcomponent for cleaner code
function TaskActionButton({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) {
  return (
    <button className="w-full py-3 px-4 bg-gray-50 hover:bg-white text-gray-700 hover:text-blue-600 font-bold text-base rounded-2xl transition-all duration-300 flex items-center gap-4 shadow-sm hover:shadow-lg border border-gray-100 hover:border-blue-100 group relative overflow-hidden">
      <div className="absolute inset-0 bg-linear-to-r from-blue-50 to-indigo-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
      <span className="text-gray-500 group-hover:text-blue-600 transition-colors bg-white group-hover:bg-blue-100/50 p-2.5 rounded-xl shadow-sm border border-gray-100 group-hover:scale-110 duration-300 z-10">
        {icon}
      </span>
      <span className="z-10 tracking-wide">{label}</span>
      <div className="flex-1" />
      <div className="opacity-0 group-hover:opacity-100 transform translate-x-3 group-hover:translate-x-0 transition-all duration-300 text-blue-400 z-10">
        <Plus size={16} strokeWidth={3} />
      </div>
    </button>
  );
}
