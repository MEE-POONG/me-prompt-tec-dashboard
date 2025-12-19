import React, { useState, useRef, useEffect } from "react";
import {
  X, CheckCircle2, CheckSquare, Tag as TagIcon, Calendar, Paperclip,
  Plus, MoreHorizontal, Layout, Trash2, ChevronRight, ChevronLeft,
  Link as LinkIcon, FileText, AlignLeft, MessageSquare, Activity, Send,
  Edit2, Smile, UploadCloud, User, Monitor, Search, Clock, GripVertical
} from "lucide-react";
import { format } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import { getTask, updateTask, getActivities, createActivity, getMembers } from "@/lib/api/workspace";

// --- 1. CSS Styles ---
const customStyles = `
  .rdp { --rdp-cell-size: 40px; --rdp-accent-color: #2563eb; margin: 0; }
  .rdp-button:hover:not([disabled]):not(.rdp-day_selected) { background-color: #f1f5f9; }
  .rdp-day { color: #0f172a !important; font-weight: 600; font-size: 0.9rem; }
  .rdp-day_outside { opacity: 0.3; }
  .rdp-day_selected:not(.rdp-day_range_middle) { 
      background-color: #2563eb !important; 
      color: white !important; 
      border-radius: 50%;
  }
  .rdp-day_range_middle { 
      background-color: #dbeafe !important; 
      color: #1e40af !important;
      border-radius: 0 !important;
  }
  .rdp-day_range_start { border-top-right-radius: 0; border-bottom-right-radius: 0; }
  .rdp-day_range_end { border-top-left-radius: 0; border-bottom-left-radius: 0; }
  .rdp-caption_label { color: #1e293b; font-weight: 800; font-size: 1rem; }
  .rdp-head_cell { color: #64748b; font-weight: 700; text-transform: uppercase; font-size: 0.75rem; }
`;

// --- 2. Types ---
interface Member { id: string; name: string; color: string; short: string; }
interface TagItem { id: string; name: string; color: string; bgColor: string; textColor: string; }
interface CheckItem { id: string; text: string; isChecked: boolean; }
interface AttachmentItem { id: string; type: 'file' | 'link'; name: string; url?: string; date: string; }
interface ActivityLog { id: string; user: string; action: string; time: string; }
interface Comment { id: number; user: string; text: string; time: string; color: string; isEdited?: boolean; }

interface ContentBlock {
    id: string;
    type: 'checklist' | 'attachment';
    title?: string;
    items?: CheckItem[];
    attachments?: AttachmentItem[];
}

// --- 3. Mock Data ---
const ALL_MEMBERS: Member[] = [
  { id: "1", name: "Poom", color: "bg-blue-600", short: "P" },
  { id: "2", name: "Jame", color: "bg-emerald-600", short: "J" },
];

const TAG_COLORS = [
    { name: "green", bg: "bg-green-500", text: "text-white", labelBg: "bg-green-100", labelText: "text-green-700" },
    { name: "yellow", bg: "bg-yellow-500", text: "text-white", labelBg: "bg-yellow-100", labelText: "text-yellow-700" },
    { name: "orange", bg: "bg-orange-500", text: "text-white", labelBg: "bg-orange-100", labelText: "text-orange-700" },
    { name: "red", bg: "bg-red-500", text: "text-white", labelBg: "bg-red-100", labelText: "text-red-700" },
    { name: "purple", bg: "bg-purple-500", text: "text-white", labelBg: "bg-purple-100", labelText: "text-purple-700" },
    { name: "blue", bg: "bg-blue-500", text: "text-white", labelBg: "bg-blue-100", labelText: "text-blue-700" },
];

const INITIAL_TAGS: TagItem[] = [
    { id: "1", name: "High Priority", color: "red", bgColor: "bg-red-100", textColor: "text-red-700" },
    { id: "2", name: "Design", color: "purple", bgColor: "bg-purple-100", textColor: "text-purple-700" },
    { id: "3", name: "Dev", color: "blue", bgColor: "bg-blue-100", textColor: "text-blue-700" },
];

