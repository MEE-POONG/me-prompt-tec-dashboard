import React, { useState, useRef, useEffect } from "react";
import { 
  X, Save, Trash2, ChevronDown, Check, Plus, 
  MoreHorizontal, Copy, Archive, Bell, Search, Mail, Edit2, 
  History, BarChart3, AlertCircle,
  User
} from "lucide-react";
import { WorkspaceInfo, WorkspaceMember } from "@/types/workspace";

// --- Types ---
type TabType = 'settings' | 'difficulty' | 'archived' | 'activities';

interface DifficultyLevel {
  id: number;
  level: number;
  name: string;
}

// --- Component หลัก: Settings Sidebar ---
export function WorkspaceSettingsSidebar({
  isOpen,
  onClose,
  workspaceInfo,
}: {
  isOpen: boolean;
  onClose: () => void;
  workspaceInfo: WorkspaceInfo;
}) {
  
  // UI States
  const [activeTab, setActiveTab] = useState<TabType>('settings');
  const [showMenu, setShowMenu] = useState(false);
  
  // Form States (Settings)
  const [shortName, setShortName] = useState("MPT");
  const [description, setDescription] = useState("แผนงานโปรเจคเว็บบริษัท"); // ค่าจริง
  const [tempDescription, setTempDescription] = useState("แผนงานโปรเจคเว็บบริษัท"); // ค่าระหว่างพิมพ์
  const [selectedWorkspace, setSelectedWorkspace] = useState("No Workspace");
  
  // Member States
  const [memberSearch, setMemberSearch] = useState("");
  const [members, setMembers] = useState<WorkspaceMember[]>(workspaceInfo.members);
  const [openMemberDropdownId, setOpenMemberDropdownId] = useState<number | null>(null);

  // Difficulty States
  const [difficultyLevels, setDifficultyLevels] = useState<DifficultyLevel[]>([
    { id: 1, level: 1, name: "Easy" },
    { id: 2, level: 2, name: "Normal" },
    { id: 3, level: 3, name: "Hard" },
  ]);
  const [difficultySearch, setDifficultySearch] = useState("");

  // Refs
  const menuRef = useRef<HTMLDivElement>(null);
  const memberDropdownRef = useRef<HTMLDivElement>(null);

  // Initialize Data
  useEffect(() => {
    if (isOpen) {
        setMembers(workspaceInfo.members);
        // Reset Text areas
        setTempDescription(description);
    }
  }, [isOpen, workspaceInfo]);

  // Click Outside to Close Menus
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setShowMenu(false);
      }
      if (memberDropdownRef.current && !memberDropdownRef.current.contains(event.target as Node)) {
        setOpenMemberDropdownId(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // --- Handlers (Settings) ---
  const handleSaveDescription = () => {
    setDescription(tempDescription);
    alert(`Saved Description: ${tempDescription}`);
  };

  const handleCancelDescription = () => {
    setTempDescription(description); // Reset กลับเป็นค่าล่าสุดที่บันทึก
  };

  const handleRoleChange = (index: number, newRole: string) => {
    const updatedMembers = [...members];
    updatedMembers[index].role = newRole;
    setMembers(updatedMembers);
    setOpenMemberDropdownId(null);
  };

  const handleRemoveMember = (index: number) => {
    if (window.confirm(`Are you sure you want to remove ${members[index].name}?`)) {
        const updatedMembers = members.filter((_, i) => i !== index);
        setMembers(updatedMembers);
    }
    setOpenMemberDropdownId(null);
  };

  const handleLeaveBoard = () => {
    if (window.confirm("Are you sure you want to leave this board?")) {
        onClose();
        // ใส่ Logic การออกจากบอร์ดจริงๆ ตรงนี้
    }
  };

  // --- Handlers (Difficulty) ---
  const handleAddDifficulty = () => {
      const newLevel = difficultyLevels.length + 1;
      const newDiff = { 
          id: Date.now(), 
          level: newLevel, 
          name: `Level ${newLevel}` 
      };
      setDifficultyLevels([...difficultyLevels, newDiff]);
  };

  // --- Logic for Lists ---
  // กรองสมาชิกตามช่องค้นหา
  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(memberSearch.toLowerCase())
  );

  // กรองระดับความยากตามช่องค้นหา
  const filteredDifficulties = difficultyLevels.filter(d => 
    d.name.toLowerCase().includes(difficultySearch.toLowerCase())
  );

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black/20 z-60 backdrop-blur-[1px] transition-opacity"
        onClick={onClose}
      />

      {/* Sidebar Container */}
      <div className="fixed inset-y-0 right-0 w-full max-w-[400px] bg-white shadow-2xl z-70 flex flex-col animate-in slide-in-from-right duration-300">
        
        {/* --- Header --- */}
        <div className="p-5 pb-0 bg-white z-10">
            <div className="flex justify-between items-start mb-2">
                <div className="flex gap-3 items-center">
                    <div className="w-10 h-10 rounded bg-blue-500 shadow-sm"></div>
                    <div>
                        <h2 className="text-lg font-bold text-slate-800 leading-tight">{workspaceInfo.name}</h2>
                        <p className="text-xs text-slate-400 mt-1">
                            Created by <span className="text-slate-600 font-medium">ธนภัทร โพธิ์ศรี</span> on November 18 at 10:55
                        </p>
                    </div>
                </div>
                
                <div className="relative" ref={menuRef}>
                    <button 
                        onClick={() => setShowMenu(!showMenu)}
                        className="p-1 hover:bg-slate-100 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    >
                        <MoreHorizontal size={20} />
                    </button>
                    {showMenu && (
                        <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95 origin-top-right">
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Bell size={14}/> Notification
                            </button>
                            <button className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center gap-2">
                                <Copy size={14}/> Copy Board
                            </button>
                            <div className="h-px bg-slate-100 my-1"></div>
                            <button className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50 flex items-center gap-2">
                                <Trash2 size={14}/> Delete Board
                            </button>
                        </div>
                    )}
                </div>
            </div>

            {/* Tabs */}
            <div className="flex items-center gap-6 border-b border-slate-200 mt-6 overflow-x-auto scrollbar-hide">
                {['Settings', 'Difficulty Level', 'Archived', 'Activities'].map((tab) => {
                    const tabKey = tab === 'Difficulty Level' ? 'difficulty' : tab.toLowerCase().replace(' ', '') as TabType;
                    return (
                        <button
                            key={tabKey}
                            onClick={() => setActiveTab(tabKey)}
                            className={`pb-3 text-sm font-medium transition-all relative whitespace-nowrap ${
                                activeTab === tabKey 
                                ? "text-blue-600" 
                                : "text-slate-500 hover:text-slate-700"
                            }`}
                        >
                            {tab}
                            {activeTab === tabKey && (
                                <div className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600 rounded-t-full"></div>
                            )}
                        </button>
                    )
                })}
            </div>
        </div>

        {/* --- Content --- */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 bg-slate-50/30">
            
            {/* TAB 1: SETTINGS */}
            {activeTab === 'settings' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 flex flex-col min-h-full">
                    
                    {/* Short Name */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                            <Edit2 size={12} className="text-slate-400"/> Short Name <span className="text-slate-400 text-xs font-normal">ⓘ</span>
                        </label>
                        <input 
                            value={shortName}
                            onChange={(e) => setShortName(e.target.value)}
                            className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    {/* Description */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                             Description
                        </label>
                        <div className="bg-slate-100 p-3 rounded-lg border border-slate-200">
                            <textarea 
                                value={tempDescription}
                                onChange={(e) => setTempDescription(e.target.value)}
                                rows={4}
                                className="w-full px-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-500 transition-colors resize-none mb-3"
                            />
                            <div className="flex justify-end gap-2">
                                <button 
                                    onClick={handleCancelDescription}
                                    className="px-4 py-1.5 bg-white border border-slate-200 rounded text-sm font-medium text-slate-600 hover:bg-slate-50 transition-all"
                                >
                                    Cancel
                                </button>
                                <button 
                                    onClick={handleSaveDescription}
                                    className="px-4 py-1.5 bg-gray-200 border border-gray-300 rounded text-sm font-medium text-gray-600 hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                                >
                                    Save
                                </button>
                            </div>
                        </div>
                    </div>

                    {/* Workspace */}
                    <div className="space-y-1.5">
                        <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                           <User size={14}/> Workspace
                        </label>
                        <div className="relative">
                            <select 
                                value={selectedWorkspace}
                                onChange={(e) => setSelectedWorkspace(e.target.value)}
                                className="w-full px-3 py-2.5 bg-white border border-slate-200 rounded-md text-sm text-slate-800 focus:outline-none focus:border-blue-500 appearance-none cursor-pointer"
                            >
                                <option>No Workspace</option>
                                <option>Marketing Team</option>
                                <option>Dev Team</option>
                            </select>
                            <ChevronDown size={16} className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"/>
                        </div>
                    </div>

                    {/* Members */}
                    <div className="space-y-3">
                         <label className="text-sm font-bold text-slate-700 flex items-center gap-1">
                           <User size={14}/> Members
                        </label>
                        <div className="relative">
                            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                            <input 
                                placeholder="Search name"
                                value={memberSearch}
                                onChange={(e) => setMemberSearch(e.target.value)}
                                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                            />
                        </div>
                        <div className="space-y-1 pt-2">
                            <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">MEMBERS ({filteredMembers.length})</p>
                            {filteredMembers.map((m, i) => (
                                <div key={i} className="flex items-center justify-between py-1.5 hover:bg-slate-100 rounded-lg px-2 -mx-2 transition-colors relative">
                                    <div className="flex items-center gap-3">
                                        <div className={`w-9 h-9 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm border border-white ${m.color.replace('text-', 'bg-').split(' ')[0]}`}>
                                            {m.avatar}
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-800 leading-tight">{m.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {m.name.includes("ธนภัทร") ? "pattanapat92@gmail.com" : m.name.includes("Siwakorn") ? "siwakorn.pn@rmuti.ac.th" : "user@email.com"}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {/* Role Dropdown */}
                                    <button 
                                        onClick={() => setOpenMemberDropdownId(openMemberDropdownId === i ? null : i)}
                                        className="text-xs font-medium text-slate-600 flex items-center gap-1 hover:bg-white hover:shadow-sm px-2 py-1 rounded transition-all"
                                    >
                                        {m.role || "Viewer"} <ChevronDown size={12}/>
                                    </button>

                                    {openMemberDropdownId === i && (
                                        <div ref={memberDropdownRef} className="absolute right-0 top-8 w-40 bg-white rounded-lg shadow-xl border border-slate-100 py-1 z-50 animate-in fade-in zoom-in-95">
                                            {["Admin", "Editor", "Viewer"].map((role) => (
                                                <button key={role} onClick={() => handleRoleChange(i, role)} className="w-full text-left px-4 py-2 text-sm text-slate-700 hover:bg-slate-50 flex items-center justify-between">
                                                    {role} {m.role === role && <Check size={14} className="text-blue-600"/>}
                                                </button>
                                            ))}
                                            <div className="h-px bg-slate-100 my-1"></div>
                                            <button onClick={() => handleRemoveMember(i)} className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-red-50">Remove Member</button>
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="pt-6 mt-auto">
                        <button onClick={handleLeaveBoard} className="w-full py-2.5 border border-blue-500 text-blue-500 rounded-lg text-sm font-medium hover:bg-blue-50 transition-colors active:scale-95">Leave Board</button>
                    </div>
                </div>
            )}

            {/* TAB 2: DIFFICULTY LEVEL */}
            {activeTab === 'difficulty' && (
                <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                    <div className="flex justify-between items-center mb-2">
                        <h3 className="text-lg font-medium text-slate-800">Difficulty Level</h3>
                        <button 
                            onClick={handleAddDifficulty}
                            className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded flex items-center gap-1 hover:bg-blue-700 transition-all shadow-sm"
                        >
                            <Plus size={14}/> Create
                        </button>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder="Search"
                            value={difficultySearch}
                            onChange={(e) => setDifficultySearch(e.target.value)}
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>

                    <div className="space-y-3">
                        {filteredDifficulties.map((d) => (
                             <div key={d.id} className="bg-white p-4 rounded-lg border border-slate-200 shadow-sm hover:border-blue-200 transition-colors cursor-pointer group">
                                <p className="text-xs text-slate-500 font-medium mb-1 group-hover:text-blue-500">Level : {d.level}</p>
                                <p className="text-sm font-bold text-slate-800">{d.name}</p>
                             </div>
                        ))}
                    </div>
                </div>
            )}

            {/* TAB 3: ARCHIVED */}
            {activeTab === 'archived' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300 h-full flex flex-col">
                    <div className="flex justify-between items-center">
                        <h3 className="text-lg font-medium text-slate-800">Archived tasks</h3>
                        <button className="bg-blue-600 text-white text-xs font-bold px-3 py-1.5 rounded hover:bg-blue-700 transition-all shadow-sm">
                            Switch to columns
                        </button>
                    </div>

                    <div className="relative">
                        <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                        <input 
                            placeholder="Search tasks"
                            className="w-full pl-9 pr-3 py-2 bg-white border border-slate-200 rounded-md text-sm text-slate-900 focus:outline-none focus:border-blue-500 transition-colors"
                        />
                    </div>
                    
                    {/* Empty State */}
                    <div className="flex-1 flex flex-col items-center justify-center text-center mt-4">
                        <div className="w-24 h-24 bg-blue-50 rounded-full flex items-center justify-center mb-4 relative">
                            <div className="w-16 h-12 bg-blue-600 rounded-md shadow-lg flex items-center justify-center relative z-10 rotate-[-10deg]">
                                <Archive size={24} className="text-white"/>
                            </div>
                            <div className="absolute w-14 h-4 bg-blue-800/20 rounded-full blur-md bottom-4"></div>
                        </div>
                        <h4 className="text-lg font-bold text-slate-800 mb-1">No items</h4>
                        <p className="text-sm text-slate-500">You can archive tasks or columns here.</p>
                    </div>
                </div>
            )}

            {/* TAB 4: ACTIVITIES */}
            {activeTab === 'activities' && (
                <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-300">
                     <h3 className="text-sm font-bold text-slate-800 mb-4">Tuesday 18 November 2025</h3>
                     
                     <div className="space-y-6 pl-2 relative border-l-2 border-slate-100 ml-3">
                        {[1, 2, 3].map((_, i) => (
                            <div key={i} className="flex gap-3 relative -ml-[19px]">
                                <div className="w-9 h-9 rounded-full bg-pink-600 flex items-center justify-center text-white text-xs font-bold shrink-0 z-10 border-4 border-white shadow-sm">
                                    T
                                </div>
                                <div className="flex flex-col pt-1">
                                    <div className="text-sm text-slate-800 leading-snug">
                                        <span className="font-bold hover:underline cursor-pointer">ธนภัทร โพธิ์ศรี</span>
                                        {i === 0 && " invited siwakorn.pn@rmuti.ac.th to join this board."}
                                        {i === 1 && " invited nuysupansa09@gmail.com to join this board."}
                                        {i === 2 && " created this board."}
                                    </div>
                                    <span className="text-xs text-slate-400 mt-1 font-medium">November 18 at 11:05</span>
                                </div>
                            </div>
                        ))}
                     </div>
                </div>
            )}

        </div>
      </div>
    </>
  );
}

// --- Invite Member Modal ---
export function MembersManageModal({
  isOpen,
  onClose,
  members,
}: {
  isOpen: boolean;
  onClose: () => void;
  members: WorkspaceMember[];
}) {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl p-5 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-slate-900">เชิญสมาชิก (Invite member)</h3>
                    <button onClick={onClose}><X size={20} className="text-slate-400 hover:text-slate-600"/></button>
                </div>
                <div className="px-6 py-6 bg-slate-50/50 rounded-lg mb-4">
                    <div className="flex gap-3">
                        <div className="relative flex-1 group">
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500"><Plus size={18} /></div>
                            <input placeholder="Invite by name or email" className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-sm focus:outline-none focus:border-blue-500 shadow-sm" />
                        </div>
                        <button className="px-5 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md">ส่งคำเชิญ</button>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Members ({members.length})</h4>
                    <div className="space-y-1"> 
                        {members.map((member, index) => (
                            <div key={index} className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors">
                                <div className="flex items-center gap-3">
                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold text-white shadow-sm ring-2 ring-white ${member.color.split(' ')[0].replace('text-', 'bg-') || 'bg-slate-400'}`}>
                                        {member.avatar}
                                    </div>
                                    <div className="flex flex-col">
                                        <span className="text-sm font-bold text-slate-800">{member.name}</span>
                                        <span className="text-xs text-slate-500">user@email.com</span>
                                    </div>
                                </div>
                                <button className="text-xs font-bold text-slate-600 px-3 py-1.5 bg-slate-100 rounded-lg">{member.role || "Viewer"}</button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}