// --- 4. Main Component ---
// แก้ไขตรงนี้: เพิ่ม task?: any เข้าไปใน Props
export default function ModalsWorkflow({ isOpen, onClose, task }: { isOpen: boolean; onClose: () => void; task?: any }) {
  // State
  const [title, setTitle] = useState("Website Redesign");
  const [desc, setDesc] = useState("");
  const [activeTab, setActiveTab] = useState<'comments' | 'activity'>('comments');
  const [isAccepted, setIsAccepted] = useState(false);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  
  // Metadata State
  const [assignedMembers, setAssignedMembers] = useState<string[]>(["1"]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [availableTags, setAvailableTags] = useState<TagItem[]>(INITIAL_TAGS);

  // Activities & Comments State
  const [comments, setComments] = useState<Comment[]>([
    { id: 1, user: "Jame", text: "Design looks great! 👍", time: "2h ago", color: "bg-emerald-600" }
  ]);
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: "1", user: "System", action: "created this task", time: "Yesterday" }
  ]);
  const [commentInput, setCommentInput] = useState("");

  // Popover State
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Temporary Inputs for Popovers
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [attachmentTab, setAttachmentTab] = useState<'file' | 'link'>('file');

  // Tag Editing State
  const [tagView, setTagView] = useState<'list' | 'create' | 'edit'>('list');
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);

  // API-connected state
  const [boardId, setBoardId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [membersList, setMembersList] = useState<Member[]>(ALL_MEMBERS);

  // --- Effect: Load full task when modal opens ---
  useEffect(() => {
    const load = async () => {
      if (!isOpen || !task?.id) return;
      try {
        setLoadingTask(true);
        const data: any = await getTask(String(task.id));
        setTaskId(data.id);
        setTitle(data.title || "Untitled Task");
        setDesc(data.description || "");
        setAssignedMembers((data.assignees || []).map((a: any) => a.user?.id || a.userId).filter(Boolean));
        setBoardId(data.column?.board?.id || data.column?.boardId || null);

        // Load activities for board
        if (data.column?.board?.id) {
          const boardId = String(data.column.board.id);
          const acts: any[] = await getActivities(boardId);
          setActivities(acts.map(a => ({ id: a.id, user: a.user, action: `${a.action} ${a.target || ''}`.trim(), time: new Date(a.createdAt).toLocaleString() })));

          // load members for this board
          try {
            const mems: any[] = await getMembers(boardId);
            // map to local Member shape if possible
            setMembersList(mems.map(m => ({ id: m.id, name: m.name || m.user || "Member", color: m.color || "bg-slate-400", short: (m.name || "").slice(0,1).toUpperCase() })));
          } catch (err) {
            // ignore, keep defaults
          }
        }
      } catch (err) {
        console.error("Failed to load task", err);
      } finally {
        setLoadingTask(false);
      }
    };
    load();
  }, [isOpen, task?.id]);


  // --- Handlers ---
  const logActivity = (action: string) => {
    // Local UI update
    setActivities(prev => [{ 
        id: Date.now().toString(), user: "You", action, 
        time: new Date().toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'}) 
    }, ...prev]);

    // Persist activity (best-effort)
    if (boardId) {
      createActivity({ boardId, user: "You", action, target: title, projectId: boardId }).catch(e => console.error("createActivity failed", e));
    }
  };

  // Tag Handlers
  const handleCreateTag = () => {
      if(!newTagName.trim()) return;
      const newTag: TagItem = {
          id: Date.now().toString(),
          name: newTagName,
          color: newTagColor.name,
          bgColor: newTagColor.labelBg,
          textColor: newTagColor.labelText
      };
      setAvailableTags(prev => [...prev, newTag]);
      setSelectedTagIds(prev => [...prev, newTag.id]);
      setTagView('list');
      setNewTagName("");
      logActivity(`created label "${newTagName}"`);
  };

  const handleUpdateTag = () => {
      if(editingTagId && newTagName.trim()) {
          const updatedTag = {
              id: editingTagId,
              name: newTagName,
              color: newTagColor.name,
              bgColor: newTagColor.labelBg,
              textColor: newTagColor.labelText
          };
          setAvailableTags(prev => prev.map(t => t.id === editingTagId ? updatedTag : t));
          setTagView('list');
          setEditingTagId(null);
          setNewTagName("");
          logActivity(`updated label "${newTagName}"`);
      }
  };

  const handleDeleteTag = () => {
      if(editingTagId) {
          const tagToDelete = availableTags.find(t => t.id === editingTagId);
          setAvailableTags(prev => prev.filter(t => t.id !== editingTagId));
          setSelectedTagIds(prev => prev.filter(id => id !== editingTagId));
          setTagView('list');
          setEditingTagId(null);
          setNewTagName("");
          logActivity(`deleted label "${tagToDelete?.name}"`);
      }
  };

  const startEditTag = (tag: TagItem) => {
      setEditingTagId(tag.id);
      setNewTagName(tag.name);
      setNewTagColor(TAG_COLORS.find(c => c.name === tag.color) || TAG_COLORS[0]);
      setTagView('edit');
  };

  const startCreateTag = () => {
      setEditingTagId(null);
      setNewTagName("");
      setNewTagColor(TAG_COLORS[0]);
      setTagView('create');
  };

  const toggleTag = (tagId: string) => {
      if (selectedTagIds.includes(tagId)) {
          setSelectedTagIds(prev => prev.filter(id => id !== tagId));
      } else {
          setSelectedTagIds(prev => [...prev, tagId]);
      }
  };

  // Checklist Handlers
  const addChecklistBlock = () => {
      const titleText = newChecklistTitle.trim() || "Checklist";
      setBlocks(prev => [...prev, { id: Date.now().toString(), type: 'checklist', title: titleText, items: [] }]);
      logActivity(`added checklist "${titleText}"`);
      setNewChecklistTitle("");
      setActivePopover(null);
  };
  const addChecklistItem = (blockId: string, text: string) => {
      if(!text.trim()) return;
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, items: [...(b.items || []), { id: Date.now().toString(), text, isChecked: false }] } : b));
  };
  const toggleCheckItem = (blockId: string, itemId: string) => {
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, items: b.items?.map(i => i.id === itemId ? { ...i, isChecked: !i.isChecked } : i) } : b));
  };
  const deleteCheckItem = (blockId: string, itemId: string) => {
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, items: b.items?.filter(i => i.id !== itemId) } : b));
  };
  const updateCheckItem = (blockId: string, itemId: string, text: string) => {
      setBlocks(prev => prev.map(b => b.id === blockId ? { ...b, items: b.items?.map(i => i.id === itemId ? { ...i, text } : i) } : b));
  };
  const deleteBlock = (blockId: string) => {
      if(confirm("Delete this section?")) { setBlocks(prev => prev.filter(b => b.id !== blockId)); logActivity("removed a block"); }
  };
  

  const handleAddAttachment = async (type: 'link' | 'file', val1: string, val2?: string) => {
    const newItem: AttachmentItem = { id: Date.now().toString(), type, name: val2 || val1, url: type === 'link' ? val1 : undefined, date: new Date().toLocaleDateString() };
    const existing = blocks.find(b => b.type === 'attachment');
    if (existing) { setBlocks(prev => prev.map(b => b.id === existing.id ? { ...b, attachments: [...(b.attachments || []), newItem] } : b)); } 
    else { setBlocks(prev => [...prev, { id: Date.now().toString(), type: 'attachment', attachments: [newItem] }]); }
    logActivity(`attached ${type}`); setActivePopover(null); setLinkUrl(""); setLinkText("");

    // persist attachments count (best-effort)
    if (taskId) {
      try { await updateTask(String(taskId), { attachments: (task?.attachments || 0) + 1 }); } catch (err) { console.error("Failed to update attachments count", err); }
    }
  };
  // Add a comment locally + persist comment count and activity
  const sendComment = async () => {
    if (!commentInput.trim() || !taskId) return;
    const newComment = { id: Date.now(), user: "You", text: commentInput, time: "Just now", color: "bg-blue-600" };
    setComments(prev => [newComment, ...prev]);
    setCommentInput("");

    try {
      // increment comments count on task (best-effort)
      // fetch current count from API would be better, but we try to increment via updateTask
      await updateTask(String(taskId), { comments: (task?.comments || 0) + 1 });
      if (boardId) await createActivity({ boardId, user: "You", action: "commented", target: title, projectId: boardId });
      // update local activity list
      logActivity("commented");
    } catch (err) {
      console.error("Failed to persist comment", err);
    }
  };

  const deleteComment = (id: number) => { if(confirm("Delete this comment?")) setComments(prev => prev.filter(c => c.id !== id)); };

  // Toggle member assignment and persist to API
  const toggleMember = async (memberId: string) => {
    if (!taskId) return;
    const newMembers = assignedMembers.includes(memberId) ? assignedMembers.filter(id => id !== memberId) : [...assignedMembers, memberId];
    setAssignedMembers(newMembers);
    try {
      await updateTask(String(taskId), { assigneeIds: newMembers });
      const member = membersList.find(m => m.id === memberId);
      logActivity(`${newMembers.includes(memberId) ? 'assigned' : 'removed'} ${member?.name || memberId}`);
    } catch (err) {
      console.error("Failed to update assignees", err);
    }
  };

  // Save dates to task
  const handleSaveDate = async () => {
    if (!taskId) return;
    try {
      await updateTask(String(taskId), { dueDate: dateRange?.from ? dateRange.from.toISOString() : null });
      logActivity("updated dates");
      setActivePopover(null);
    } catch (err) { console.error("Failed to save date", err); }
  };

  // Update task title/description on blur (best-effort)
  const saveField = async (data: { title?: string; description?: string }) => {
    if (!taskId) return;
    try {
      await updateTask(String(taskId), data);
      if (data.title) logActivity("updated title");
      if (data.description) logActivity("updated description");
    } catch (err) { console.error("Failed to save field", err); }
  };


  if (!isOpen) return null;

  return (
    <>
      <style>{customStyles}</style>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[20px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-200 font-sans relative">
          
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-sm z-10">
             <div className="flex items-center gap-3">
                 <button 
                   onClick={() => setIsAccepted(!isAccepted)}
                   className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 border ${isAccepted ? 'bg-green-100 text-green-700 border-green-200' : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'}`}
                 >
                      <CheckCircle2 size={16} className={isAccepted ? "fill-green-600 text-white" : "text-slate-400"} />
                      {isAccepted ? "รับงานแล้ว" : "รับงาน"}
                 </button>
                 <div className="h-6 w-px bg-slate-200 mx-2"></div>
                 <div className="flex -space-x-1">
                     {assignedMembers.map(id => {
                         const m = membersList.find(mem => mem.id === id);
                         return m ? <div key={id} className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center text-xs font-bold text-white shadow-sm ${m.color}`}>{m.short}</div> : null;
                     })}
                     <button onClick={() => setActivePopover('members')} className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"><Plus size={14}/></button>
                 </div>
             </div>
             <div className="flex gap-2">
                <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"><MoreHorizontal size={20} /></button>
                <button className="p-2 rounded-lg text-slate-500 hover:bg-slate-100" onClick={onClose}><X size={20} /></button>
             </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            
            {/* === LEFT CONTENT === */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white pb-32">
                
                {/* Title */}
                <div className="mb-6 space-y-4">
                    <div className="flex items-start gap-3">
                        <Layout size={24} className="text-slate-500 mt-1.5" />
                        <div className="flex-1">
                            <input 
                                value={title} 
                                onChange={e => setTitle(e.target.value)} 
                                onBlur={() => saveField({ title })}
                                className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                            />
                            <p className="text-sm text-slate-500 mt-1">in list <span className="underline decoration-slate-300 cursor-pointer hover:text-blue-600">To Do</span></p>
                        </div>
                    </div>
                </div>

                {/* Metadata Row */}
                <div className="ml-9 mb-8 flex flex-wrap gap-4">
                    {selectedTagIds.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                             {selectedTagIds.map(id => {
                                 const t = availableTags.find(tag => tag.id === id);
                                 return t ? <span key={id} className={`px-3 py-1 rounded-md text-sm font-bold shadow-sm ${t.bgColor} ${t.textColor}`}>{t.name}</span> : null;
                             })}
                             <button onClick={() => { setActivePopover('tags'); setTagView('list'); }} className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"><Plus size={16}/></button>
                        </div>
                    )}
                    {dateRange?.from && (
                        <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors" onClick={() => setActivePopover('dates')}>
                             <Clock size={16} />
                             <span>
                                {format(dateRange.from, 'dd MMM')} 
                                {dateRange.to ? ` - ${format(dateRange.to, 'dd MMM')}` : ''}
                             </span>
                        </div>
                    )}
                </div>

                {/* Description */}
                <div className="mb-8 group">
                    <div className="flex items-center gap-3 mb-2 text-slate-800 font-bold">
                        <AlignLeft size={20} /><h3>รายละเอียด</h3>
                    </div>
                    <div className="ml-9">
                        <textarea 
                            value={desc}
                            onChange={(e) => setDesc(e.target.value)}
                            onBlur={() => saveField({ description: desc })}
                            placeholder="เพิ่มรายละเอียดเพิ่มเติมเกี่ยวกับงานนี้..."
                            className="w-full min-h-[100px] bg-slate-50 hover:bg-slate-100 focus:bg-white border border-transparent focus:border-blue-500 rounded-lg p-4 text-base text-slate-900 leading-relaxed transition-all resize-none focus:ring-2 focus:ring-blue-100"
                        />
                    </div>
                </div>

                {/* Dynamic Content Blocks */}
                <div className="space-y-8 mb-10">
                    {blocks.map(block => (
                         <div key={block.id} className="group relative">
                             <div className="flex items-center justify-between mb-3">
                                <div className="flex items-center gap-3 text-slate-800 font-bold">
                                    {block.type === 'checklist' ? <CheckSquare size={20} /> : <Paperclip size={20} />}
                                    <h3>{block.type === 'checklist' ? block.title : 'Attachments'}</h3>
                                </div>
                                <button onClick={() => deleteBlock(block.id)} className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-red-50 hover:text-red-600 transition-colors">Delete</button>
                             </div>

                             {block.type === 'checklist' && (
                                <div className="ml-9 space-y-4">
                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mb-2">
                                        <span className="text-slate-600">{Math.round(((block.items?.filter(i => i.isChecked).length || 0) / (block.items?.length || 1)) * 100)}%</span>
                                        <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                            <div className="h-full bg-emerald-500 transition-all duration-300" style={{ width: `${((block.items?.filter(i => i.isChecked).length || 0) / (block.items?.length || 1)) * 100}%` }}></div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        {block.items?.map(item => (
                                            <div key={item.id} className="flex items-start gap-3 group/item p-1.5 hover:bg-slate-50 rounded-lg -ml-1.5 transition-colors">
                                                <GripVertical size={16} className="text-slate-300 mt-1 cursor-grab opacity-0 group-hover/item:opacity-100" />
                                                <input type="checkbox" checked={item.isChecked} onChange={() => toggleCheckItem(block.id, item.id)} className="w-5 h-5 rounded border-slate-300 text-emerald-600 cursor-pointer focus:ring-0 mt-0.5" />
                                                <input value={item.text} onChange={(e) => updateCheckItem(block.id, item.id, e.target.value)} className={`flex-1 text-sm font-medium bg-transparent border-none focus:ring-0 p-0 text-slate-900 ${item.isChecked ? 'line-through text-slate-400' : ''}`}/>
                                                <button onClick={() => deleteCheckItem(block.id, item.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 p-1"><X size={16}/></button>
                                            </div>
                                        ))}
                                    </div>
                                    <div className="pl-7 mt-2">
                                        <button className="text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 mb-2" onClick={() => { const input = document.getElementById(`add-input-${block.id}`) as HTMLInputElement; if (input) input.focus(); }}>
                                            <Plus size={16}/> Add an item
                                        </button>
                                        <input id={`add-input-${block.id}`} placeholder="Add an item..." className="text-sm bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-3 py-2 w-full outline-none transition-all text-slate-700" onKeyDown={(e) => { if(e.key==='Enter' && e.currentTarget.value.trim()) { addChecklistItem(block.id, e.currentTarget.value); e.currentTarget.value = ""; }}}/>
                                    </div>
                                </div>
                             )}

                             {block.type === 'attachment' && (
                                 <div className="ml-9 grid grid-cols-1 gap-2">
                                     {block.attachments?.map(att => (
                                         <div key={att.id} className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white relative group/att">
                                             <div className={`w-10 h-10 rounded flex items-center justify-center text-white ${att.type === 'link' ? 'bg-blue-500' : 'bg-red-500'}`}>
                                                 {att.type === 'link' ? <LinkIcon size={18}/> : <FileText size={18}/>}
                                             </div>
                                             <div className="flex-1 min-w-0">
                                                 <div className="text-sm font-bold text-slate-900 truncate">{att.name}</div>
                                                 {att.url && <a href={att.url} target="_blank" className="text-xs text-blue-500 hover:underline truncate block">{att.url}</a>}
                                                 <div className="text-xs text-slate-400 font-medium">Added {att.date}</div>
                                             </div>
                                         </div>
                                     ))}
                                 </div>
                             )}
                         </div>
                    ))}
                </div>

                {/* Activity & Comments */}
                <div className="mt-8 pt-8 border-t border-slate-200">
                    <div className="flex gap-6 mb-6">
                        <button onClick={() => setActiveTab('comments')} className={`pb-2 border-b-2 font-bold text-sm flex items-center gap-2 ${activeTab === 'comments' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><MessageSquare size={16}/> Comments</button>
                        <button onClick={() => setActiveTab('activity')} className={`pb-2 border-b-2 font-bold text-sm flex items-center gap-2 ${activeTab === 'activity' ? 'border-blue-600 text-blue-700' : 'border-transparent text-slate-500 hover:text-slate-700'}`}><Activity size={16}/> Activity</button>
                    </div>
                    {activeTab === 'comments' ? (
                        <div className="space-y-6">
                             <div className="flex gap-3">
                                 <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm">Y</div>
                                 <div className="flex-1 relative">
                                     <textarea value={commentInput} onChange={e => setCommentInput(e.target.value)} className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none min-h-[60px] text-slate-900" placeholder="Write a comment..." onKeyDown={e => { if(e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendComment(); } }}/>
                                     <div className="flex items-center gap-2 mt-2 justify-end">
                                         <button onClick={() => chatFileRef.current?.click()} className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Paperclip size={16}/></button>
                                         <button className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"><Smile size={16}/></button>
                                         <input type="file" className="hidden" ref={chatFileRef} />
                                         <button onClick={sendComment} className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2">Send <Send size={14}/></button>
                                     </div>
                                 </div>
                             </div>
                             <div className="space-y-5 pl-12">
                                 {comments.map(c => (
                                     <div key={c.id} className="group">
                                         <div className="flex items-baseline gap-2 mb-1">
                                             <span className="font-bold text-slate-900 text-sm">{c.user}</span>
                                             <span className="text-xs text-slate-400 font-medium">{c.time}</span>
                                         </div>
                                         <div className="text-sm text-slate-800 bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm inline-block font-medium leading-relaxed max-w-full relative group">
                                            {c.text}
                                            <div className="absolute top-1 right-1 hidden group-hover:flex bg-white rounded-lg shadow-sm border border-slate-100 p-1">
                                                <button className="p-1 text-slate-400 hover:text-blue-600 rounded" title="Edit"><Edit2 size={12}/></button>
                                                <button onClick={() => deleteComment(c.id)} className="p-1 text-slate-400 hover:text-red-600 rounded" title="Delete"><Trash2 size={12}/></button>
                                            </div>
                                         </div>
                                     </div>
                                 ))}
                             </div>
                        </div>
                    ) : (
                        <div className="space-y-4 pl-4 border-l-2 border-slate-100 ml-2">
                            {activities.map(a => (
                                <div key={a.id} className="relative pl-6">
                                    <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-slate-300 ring-4 ring-white"></div>
                                    <p className="text-sm text-slate-600"><span className="font-bold text-slate-900">{a.user}</span> {a.action}</p>
                                    <span className="text-xs text-slate-400 font-medium mt-0.5">{a.time}</span>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

            </div>

            {/* === RIGHT SIDEBAR === */}
            <div className="w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-6 shadow-inner relative z-20 overflow-visible">
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3 px-1 tracking-wider">Add to card</p>
                  <div className="space-y-2 relative">
                     <SidebarBtn icon={User} label="Members" active={activePopover === 'members'} onClick={() => setActivePopover('members')} />
                     <SidebarBtn icon={TagIcon} label="Labels" active={activePopover === 'tags'} onClick={() => { setActivePopover('tags'); setTagView('list'); }} />
                     <SidebarBtn icon={CheckSquare} label="Checklist" active={activePopover === 'checklist'} onClick={() => setActivePopover('checklist')} />
                     <SidebarBtn icon={Calendar} label="Dates" active={activePopover === 'dates'} onClick={() => setActivePopover('dates')} />
                     <SidebarBtn icon={Paperclip} label="Attachment" active={activePopover === 'attachment'} onClick={() => setActivePopover('attachment')} />

                     {/* --- POPOVERS --- */}
                     {activePopover === 'members' && (
                       <PopoverContainer title="Members" onClose={() => setActivePopover(null)}>
                         <div className="space-y-1">
                             <input className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mb-2" placeholder="Search members..."/>
                             {membersList.map(m => (
                                 <button key={m.id} onClick={() => toggleMember(m.id)} className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded flex items-center gap-2 text-sm text-slate-700">
                                     <div className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${m.color}`}>{m.short}</div>
                                     <span className="flex-1">{m.name}</span>
                                     {assignedMembers.includes(m.id) && <CheckCircle2 size={14} className="text-blue-600"/>}
                                 </button>
                             ))}
                         </div>
                       </PopoverContainer>
                     )}

                     {activePopover === 'tags' && (
                       <PopoverContainer title={tagView === 'list' ? "Labels" : tagView === 'create' ? "Create Label" : "Edit Label"} onClose={() => setActivePopover(null)} width="w-80" showBack={tagView !== 'list'} onBack={() => setTagView('list')}>
                         {tagView === 'list' ? (
                            <div className="space-y-1">
                                <input placeholder="Search labels..." className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mb-2 text-slate-900 focus:outline-none focus:border-blue-500" value={tagSearch} onChange={e => setTagSearch(e.target.value)} />
                                <p className="text-xs font-bold text-slate-500 mb-1 mt-2">LABELS</p>
                                {availableTags.filter(t => t.name.toLowerCase().includes(tagSearch.toLowerCase())).map(t => (
                                    <div key={t.id} className="flex items-center gap-2 mb-1 group">
                                        <div onClick={() => toggleTag(t.id)} className={`flex-1 h-8 rounded px-3 flex items-center justify-between text-sm font-bold shadow-sm transition-all cursor-pointer ${t.bgColor} ${t.textColor} hover:opacity-90`}>
                                            {t.name}
                                            {selectedTagIds.includes(t.id) && <CheckCircle2 size={16} />}
                                        </div>
                                        <button onClick={() => startEditTag(t)} className="p-1 text-slate-400 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"><Edit2 size={14}/></button>
                                    </div>
                                ))}
                                <button onClick={startCreateTag} className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg transition-colors">Create a new label</button>
                            </div>
                         ) : (
                            <div className="space-y-3">
                                <div className="h-24 bg-slate-50 rounded-lg flex items-center justify-center mb-2 border border-slate-100">
                                    {/* Fix: Use newTagColor object correctly */}
                                    <span className={`px-4 py-1.5 rounded-md text-sm font-bold shadow-sm ${newTagColor.labelBg} ${newTagColor.labelText}`}>{newTagName || "Label Name"}</span>
                                </div>
                                <input className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500" value={newTagName} onChange={e => setNewTagName(e.target.value)} placeholder="Name" />
                                <div className="grid grid-cols-5 gap-2">
                                    {TAG_COLORS.map(c => (
                                        <div key={c.name} onClick={() => setNewTagColor(c)} className={`h-8 rounded cursor-pointer ${c.bg} ${newTagColor.name === c.name ? 'ring-2 ring-blue-600 ring-offset-1' : 'hover:opacity-80'}`}></div>
                                    ))}
                                </div>
                                <div className="flex gap-2">
                                    <button onClick={tagView === 'create' ? handleCreateTag : handleUpdateTag} className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700">Save</button>
                                    {tagView === 'edit' && <button onClick={handleDeleteTag} className="bg-red-50 text-red-600 px-3 rounded text-sm font-bold hover:bg-red-100">Delete</button>}
                                </div>
                            </div>
                         )}
                       </PopoverContainer>
                     )}

                     {activePopover === 'checklist' && (
                       <PopoverContainer title="Add checklist" onClose={() => setActivePopover(null)}>
                         <div className="space-y-3">
                            <input autoFocus className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-900" placeholder="Title" value={newChecklistTitle} onChange={e => setNewChecklistTitle(e.target.value)} />
                            <button onClick={addChecklistBlock} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700">Add</button>
                         </div>
                       </PopoverContainer>
                     )}

                     {activePopover === 'dates' && (
                       <PopoverContainer title="Dates" onClose={() => setActivePopover(null)} width="w-auto">
                          <div className="p-1"><DayPicker mode="range" defaultMonth={new Date()} selected={dateRange} onSelect={setDateRange} numberOfMonths={1} /></div>
                          <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-xl">
                             <button onClick={() => setDateRange(undefined)} className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200">Clear</button>
                             <button onClick={handleSaveDate} disabled={!dateRange?.from} className="flex-1 bg-blue-600 text-white text-sm font-bold py-1.5 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all">Save</button>
                          </div>
                       </PopoverContainer>
                     )}

                     {activePopover === 'attachment' && (
                       <PopoverContainer title="Attach" onClose={() => setActivePopover(null)}>
                          <div className="flex gap-2 mb-3 border-b border-slate-100 pb-2">
                               <button onClick={() => setAttachmentTab('file')} className={`text-xs font-bold px-2 py-1 rounded ${attachmentTab === 'file' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>Computer</button>
                               <button onClick={() => setAttachmentTab('link')} className={`text-xs font-bold px-2 py-1 rounded ${attachmentTab === 'link' ? 'bg-blue-50 text-blue-600' : 'text-slate-500'}`}>Link</button>
                          </div>
                          {attachmentTab === 'file' ? (
                               <div className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center text-xs text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all" onClick={() => fileInputRef.current?.click()}>
                                   <UploadCloud size={24} className="mx-auto mb-2 text-slate-400"/> Click to upload file
                                   <input type="file" className="hidden" ref={fileInputRef} onChange={(e) => { if(e.target.files?.[0]) handleAddAttachment('file', e.target.files[0].name); }} />
                               </div>
                           ) : (
                               <div className="space-y-3">
                                   <input placeholder="Paste any link..." className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900" value={linkUrl} onChange={e => setLinkUrl(e.target.value)} />
                                   <input placeholder="Link name (optional)" className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900" value={linkText} onChange={e => setLinkText(e.target.value)} />
                                   <button onClick={() => handleAddAttachment('link', linkUrl, linkText)} className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700">Attach</button>
                               </div>
                           )}
                       </PopoverContainer>
                     )}
                  </div>
               </div>
               <div>
                  <p className="text-xs font-bold text-slate-500 uppercase mb-3 px-1 tracking-wider">Actions</p>
                  <div className="space-y-2">
                     <SidebarBtn icon={Layout} label="Cover" />
                     <SidebarBtn icon={Trash2} label="Delete" />
                  </div>
               </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// --- 5. Helper Components ---
const SidebarBtn = ({ icon: Icon, label, onClick, active }: any) => (
  <button onClick={onClick} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active ? 'bg-blue-100 text-blue-700 ring-1 ring-blue-300 shadow-sm' : 'text-slate-700 hover:bg-slate-200/70 active:bg-slate-200'}`}>
    <Icon size={18} className={active ? "text-blue-600" : "text-slate-500"} /> {label}
  </button>
);

const PopoverContainer = ({ title, onClose, children, width = "w-80", showBack, onBack }: { title: any; onClose: () => void; children?: React.ReactNode; width?: string; showBack?: boolean; onBack?: () => void }) => (
  <div className={`absolute top-0 right-[105%] mr-2 ${width} bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 slide-in-from-right-4 overflow-hidden ring-1 ring-slate-900/5`}>
    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50 relative">
      {showBack ? (
          <button onClick={onBack} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50"><ChevronLeft size={18}/></button>
      ) : <div className="w-6"></div>}
      <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
      <button onClick={onClose} className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50 transition-colors"><X size={16} /></button>
    </div>
    <div className="p-4">{children}</div>
  </div>
);