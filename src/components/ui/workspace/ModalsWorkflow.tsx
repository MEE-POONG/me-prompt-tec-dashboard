import React, { useState, useRef, useEffect } from "react";
import { createPortal } from "react-dom";
import {
  X,
  CheckCircle2, // ใช้ Icon นี้สำหรับปุ่มเสร็จสิ้น
  CheckSquare,
  Tag as TagIcon,
  Calendar,
  Paperclip,
  Plus,
  MoreHorizontal,
  Layout,
  Trash2,
  ChevronRight,
  ChevronLeft,
  Link as LinkIcon,
  FileText,
  AlignLeft,
  MessageSquare,
  Activity,
  Send,
  Edit2,
  Smile,
  UploadCloud,
  User,
  Monitor,
  Search,
  Clock,
  GripVertical,
  Archive,
  Copy,
  Save as SaveIcon,
  File as FileIcon,
  Download,
} from "lucide-react";
import { format } from "date-fns";
import { DayPicker, DateRange } from "react-day-picker";
import "react-day-picker/dist/style.css";
import {
  getTask,
  updateTask,
  getActivities,
  createActivity,
  getMembers,
  getChecklistItems,
  createChecklistItem,
  updateChecklistItem,
  deleteChecklistItem,
  getComments,
  createComment,
  updateComment,
  deleteComment as apiDeleteComment,
  getLabels,
  createLabel,
  updateLabel,
  deleteLabel,
  getColumns,
  createColumn,
  deleteTask,
} from "@/lib/api/workspace";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ModalDelete from "@/components/ui/Modals/ModalsDelete";

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
interface Member {
  id: string;
  name: string;
  color: string;
  short: string;
  userId?: string;
  avatar?: string;
  userAvatar?: string;
}
interface TagItem {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
}
interface CheckItem {
  id: string;
  text: string;
  isChecked: boolean;
}
interface AttachmentItem {
  id: string;
  type: "file" | "link";
  name: string;
  url?: string;
  date: string;
}
interface ActivityLog {
  id: string;
  user: string | { id: string; name: string; avatar?: string };
  action: string;
  time: string;
}
interface Comment {
  id: string;
  user: string | { id: string; name: string; avatar?: string };
  text: string;
  time: string;
  color: string;
  isEdited?: boolean;
}

interface ContentBlock {
  id: string;
  type: "checklist" | "attachment";
  title?: string;
  items?: CheckItem[];
  attachments?: AttachmentItem[];
}

// --- 3. Mock Data & Constants (เพิ่ม INITIAL_TAGS กลับมา) ---
const ALL_MEMBERS: Member[] = [
  { id: "1", name: "Poom", color: "bg-blue-600", short: "P" },
  { id: "2", name: "Jame", color: "bg-emerald-600", short: "J" },
];

const TAG_COLORS = [
  {
    name: "green",
    bg: "bg-green-500",
    text: "text-white",
    labelBg: "bg-green-100",
    labelText: "text-green-700",
  },
  {
    name: "yellow",
    bg: "bg-yellow-500",
    text: "text-white",
    labelBg: "bg-yellow-100",
    labelText: "text-yellow-700",
  },
  {
    name: "orange",
    bg: "bg-orange-500",
    text: "text-white",
    labelBg: "bg-orange-100",
    labelText: "text-orange-700",
  },
  {
    name: "red",
    bg: "bg-red-500",
    text: "text-white",
    labelBg: "bg-red-100",
    labelText: "text-red-700",
  },
  {
    name: "purple",
    bg: "bg-purple-500",
    text: "text-white",
    labelBg: "bg-purple-100",
    labelText: "text-purple-700",
  },
  {
    name: "blue",
    bg: "bg-blue-500",
    text: "text-white",
    labelBg: "bg-blue-100",
    labelText: "text-blue-700",
  },
];

// ✅ [FIX] เพิ่ม INITIAL_TAGS ที่หายไป
const INITIAL_TAGS: TagItem[] = [
  {
    id: "1",
    name: "High Priority",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    id: "2",
    name: "Design",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    id: "3",
    name: "Dev",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
];

const EMOJI_LIST = [
  "👍",
  "👎",
  "😀",
  "😂",
  "🥰",
  "😎",
  "🎉",
  "🚀",
  "👀",
  "✅",
  "❌",
  "🔥",
  "❤️",
  "✨",
  "💡",
  "🙏",
  "🤔",
  "😭",
  "😡",
  "😴",
];

// Helper: Extract Filename for display from a single file string
const getFileNameFromCode = (code: string) => {
  const match = /\[file::(.*?)::/.exec(code);
  return match ? match[1] : "Unknown File";
};

// Helper: Render Comment Content (Download Links)
const renderCommentContent = (text: string) => {
  const fileRegex = /\[file::(.*?)::(.*?)\]/g;
  const parts = [];
  let lastIndex = 0;
  let match;

  while ((match = fileRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      // Render text before the file (trim newlines if it's just spacing)
      parts.push(
        <span key={`text-${lastIndex}`}>
          {text.substring(lastIndex, match.index)}
        </span>
      );
    }
    const fileName = match[1];
    const fileData = match[2];
    parts.push(
      <div key={`file-${match.index}`} className="block my-1">
        <a
          href={fileData}
          download={fileName}
          className="inline-flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-3 py-2 rounded-lg border border-blue-200 transition-colors font-semibold no-underline"
        >
          <FileIcon size={16} />
          {fileName}
          <Download size={14} className="ml-1 opacity-50" />
        </a>
      </div>
    );
    lastIndex = fileRegex.lastIndex;
  }
  if (lastIndex < text.length) {
    parts.push(<span key={`text-end`}>{text.substring(lastIndex)}</span>);
  }
  return parts.length > 0 ? parts : text;
};

// --- 4. Main Component ---
export default function ModalsWorkflow({
  isOpen,
  onClose,
  task,
  onTaskUpdated,
}: {
  isOpen: boolean;
  onClose: () => void;
  task?: any;
  onTaskUpdated?: () => void;
}) {
  // State
  const [title, setTitle] = useState("Website Redesign");
  const [desc, setDesc] = useState("");
  const [activeTab, setActiveTab] = useState<"comments" | "activity">(
    "comments"
  );
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [blocks, setBlocks] = useState<ContentBlock[]>([]);
  const [isSavingDate, setIsSavingDate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Metadata State
  const [assignedMembers, setAssignedMembers] = useState<string[]>(["1"]);
  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [availableTags, setAvailableTags] = useState<TagItem[]>(INITIAL_TAGS);

  // [NEW] Status State
  const [isCompleted, setIsCompleted] = useState(false);

  // Custom Modal States
  const [successModal, setSuccessModal] = useState({
    open: false,
    message: "",
    description: "",
  });
  const [errorModal, setErrorModal] = useState({
    open: false,
    message: "",
    description: "",
  });
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const [deleteModal, setDeleteModal] = useState({
    open: false,
    message: "",
    onConfirm: () => { },
  });

  // Activities & Comments State
  const [comments, setComments] = useState<Comment[]>([]);
  const [activities, setActivities] = useState<ActivityLog[]>([
    { id: "1", user: "System", action: "created this task", time: "Yesterday" },
  ]);
  const [commentInput, setCommentInput] = useState("");
  const [isEmojiOpen, setIsEmojiOpen] = useState(false);

  // ✅ Edit Comment State (Improved for Multiple Files)
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingText, setEditingText] = useState("");
  const [editingFileParts, setEditingFileParts] = useState<string[]>([]);

  // ✅ Comment File Upload State
  const [commentFile, setCommentFile] = useState<File | null>(null);
  const [commentFiles, setCommentFiles] = useState<File[]>([]);

  // Popover State
  const [activePopover, setActivePopover] = useState<string | null>(null);

  // Temporary Inputs for Popovers
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [tagSearch, setTagSearch] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const [attachmentTab, setAttachmentTab] = useState<"file" | "link">("file");

  // Tag Editing State
  const [tagView, setTagView] = useState<"list" | "create" | "edit">("list");
  const [editingTagId, setEditingTagId] = useState<string | null>(null);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState(TAG_COLORS[0]);

  // Refs
  const fileInputRef = useRef<HTMLInputElement>(null);
  const chatFileRef = useRef<HTMLInputElement>(null);
  const emojiRef = useRef<HTMLDivElement>(null);

  // API-connected state
  const [boardId, setBoardId] = useState<string | null>(null);
  const [taskId, setTaskId] = useState<string | null>(null);
  const [loadingTask, setLoadingTask] = useState(false);
  const [membersList, setMembersList] = useState<Member[]>(ALL_MEMBERS);
  const [checklistCount, setChecklistCount] = useState(0);

  // More dropdown state
  const [moreOpen, setMoreOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement | null>(null);
  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const [dropdownStyle, setDropdownStyle] =
    useState<React.CSSProperties | null>(null);
  const portalNodeRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const node = document.createElement("div");
    node.className = "modal-dropdown-portal";
    document.body.appendChild(node);
    portalNodeRef.current = node;
    return () => {
      try {
        document.body.removeChild(node);
      } catch (e) {
        /* ignore */
      }
      portalNodeRef.current = null;
    };
  }, []);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (emojiRef.current && !emojiRef.current.contains(e.target as Node)) {
        setIsEmojiOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  useEffect(() => {
    const u = localStorage.getItem("user");
    if (u) {
      try {
        setCurrentUser(JSON.parse(u));
      } catch (e) { }
    }
  }, []);

  // --- Effect: Load full task when modal opens ---
  useEffect(() => {
    const load = async () => {
      if (!isOpen || !task?.id) return;
      setBlocks([]);
      setAvailableTags(INITIAL_TAGS);
      setSelectedTagIds([]);
      setEditingCommentId(null);
      setCommentFiles([]); // Reset files
      try {
        setLoadingTask(true);
        const data: any = await getTask(String(task.id));
        setTaskId(data.id);
        setTitle(data.title || "Untitled Task");
        setDesc(data.description || "");
        setChecklistCount(data.checklist || 0);

        // [NEW] Check Status
        if (data.status === "Done" || data.status === "Completed") {
          setIsCompleted(true);
        } else {
          setIsCompleted(false);
        }

        const currentMembers = membersList; // Use current state
        const assignedIds = (data.assignees || [])
          .map((a: any) => {
            const uid = a.userId || a.user?.id;
            // Find board member by userId
            const member = currentMembers.find((m) => m.userId === uid);
            return member ? member.id : null;
          })
          .filter((id: any) => id !== null);
        setAssignedMembers(assignedIds);

        setBoardId(data.column?.board?.id || data.column?.boardId || null);

        if (data.startDate || data.endDate) {
          try {
            const from = data.startDate
              ? new Date(data.startDate)
              : data.dueDate
                ? new Date(data.dueDate)
                : undefined;
            const to = data.endDate ? new Date(data.endDate) : undefined;
            if (from && !isNaN(from.getTime())) setDateRange({ from, to });
            else setDateRange(undefined);
          } catch (e) {
            setDateRange(undefined);
          }
        } else if (data.dueDate) {
          try {
            const dt = new Date(data.dueDate);
            if (!isNaN(dt.getTime())) setDateRange({ from: dt, to: undefined });
            else setDateRange(undefined);
          } catch (e) {
            setDateRange(undefined);
          }
        } else {
          setDateRange(undefined);
        }

        if (data.column?.board?.id) {
          const boardId = String(data.column.board.id);
          const acts: any[] = await getActivities(boardId, undefined, data.id);
          setActivities(
            acts.map((a) => ({
              id: a.id,
              user: a.user,
              action: `${a.action} ${a.target || ""}`.trim(),
              time: new Date(a.createdAt).toLocaleString(),
            }))
          );

          try {
            const mems: any[] = await getMembers(boardId);
            setMembersList(
              mems.map((m) => ({
                id: m.id,
                name: m.name || m.user || "Member",
                color: m.color || "bg-slate-400",
                short: (m.name || "M").slice(0, 1).toUpperCase(),
                userId: m.userId,
                avatar: m.avatar,
                userAvatar: m.userAvatar,
              }))
            );
            const taskUserIds = (data.assignees || []).map(
              (a: any) => a.userId
            );
            const matchedBoardIds = mems
              .filter((m: any) => taskUserIds.includes(m.userId))
              .map((m: any) => m.id);
            setAssignedMembers(matchedBoardIds);
          } catch (err) { }

          let currentLabels: TagItem[] = [];
          try {
            const labels: any[] = await getLabels(boardId);
            if (labels.length > 0) {
              currentLabels = labels.map((L) => ({
                id: L.id,
                name: L.name,
                color: L.color,
                bgColor: L.bgColor,
                textColor: L.textColor,
              }));
            } else {
              currentLabels = [...INITIAL_TAGS];
            }
            setAvailableTags(currentLabels);
          } catch (err) {
            currentLabels = [...INITIAL_TAGS];
            setAvailableTags(currentLabels);
          }

          try {
            const checklistItems: any[] = await getChecklistItems(data.id);
            if (checklistItems.length > 0) {
              const blockId = `checklist-${Date.now()}`;
              const checklistBlock: ContentBlock = {
                id: blockId,
                type: "checklist",
                title: "Checklist",
                items: checklistItems.map((ci: any) => ({
                  id: ci.id,
                  text: ci.text,
                  isChecked: ci.isChecked,
                })),
              };
              setBlocks([checklistBlock]);
            } else {
              setBlocks([]);
            }
          } catch (err) {
            setBlocks([]);
          }

          try {
            if (data.tag) {
              const found = currentLabels.find((t) => t.name === data.tag);
              if (found) setSelectedTagIds([found.id]);
              else {
                const newId = Date.now().toString();
                const newTag: TagItem = {
                  id: newId,
                  name: data.tag,
                  color: data.tagColor || "blue",
                  bgColor: "bg-slate-100",
                  textColor: "text-slate-700",
                };
                setAvailableTags((prev) => [...prev, newTag]);
                setSelectedTagIds([newId]);
              }
            }
          } catch (e) { }

          try {
            const coms: any[] = await getComments(data.id);
            setComments(
              coms.map((c) => ({
                id: c.id,
                user: c.user || c.author || "Unknown",
                text: c.content,
                time: new Date(c.createdAt).toLocaleString(),
                color: "bg-slate-400",
                isEdited: c.updatedAt && c.updatedAt !== c.createdAt,
              }))
            );
          } catch (e) { }
        }
      } catch (err) {
        console.error("Failed to load task", err);
      } finally {
        setLoadingTask(false);
      }
    };
    load();
    return () => {
      if (!isOpen) setBlocks([]);
    };
  }, [isOpen, task?.id]);

  useEffect(() => {
    if (!isOpen || !taskId) return;
    const channel = `task:${taskId}`;
    const es = new EventSource(
      `/api/realtime/stream?channel=${encodeURIComponent(channel)}`
    );

    es.onmessage = (ev) => {
      try {
        const data = JSON.parse(ev.data);
        const { type, payload } = data;
        if (!type) return;

        if (type === "checklist:created") {
          const item = payload;
          setBlocks((prev) => {
            const idx = prev.findIndex((b) => b.type === "checklist");

            // 1. If Checklist block doesn't exist, create it
            if (idx === -1) {
              return [
                {
                  id: `checklist-${Date.now()}`,
                  type: "checklist",
                  title: "Checklist",
                  items: [
                    { id: item.id, text: item.text, isChecked: item.isChecked },
                  ],
                },
                ...prev,
              ];
            }

            // 2. [FIXED] Strict duplicate check
            // Use .some() to prevent duplicates if SSE fires after local update
            const currentBlock = prev[idx];

            // Normalize incoming text and existing text for comparison
            const incomingText = item.text ? item.text.trim() : "";

            const exists = currentBlock.items?.some(
              (i) =>
                i.id === item.id ||
                (i.id.startsWith("temp-") && i.text.trim() === incomingText)
            );

            if (exists) {
              // If it already exists (likely from optimistic update), do NOT add again
              return prev;
            }

            // 3. Otherwise, append the new item
            return prev.map((b) =>
              b.type === "checklist"
                ? {
                  ...b,
                  items: [
                    ...(b.items || []),
                    {
                      id: item.id,
                      text: item.text,
                      isChecked: item.isChecked,
                    },
                  ],
                }
                : b
            );
          });
        }
        if (type === "checklist:updated") {
          const item = payload;
          setBlocks((prev) =>
            prev.map((b) =>
              b.type === "checklist"
                ? {
                  ...b,
                  items: b.items?.map((i) =>
                    i.id === item.id
                      ? {
                        id: item.id,
                        text: item.text,
                        isChecked: item.isChecked,
                      }
                      : i
                  ),
                }
                : b
            )
          );
        }
        if (type === "checklist:deleted") {
          const { id } = payload;
          setBlocks((prev) =>
            prev.map((b) =>
              b.type === "checklist"
                ? { ...b, items: b.items?.filter((i) => i.id !== id) }
                : b
            )
          );
        }
        if (type === "comment:created") {
          const c = payload;
          setComments((prev) => [
            {
              id: c.id,
              user: c.author || "Unknown",
              text: c.content,
              time: new Date(c.createdAt).toLocaleString(),
              color: "bg-slate-400",
            },
            ...prev,
          ]);
        }
        if (type === "comment:updated") {
          const c = payload;
          setComments((prev) =>
            prev.map((cm) =>
              cm.id === c.id
                ? {
                  id: c.id,
                  user: c.author || "Unknown",
                  text: c.content,
                  time: new Date(c.updatedAt || c.createdAt).toLocaleString(),
                  color: "bg-slate-400",
                  isEdited: true,
                }
                : cm
            )
          );
        }
        if (type === "comment:deleted") {
          const { id } = payload;
          setComments((prev) => prev.filter((cm) => cm.id !== id));
        }
        if (type === "activity:created") {
          const a = payload;
          setActivities((prev) => [
            {
              id: a.id,
              user: a.user,
              action: `${a.action} ${a.target || ""}`.trim(),
              time: new Date(a.createdAt).toLocaleString(),
            },
            ...prev,
          ]);
        }
      } catch (e) {
        console.error("Invalid SSE payload", e);
      }
    };
    es.onerror = (e) => {
      es.close();
    };
    return () => es.close();
  }, [isOpen, taskId]);

  useEffect(() => {
    if (!isOpen) {
      setMoreOpen(false);
      setDropdownStyle(null);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!(e.target instanceof Node)) return;
      const insideMenu = menuRef.current && menuRef.current.contains(e.target);
      const insideDropdown =
        dropdownRef.current && dropdownRef.current.contains(e.target);
      if (!insideMenu && !insideDropdown) {
        setMoreOpen(false);
        setDropdownStyle(null);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [menuRef, dropdownRef]);

  const toggleMore = () => {
    const open = !moreOpen;
    if (open && menuRef.current) {
      const rect = menuRef.current.getBoundingClientRect();
      const width = 176;
      let left = rect.right - width;
      if (left < 8) left = rect.left;
      const top = rect.bottom + 6 + window.scrollY;
      setDropdownStyle({
        position: "fixed",
        top,
        left,
        minWidth: width,
        zIndex: 9999,
      });
    } else {
      setDropdownStyle(null);
    }
    setMoreOpen(open);
  };

  useEffect(() => {
    if (!moreOpen) return;
    const reposition = () => {
      if (!menuRef.current) return;
      const rect = menuRef.current.getBoundingClientRect();
      const width = 176;
      let left = rect.right - width;
      if (left < 8) left = rect.left;
      const top = rect.bottom + 6 + window.scrollY;
      setDropdownStyle({
        position: "fixed",
        top,
        left,
        minWidth: width,
        zIndex: 9999,
      });
    };
    window.addEventListener("resize", reposition);
    window.addEventListener("scroll", reposition, true);
    return () => {
      window.removeEventListener("resize", reposition);
      window.removeEventListener("scroll", reposition, true);
    };
  }, [moreOpen]);

  const logActivity = (action: string) => {
    setActivities((prev) => [
      {
        id: Date.now().toString(),
        user: "You",
        action,
        time: new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      },
      ...prev,
    ]);
    if (boardId)
      createActivity({
        boardId,
        user: "You",
        action,
        target: title,
        projectId: boardId,
        taskId: taskId || undefined,
      }).catch((e) => console.error("createActivity failed", e));
  };

  // ... (Archive & Delete handlers same as before) ...
  const handleArchiveTask = async () => {
    if (!taskId || !boardId) return;
    setDeleteModal({
      open: true,
      message: "ต้องการย้ายงานนี้ไปยังหน้าคลังเก็บงาน (Archive) ใช่หรือไม่?",
      onConfirm: async () => {
        try {
          setIsSaving(true);
          await updateTask(String(taskId), { isArchived: true });
          await createActivity({
            boardId: String(boardId),
            user: "You",
            action: "archived",
            target: title,
            projectId: String(boardId),
            taskId: taskId || undefined,
          });
          logActivity("archived this task");
          try {
            onTaskUpdated?.();
          } catch (e) {
            /* ignore */
          }
          onClose();
        } catch (err) {
          console.error("Failed to archive task", err);
          setErrorModal({
            open: true,
            message: "เกิดข้อผิดพลาด!",
            description: "ไม่สามารถย้ายงานไปยังคลังเก็บงานได้",
          });
        } finally {
          setIsSaving(false);
          setMoreOpen(false);
        }
      },
    });
  };

  const handleDeleteTask = async () => {
    if (!taskId) return;
    setDeleteModal({
      open: true,
      message:
        "ต้องการลบงานนี้อย่างถาวรใช่หรือไม่? การกระทำนี้ไม่สามารถย้อนกลับได้",
      onConfirm: async () => {
        try {
          setIsSaving(true);
          await deleteTask(String(taskId));
          await createActivity({
            boardId: String(boardId),
            user: "You",
            action: "deleted",
            target: title,
            projectId: String(boardId),
            taskId: taskId || undefined,
          });
          logActivity("deleted");
          try {
            onTaskUpdated?.();
          } catch (e) {
            /* ignore */
          }
          onClose();
        } catch (err: any) {
          // console.error("Failed to delete task", err);
          setErrorModal({
            open: true,
            message: "ไม่สามารถลบงานได้",
            description: err.message || "คุณไม่มีสิทธิ์ลบงานนี้",
          });
        } finally {
          setIsSaving(false);
          setMoreOpen(false);
        }
      },
    });
  };

  // ... (Tag, Checklist, Attachment handlers same as before) ...
  const handleCreateTag = async () => {
    if (!newTagName.trim() || !boardId) return;
    try {
      const created = await createLabel({
        boardId,
        name: newTagName,
        color: newTagColor.name,
        bgColor: newTagColor.labelBg,
        textColor: newTagColor.labelText,
      });
      const newTag: TagItem = {
        id: created.id,
        name: created.name,
        color: created.color,
        bgColor: created.bgColor,
        textColor: created.textColor,
      };
      setAvailableTags((prev) => [...prev, newTag]);
      setSelectedTagIds((prev) => [...prev, newTag.id]);
      setTagView("list");
      setNewTagName("");
      logActivity(`created label "${newTagName}"`);
    } catch (err: any) {
      // console.error("Failed to create tag", err);
      setErrorModal({
        open: true,
        message: "ไม่สามารถสร้างป้ายชื่อได้",
        description: err.message || "คุณไม่มีสิทธิ์แก้ไขป้ายชื่อ",
      });
    }
  };

  const isValidObjectId = (id: string | null | undefined) => {
    if (!id || typeof id !== "string") return false;
    return /^[a-fA-F0-9]{24}$/.test(id);
  };

  const handleUpdateTag = async () => {
    if (editingTagId && newTagName.trim()) {
      try {
        if (!isValidObjectId(editingTagId)) {
          if (!boardId) throw new Error("No board context");
          const created = await createLabel({
            boardId,
            name: newTagName,
            color: newTagColor.name,
            bgColor: newTagColor.labelBg,
            textColor: newTagColor.labelText,
          });
          const createdTag: TagItem = {
            id: created.id,
            name: created.name,
            color: created.color,
            bgColor: created.bgColor,
            textColor: created.textColor,
          };
          setAvailableTags((prev) =>
            prev.map((t) => (t.id === editingTagId ? createdTag : t))
          );
          setSelectedTagIds((prev) =>
            prev.map((id) => (id === editingTagId ? created.id : id))
          );
          setTagView("list");
          setEditingTagId(null);
          setNewTagName("");
          logActivity(`created label "${newTagName}"`);
          return;
        }
        const updated = await updateLabel(editingTagId, {
          name: newTagName,
          color: newTagColor.name,
          bgColor: newTagColor.labelBg,
          textColor: newTagColor.labelText,
        });
        const updatedTag: TagItem = {
          id: updated.id,
          name: updated.name,
          color: updated.color,
          bgColor: updated.bgColor,
          textColor: updated.textColor,
        };
        setAvailableTags((prev) =>
          prev.map((t) => (t.id === editingTagId ? updatedTag : t))
        );
        setTagView("list");
        setEditingTagId(null);
        setNewTagName("");
        logActivity(`updated label "${newTagName}"`);
      } catch (err) {
        console.error("Failed to update tag", err);
      }
    }
  };

  const handleDeleteTag = async () => {
    if (editingTagId) {
      setDeleteModal({
        open: true,
        message: "ต้องการลบป้ายชื่อนี้ใช่หรือไม่?",
        onConfirm: async () => {
          try {
            const tagToDelete = availableTags.find(
              (t) => t.id === editingTagId
            );
            if (!isValidObjectId(editingTagId)) {
              setAvailableTags((prev) =>
                prev.filter((t) => t.id !== editingTagId)
              );
              setSelectedTagIds((prev) =>
                prev.filter((id) => id !== editingTagId)
              );
              setTagView("list");
              setEditingTagId(null);
              setNewTagName("");
              logActivity(`deleted label "${tagToDelete?.name}"`);
              return;
            }
            await deleteLabel(editingTagId);
            setAvailableTags((prev) =>
              prev.filter((t) => t.id !== editingTagId)
            );
            setSelectedTagIds((prev) =>
              prev.filter((id) => id !== editingTagId)
            );
            setTagView("list");
            setEditingTagId(null);
            setNewTagName("");
            logActivity(`deleted label "${tagToDelete?.name}"`);
          } catch (err) {
            console.error("Failed to delete tag", err);
          }
        },
      });
    }
  };

  const startEditTag = (tag: TagItem) => {
    setEditingTagId(tag.id);
    setNewTagName(tag.name);
    setNewTagColor(
      TAG_COLORS.find((c) => c.name === tag.color) || TAG_COLORS[0]
    );
    setTagView("edit");
  };
  const startCreateTag = () => {
    setEditingTagId(null);
    setNewTagName("");
    setNewTagColor(TAG_COLORS[0]);
    setTagView("create");
  };
  const toggleTag = (tagId: string) => {
    const tag = availableTags.find((t) => t.id === tagId);
    if (!tag) return;
    (async () => {
      if (!taskId) {
        if (selectedTagIds.includes(tagId))
          setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
        else setSelectedTagIds([tagId]);
        return;
      }
      if (selectedTagIds.includes(tagId)) {
        setSelectedTagIds((prev) => prev.filter((id) => id !== tagId));
        try {
          await updateTask(String(taskId), {
            tag: undefined,
            tagColor: undefined,
          });
          logActivity(`removed label "${tag.name}"`);
        } catch (err) {
          console.error("Failed to remove tag from task", err);
        }
      } else {
        setSelectedTagIds([tagId]);
        try {
          await updateTask(String(taskId), {
            tag: tag.name,
            tagColor: tag.color,
          });
          logActivity(`added label "${tag.name}"`);
        } catch (err) {
          console.error("Failed to set tag on task", err);
        }
      }
    })();
  };

  const addChecklistBlock = async () => {
    const titleText = newChecklistTitle.trim() || "Checklist";
    setBlocks((prev) => [
      ...prev,
      {
        id: Date.now().toString(),
        type: "checklist",
        title: titleText,
        items: [],
      },
    ]);
    logActivity(`added checklist "${titleText}"`);
    setNewChecklistTitle("");
    setActivePopover(null);
    if (taskId) {
      try {
        const newCount = checklistCount + 1;
        setChecklistCount(newCount);
        await updateTask(String(taskId), { checklist: newCount });
      } catch (err) {
        console.error("Failed to update checklist count", err);
      }
    }
  };
  const addChecklistItem = async (blockId: string, text: string) => {
    // ✅ Fix: Trim text immediately to prevent whitespace duplicates
    const trimmedText = text.trim();
    if (!trimmedText || !taskId) return;

    const tempId = `temp-${Date.now()}`;

    // Add temp item with trimmed text
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
            ...b,
            items: [
              ...(b.items || []),
              { id: tempId, text: trimmedText, isChecked: false },
            ],
          }
          : b
      )
    );
    try {
      // Send trimmed text to API
      const created = await createChecklistItem({
        taskId: String(taskId),
        text: trimmedText,
        isChecked: false,
        order: 0,
      });
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
              ...b,
              items: b.items?.map((i) =>
                i.id === tempId
                  ? {
                    id: created.id,
                    text: created.text,
                    isChecked: created.isChecked,
                  }
                  : i
              ),
            }
            : b
        )
      );
      logActivity(`added checklist item "${trimmedText}"`);
    } catch (err) {
      console.error("Failed to create checklist item", err);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? { ...b, items: b.items?.filter((i) => i.id !== tempId) }
            : b
        )
      );
    }
  };
  const toggleCheckItem = async (blockId: string, itemId: string) => {
    const currentBlock = blocks.find((b) => b.id === blockId);
    const currentItem = currentBlock?.items?.find((i) => i.id === itemId);
    const newCheckedState = !!currentItem ? !currentItem.isChecked : true;
    setBlocks((prev) =>
      prev.map((b) => {
        if (b.id === blockId) {
          const updated = b.items?.map((i) =>
            i.id === itemId ? { ...i, isChecked: !i.isChecked } : i
          );
          return { ...b, items: updated };
        }
        return b;
      })
    );
    try {
      if (itemId.startsWith("temp-")) {
        const tempText = currentItem?.text;
        if (taskId && tempText !== undefined) {
          const created = await createChecklistItem({
            taskId: String(taskId),
            text: tempText,
            isChecked: newCheckedState,
            order: 0,
          });
          setBlocks((prev) =>
            prev.map((b) =>
              b.id === blockId
                ? {
                  ...b,
                  items: b.items?.map((i) =>
                    i.id === itemId
                      ? {
                        id: created.id,
                        text: created.text,
                        isChecked: created.isChecked,
                      }
                      : i
                  ),
                }
                : b
            )
          );
        }
      } else {
        const updated = await updateChecklistItem(itemId, {
          isChecked: newCheckedState,
        });
        setBlocks((prev) =>
          prev.map((b) =>
            b.id === blockId
              ? {
                ...b,
                items: b.items?.map((i) =>
                  i.id === itemId
                    ? {
                      id: updated.id,
                      text: updated.text,
                      isChecked: updated.isChecked,
                    }
                    : i
                ),
              }
              : b
          )
        );
      }
    } catch (err) {
      console.error("Failed to toggle check item", err);
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === blockId
            ? {
              ...b,
              items: b.items?.map((i) =>
                i.id === itemId
                  ? { ...i, isChecked: currentItem?.isChecked ?? false }
                  : i
              ),
            }
            : b
        )
      );
    }
  };
  const deleteCheckItem = async (blockId: string, itemId: string) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? { ...b, items: b.items?.filter((i) => i.id !== itemId) }
          : b
      )
    );
    try {
      if (!itemId.startsWith("temp-")) {
        await deleteChecklistItem(itemId);
        logActivity("deleted checklist item");
      }
    } catch (err) {
      console.error("Failed to delete check item", err);
    }
  };
  const updateCheckItem = async (
    blockId: string,
    itemId: string,
    text: string
  ) => {
    setBlocks((prev) =>
      prev.map((b) =>
        b.id === blockId
          ? {
            ...b,
            items: b.items?.map((i) =>
              i.id === itemId ? { ...i, text } : i
            ),
          }
          : b
      )
    );
    try {
      if (!itemId.startsWith("temp-")) {
        await updateChecklistItem(itemId, { text });
        logActivity(`updated checklist item to "${text}"`);
      }
    } catch (err) {
      console.error("Failed to update check item", err);
    }
  };
  const deleteBlock = async (blockId: string) => {
    setDeleteModal({
      open: true,
      message: "ต้องการลบส่วนนี้ใช่หรือไม่?",
      onConfirm: async () => {
        const block = blocks.find((b) => b.id === blockId);
        setBlocks((prev) => prev.filter((b) => b.id !== blockId));
        logActivity("removed a block");
        if (block?.type === "checklist" && taskId) {
          try {
            const newCount = Math.max(0, checklistCount - 1);
            setChecklistCount(newCount);
            await updateTask(String(taskId), { checklist: newCount });
          } catch (err) {
            console.error("Failed to update checklist count", err);
          }
        }
      },
    });
  };

  const handleAddAttachment = async (
    type: "link" | "file",
    val1: string,
    val2?: string
  ) => {
    const newItem: AttachmentItem = {
      id: Date.now().toString(),
      type,
      name: val2 || val1,
      url: type === "link" ? val1 : undefined,
      date: new Date().toLocaleDateString(),
    };
    const existing = blocks.find((b) => b.type === "attachment");
    if (existing) {
      setBlocks((prev) =>
        prev.map((b) =>
          b.id === existing.id
            ? { ...b, attachments: [...(b.attachments || []), newItem] }
            : b
        )
      );
    } else {
      setBlocks((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          type: "attachment",
          attachments: [newItem],
        },
      ]);
    }
    logActivity(`attached ${type}`);
    setActivePopover(null);
    setLinkUrl("");
    setLinkText("");
    if (taskId) {
      try {
        await updateTask(String(taskId), {
          attachments: (task?.attachments || 0) + 1,
        });
      } catch (err) {
        console.error("Failed to update attachments count", err);
      }
    }
  };

  // --- Comment System ---

  // ✅ 1. Handle Multiple File Selection
  const handleCommentFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const selectedFiles = Array.from(e.target.files);
      // Validate each file size
      const validFiles = selectedFiles.filter(
        (file) => file.size <= 2 * 1024 * 1024
      ); // Limit 2MB

      if (validFiles.length !== selectedFiles.length) {
        setErrorModal({
          open: true,
          message: "ไฟล์ใหญ่เกินกำหนด!",
          description: "บางไฟล์มีขนาดใหญ่เกิน 2MB และจะไม่ถูกแนบ",
        });
      }

      setCommentFiles((prev) => [...prev, ...validFiles]);
    }
  };

  // ✅ 2. Remove a selected file (before sending)
  const removeCommentFile = (index: number) => {
    setCommentFiles((prev) => prev.filter((_, i) => i !== index));
  };

  // ✅ 3. Send Comment (With Multiple Base64 Files)
  const sendComment = async () => {
    if ((!commentInput.trim() && commentFiles.length === 0) || !taskId) return;

    let content = commentInput.trim();

    // Helper to read file as base64
    const readFileAsBase64 = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = reject;
        reader.readAsDataURL(file);
      });
    };

    try {
      // Convert all files to base64 strings
      const fileStrings = await Promise.all(
        commentFiles.map(async (file) => {
          const base64 = await readFileAsBase64(file);
          return `\n[file::${file.name}::${base64}]`;
        })
      );

      // Append all file strings to content
      const finalContent = content + fileStrings.join("");
      await submitComment(finalContent);

      setCommentFiles([]); // Reset files
    } catch (error) {
      console.error("Error reading files:", error);
    }
  };

  const submitComment = async (content: string) => {
    setCommentInput("");
    if (chatFileRef.current) chatFileRef.current.value = "";

    const temp = {
      id: `temp-${Date.now()}`,
      user: "You",
      text: content,
      time: "Just now",
      color: "bg-blue-600",
    };
    setComments((prev) => [temp, ...prev]);

    try {
      const created: any = await createComment({
        taskId: String(taskId),
        content,
        author: "You",
      });
      setComments((prev) =>
        prev.map((c) =>
          c.id === temp.id
            ? {
              id: created.id,
              user: created.author || "You",
              text: created.content,
              time: new Date(created.createdAt).toLocaleString(),
              color: "bg-blue-600",
            }
            : c
        )
      );
      if (boardId)
        await createActivity({
          boardId,
          user: "You",
          action: "commented",
          target: title,
          projectId: boardId,
          taskId: taskId || undefined,
        });
      logActivity("commented");
    } catch (err) {
      console.error("Failed to persist comment", err);
      setComments((prev) => prev.filter((c) => !c.id.startsWith("temp-")));
    }
  };

  const deleteComment = async (id: string) => {
    if (!id) return;
    setDeleteModal({
      open: true,
      message: "ต้องการลบคอมเมนต์นี้ใช่หรือไม่?",
      onConfirm: async () => {
        setComments((prev) => prev.filter((c) => c.id !== id));
        try {
          if (!id.startsWith("temp-")) {
            await apiDeleteComment(id);
            logActivity("deleted comment");
          }
        } catch (err) {
          console.error("Failed to delete comment", err);
        }
      },
    });
  };

  // ✅ Handle Start Edit: Extract ALL file codes (Corrected Logic)
  const handleStartEdit = (comment: Comment) => {
    setEditingCommentId(comment.id);

    // 1. แยกไฟล์ทั้งหมดออกมา
    const fileRegex = /\[file::(.*?)::(.*?)\]/g;
    const fileMatches = [...comment.text.matchAll(fileRegex)];
    const fileParts = fileMatches.map((m) => m[0]); // เอามาทั้งก้อน [file::...::...]

    // 2. แยกข้อความออกมา (ลบโค้ดไฟล์ออกให้หมด)
    const textOnly = comment.text.replace(fileRegex, "").trim();

    setEditingText(textOnly);
    setEditingFileParts(fileParts); // เก็บเป็น array ของ string ไฟล์
  };

  const handleCancelEdit = () => {
    setEditingCommentId(null);
    setEditingText("");
    setEditingFileParts([]);
  };

  // ✅ ลบไฟล์ออกจากรายการแก้ไข (ทีละไฟล์)
  const removeEditingFile = (index: number) => {
    setEditingFileParts((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveEdit = async (commentId: string) => {
    // เอาข้อความใหม่ รวมกับไฟล์ที่เหลืออยู่ (เติม \n หน้าแต่ละไฟล์)
    const filesContent =
      editingFileParts.length > 0
        ? editingFileParts.map((part) => "\n" + part).join("")
        : "";
    const finalContent = editingText.trim() + filesContent;

    // Update Local UI
    setComments((prev) =>
      prev.map((c) =>
        c.id === commentId ? { ...c, text: finalContent, isEdited: true } : c
      )
    );

    setEditingCommentId(null);
    setEditingFileParts([]);

    try {
      if (!commentId.startsWith("temp-")) {
        await updateComment(commentId, { content: finalContent });
        logActivity("updated comment");
      }
    } catch (err) {
      console.error("Failed to update comment", err);
    }
  };

  const handleCopyComment = (text: string) => {
    // ลบ code ไฟล์ออกก่อน copy (เพื่อให้ได้เฉพาะข้อความ)
    const cleanText = text.replace(/\[file::.*?::.*?\]/g, "").trim();
    navigator.clipboard.writeText(cleanText || text);
    setSuccessModal({
      open: true,
      message: "คัดลอกสำเร็จ!",
      description: "คัดลอกข้อความเป็นความจำเรียบร้อยแล้ว",
    });
  };

  const toggleMember = async (memberId: string) => {
    if (!taskId) return;
    const newMembers = assignedMembers.includes(memberId)
      ? assignedMembers.filter((id) => id !== memberId)
      : [...assignedMembers, memberId];
    setAssignedMembers(newMembers);

    // Map Board IDs to User IDs for API
    const userIds = newMembers
      .map((bid) => membersList.find((m: any) => m.id === bid)?.userId)
      .filter((id): id is string => !!id);

    try {
      await updateTask(String(taskId), { assigneeIds: userIds });
      const member = membersList.find((m) => m.id === memberId);
      logActivity(
        `${newMembers.includes(memberId) ? "assigned" : "removed"} ${member?.name || memberId
        }`
      );
    } catch (err: any) {
      // console.error("Failed to update assignees", err);
      // Revert state (optimistic update rollback)
      setAssignedMembers(assignedMembers);
      setErrorModal({
        open: true,
        message: "ไม่สามารถอัปเดตสมาชิกได้",
        description: err.message || "คุณไม่มีสิทธิ์ในการแก้ไขงานนี้",
      });
    }
  };

  const handleSaveDate = async () => {
    if (!taskId) return;
    try {
      setIsSavingDate(true);
      const start = dateRange?.from ? dateRange.from.toISOString() : null;
      const end = dateRange?.to ? dateRange.to.toISOString() : null;
      await updateTask(String(taskId), {
        startDate: start,
        endDate: end,
        dueDate: start,
      });
      logActivity(start ? "updated dates" : "cleared due date");
      if (!start) setDateRange(undefined);
      setActivePopover(null);
      try {
        onTaskUpdated?.();
      } catch (e) {
        /* ignore */
      }
    } catch (err) {
      console.error("Failed to save date", err);
    } finally {
      setIsSavingDate(false);
    }
  };

  const saveField = async (data: { title?: string; description?: string }) => {
    if (!taskId) return;
    try {
      await updateTask(String(taskId), data);
      if (data.title) logActivity("updated title");
      if (data.description) logActivity("updated description");
    } catch (err: any) {
      // console.error("Failed to save field", err);
      setErrorModal({
        open: true,
        message: "ไม่สามารถบันทึกข้อมูลได้",
        description: err.message || "คุณไม่มีสิทธิ์ในการแก้ไขงานนี้",
      });
    }
  };

  // [NEW] Toggle Complete
  const handleToggleComplete = async () => {
    if (!taskId) return;

    const newStatus = !isCompleted;
    setIsCompleted(newStatus); // Optimistic

    try {
      // อัปเดต status เป็น 'Done' หรือ 'In Progress'
      // และอาจจะย้าย column ด้วย ถ้า Backend รองรับ (หรือทำ Logic ใน Backend)
      await updateTask(String(taskId), {
        status: newStatus ? "Done" : "In Progress"
      } as any); // ✅ Cast as any to bypass TS error

      logActivity(newStatus ? "marked task as completed" : "reopened task");

      if (onTaskUpdated) onTaskUpdated();
    } catch (err: any) {
      // console.error("Failed to update status", err);
      setIsCompleted(!newStatus); // Revert
      setErrorModal({
        open: true,
        message: "ไม่สามารถอัปเดตสถานะได้",
        description: err.message || "คุณไม่มีสิทธิ์ในการแก้ไขงานนี้",
      });
    }
  };

  const handleSaveAll = async () => {
    if (!taskId) return;
    try {
      setIsSaving(true);

      // ✅ Map Board Member IDs to User IDs
      const userIds = assignedMembers
        .map((mid) => membersList.find((m) => m.id === mid)?.userId)
        .filter((id): id is string => !!id);

      const due = dateRange?.from ? dateRange.from.toISOString() : null;
      const payload: any = { // ✅ Explicitly type as any to fix TS error 2353
        title,
        description: desc,
        assigneeIds: userIds, // ✅ Send User IDs
        dueDate: due,
        checklist: checklistCount,
        status: isCompleted ? "Done" : "In Progress" // Ensure status is saved
      };
      await updateTask(String(taskId), payload);
      logActivity("saved card");

      // ✅ Correct Modal State
      setSuccessModal({
        open: true,
        message: "บันทึกสำเร็จ",
        description: "ข้อมูลงานของคุณได้รับการบันทึกเรียบร้อยแล้ว",
      });

      try {
        onTaskUpdated?.();
      } catch (e) {
        /* ignore */
      }
    } catch (err: any) {
      // console.error("Failed to save card", err);
      setErrorModal({
        open: true,
        message: "ไม่สามารถบันทึกข้อมูลได้",
        description: err.message || "คุณไม่มีสิทธิ์ในการแก้ไขงานนี้",
      });
    } finally {
      setIsSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <>
      <style>{customStyles}</style>
      <div className="fixed inset-0 z-10000 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 animate-in fade-in">
        <div className="bg-white w-full max-w-6xl h-[90vh] rounded-[20px] shadow-2xl overflow-hidden flex flex-col ring-1 ring-slate-200 font-sans relative">
          {/* Header */}
          <div className="bg-white px-6 py-4 flex items-center justify-between border-b border-slate-200 shrink-0 shadow-sm z-10">
            <div className="flex items-center gap-3">

              {/* --- ปุ่มรับงานเดิม (Assign Me) --- */}
              <button
                onClick={() => {
                  const userId = currentUser?.id || currentUser?._id;
                  const myMember = membersList.find((m) => m.userId === userId);

                  if (myMember) {
                    toggleMember(myMember.id);
                  } else {
                    setErrorModal({
                      open: true,
                      message: "ไม่พบข้อมูลสมาชิก",
                      description:
                        "คุณยังไม่ได้เป็นสมาชิกของบอร์ดนี้ กรุณาติดต่อผู้ดูแลเพื่อเชิญเข้าสู่บอร์ด",
                    });
                  }
                }}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 border ${(() => {
                  const userId = currentUser?.id || currentUser?._id;
                  const myMember = membersList.find(
                    (m) => m.userId === userId
                  );
                  return myMember && assignedMembers.includes(myMember.id);
                })()
                  ? "bg-blue-100 text-blue-700 border-blue-200"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
                  }`}
              >
                <CheckCircle2
                  size={16}
                  className={
                    (() => {
                      const userId = currentUser?.id || currentUser?._id;
                      const myMember = membersList.find(
                        (m) => m.userId === userId
                      );
                      return myMember && assignedMembers.includes(myMember.id);
                    })()
                      ? "fill-blue-600 text-white"
                      : "text-slate-400"
                  }
                />
                {(() => {
                  const userId = currentUser?.id || currentUser?._id;
                  const myMember = membersList.find((m) => m.userId === userId);
                  return myMember && assignedMembers.includes(myMember.id);
                })()
                  ? "รับงานแล้ว"
                  : "รับงาน"}
              </button>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              {/* --- [ใหม่] ปุ่มเสร็จสิ้นงาน --- */}
              <button
                onClick={handleToggleComplete}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-bold transition-all shadow-sm active:scale-95 border ${isCompleted
                  ? "bg-green-600 text-white border-green-600 hover:bg-green-700"
                  : "bg-white text-slate-700 border-slate-200 hover:bg-green-50 hover:text-green-600 hover:border-green-200"
                  }`}
              >
                <CheckCircle2 size={16} className={isCompleted ? "text-white" : "text-current"} />
                {isCompleted ? "เสร็จสิ้นแล้ว" : "เสร็จสิ้นงาน"}
              </button>

              <div className="h-6 w-px bg-slate-200 mx-2"></div>

              <div className="flex -space-x-1">
                {assignedMembers.map((id) => {
                  const m = membersList.find((mem) => mem.id === id);
                  const avatarUrl = m?.avatar || m?.userAvatar;
                  // Strict check for valid URL to avoid broken images or empty strings
                  const hasAvatar = avatarUrl && (typeof avatarUrl === 'string') && (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"));

                  return m ? (
                    <div
                      key={id}
                      className={`w-8 h-8 rounded-full border-2 border-white flex items-center justify-center shadow-sm overflow-hidden ${hasAvatar ? "bg-white" : m.color}`}
                    >
                      {hasAvatar ? (
                        <img
                          src={avatarUrl as string}
                          alt={m.name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <span className="text-xs font-bold text-white">
                          {m.short}
                        </span>
                      )}
                    </div>
                  ) : null;
                })}
                <button
                  onClick={() => setActivePopover("members")}
                  className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-slate-400 hover:bg-slate-200 transition-colors"
                >
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex gap-2 items-center">
              <button
                onClick={handleSaveAll}
                disabled={isSaving}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 ${isSaving ? "bg-blue-500" : "bg-blue-600 hover:bg-blue-700"
                  } text-white transition-all disabled:opacity-60`}
              >
                {isSaving ? "Saving..." : "Save"}
              </button>
              <div className="relative" ref={menuRef}>
                <button
                  onClick={toggleMore}
                  className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <MoreHorizontal size={20} />
                </button>
              </div>
              {moreOpen &&
                dropdownStyle &&
                portalNodeRef.current &&
                createPortal(
                  <div
                    ref={dropdownRef}
                    style={dropdownStyle}
                    className="bg-white rounded-md border shadow-lg z-9999"
                  >
                    <button
                      onClick={handleArchiveTask}
                      className="w-full text-left px-4 py-2 hover:bg-slate-50 flex items-center gap-2 text-sm text-slate-700"
                    >
                      <Archive size={16} /> Archive task
                    </button>
                    <button
                      onClick={handleDeleteTask}
                      className="w-full text-left px-4 py-2 hover:bg-red-50 text-red-600 flex items-center gap-2 text-sm"
                    >
                      <Trash2 size={16} /> Delete task
                    </button>
                  </div>,
                  portalNodeRef.current
                )}
              <button
                className="p-2 rounded-lg text-slate-500 hover:bg-slate-100"
                onClick={onClose}
              >
                <X size={20} />
              </button>
            </div>
          </div>

          <div className="flex flex-1 overflow-hidden relative">
            {/* === LEFT CONTENT === */}
            <div className="flex-1 overflow-y-auto custom-scrollbar p-8 bg-white pb-32">
              <div className="mb-6 space-y-4">
                <div className="flex items-start gap-3">
                  <Layout size={24} className="text-slate-500 mt-1.5" />
                  <div className="flex-1">
                    <input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      onBlur={() => saveField({ title })}
                      className="w-full text-3xl font-black text-slate-900 bg-transparent outline-none placeholder:text-slate-300"
                    />
                    <p className="text-sm text-slate-500 mt-1">
                      in list{" "}
                      <span className="underline decoration-slate-300 cursor-pointer hover:text-blue-600">
                        To Do
                      </span>
                    </p>
                  </div>
                </div>
              </div>
              <div className="ml-9 mb-8 flex flex-wrap gap-4">
                {selectedTagIds.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {selectedTagIds.map((id) => {
                      const t = availableTags.find((tag) => tag.id === id);
                      return t ? (
                        <span
                          key={id}
                          className={`px-3 py-1 rounded-md text-sm font-bold shadow-sm ${t.bgColor} ${t.textColor}`}
                        >
                          {t.name}
                        </span>
                      ) : null;
                    })}
                    <button
                      onClick={() => {
                        setActivePopover("tags");
                        setTagView("list");
                      }}
                      className="w-8 h-8 rounded bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                )}
                {dateRange?.from && (
                  <div
                    className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-md text-sm font-bold text-slate-700 cursor-pointer hover:bg-slate-200 transition-colors"
                    onClick={() => setActivePopover("dates")}
                  >
                    <Clock size={16} />
                    <span>
                      {format(dateRange.from, "dd MMM")}
                      {dateRange.to
                        ? ` - ${format(dateRange.to, "dd MMM")}`
                        : ""}
                    </span>
                  </div>
                )}
              </div>
              <div className="mb-8 group">
                <div className="flex items-center gap-3 mb-2 text-slate-800 font-bold">
                  <AlignLeft size={20} />
                  <h3>รายละเอียด</h3>
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
              <div className="space-y-8 mb-10">
                {blocks.map((block) => (
                  <div key={block.id} className="group relative">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-3 text-slate-800 font-bold">
                        {block.type === "checklist" ? (
                          <CheckSquare size={20} />
                        ) : (
                          <Paperclip size={20} />
                        )}
                        <h3>
                          {block.type === "checklist"
                            ? block.title
                            : "Attachments"}
                        </h3>
                      </div>
                      <button
                        onClick={() => deleteBlock(block.id)}
                        className="px-3 py-1.5 bg-slate-100 text-slate-600 text-xs font-bold rounded hover:bg-red-50 hover:text-red-600 transition-colors"
                      >
                        Delete
                      </button>
                    </div>
                    {block.type === "checklist" && (
                      <div className="ml-9 space-y-4">
                        <div className="flex items-center gap-3 text-xs text-slate-500 font-bold mb-2">
                          <span className="text-slate-600">
                            {Math.round(
                              ((block.items?.filter((i) => i.isChecked)
                                .length || 0) /
                                (block.items?.length || 1)) *
                              100
                            )}
                            %
                          </span>
                          <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                            <div
                              className="h-full bg-emerald-500 transition-all duration-300"
                              style={{
                                width: `${((block.items?.filter((i) => i.isChecked)
                                  .length || 0) /
                                  (block.items?.length || 1)) *
                                  100
                                  }%`,
                              }}
                            ></div>
                          </div>
                        </div>
                        <div className="space-y-2">
                          {block.items?.map((item) => (
                            <div
                              key={item.id}
                              className="flex items-start gap-3 group/item p-1.5 hover:bg-slate-50 rounded-lg -ml-1.5 transition-colors"
                            >
                              <GripVertical
                                size={16}
                                className="text-slate-300 mt-1 cursor-grab opacity-0 group-hover/item:opacity-100"
                              />
                              <input
                                type="checkbox"
                                checked={item.isChecked}
                                onChange={() =>
                                  toggleCheckItem(block.id, item.id)
                                }
                                className="w-5 h-5 rounded border-slate-300 text-emerald-600 cursor-pointer focus:ring-0 mt-0.5"
                              />
                              <input
                                value={item.text}
                                onChange={(e) =>
                                  updateCheckItem(
                                    block.id,
                                    item.id,
                                    e.target.value
                                  )
                                }
                                className={`flex-1 text-sm font-medium bg-transparent border-none focus:ring-0 p-0 text-slate-900 ${item.isChecked
                                  ? "line-through text-slate-400"
                                  : ""
                                  }`}
                              />
                              <button
                                onClick={() =>
                                  deleteCheckItem(block.id, item.id)
                                }
                                className="text-slate-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 p-1"
                              >
                                <X size={16} />
                              </button>
                            </div>
                          ))}
                        </div>
                        <div className="pl-7 mt-2">
                          <button
                            className="text-sm text-slate-500 hover:text-slate-800 hover:bg-slate-100 px-3 py-1.5 rounded-md transition-colors flex items-center gap-2 mb-2"
                            onClick={() => {
                              const input = document.getElementById(
                                `add-input-${block.id}`
                              ) as HTMLInputElement;
                              if (input) input.focus();
                            }}
                          >
                            <Plus size={16} /> Add an item
                          </button>
                          <input
                            id={`add-input-${block.id}`}
                            placeholder="Add an item..."
                            className="text-sm bg-transparent border border-transparent hover:border-slate-200 focus:border-blue-500 focus:bg-white rounded px-3 py-2 w-full outline-none transition-all text-slate-700"
                            onKeyDown={(e) => {
                              // 1. เช็คว่ากำลังพิมพ์ภาษาไทยหรือเลือกคำอยู่หรือไม่ ถ้าใช่ให้หยุดทำงาน
                              if (e.nativeEvent.isComposing) return;

                              if (e.key === "Enter") {
                                // 2. ป้องกันการทำงานซ้ำซ้อนของ Browser
                                e.preventDefault();

                                const val = e.currentTarget.value.trim();
                                // ตรวจสอบว่ามีข้อความจริงๆ ถึงจะส่ง
                                if (val) {
                                  addChecklistItem(block.id, val);
                                  e.currentTarget.value = "";
                                }
                              }
                            }}
                          />
                        </div>
                      </div>
                    )}
                    {block.type === "attachment" && (
                      <div className="ml-9 grid grid-cols-1 gap-2">
                        {block.attachments?.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-3 p-3 border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors bg-white relative group/att"
                          >
                            <div
                              className={`w-10 h-10 rounded flex items-center justify-center text-white ${att.type === "link"
                                ? "bg-blue-500"
                                : "bg-red-500"
                                }`}
                            >
                              {att.type === "link" ? (
                                <LinkIcon size={18} />
                              ) : (
                                <FileText size={18} />
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-sm font-bold text-slate-900 truncate">
                                {att.name}
                              </div>
                              {att.url && (
                                <a
                                  href={att.url}
                                  target="_blank"
                                  className="text-xs text-blue-500 hover:underline truncate block"
                                >
                                  {att.url}
                                </a>
                              )}
                              <div className="text-xs text-slate-400 font-medium">
                                Added {att.date}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <div className="mt-8 pt-8 border-t border-slate-200">
                <div className="flex gap-6 mb-6">
                  <button
                    onClick={() => setActiveTab("comments")}
                    className={`pb-2 border-b-2 font-bold text-sm flex items-center gap-2 ${activeTab === "comments"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    <MessageSquare size={16} /> Comments
                  </button>
                  <button
                    onClick={() => setActiveTab("activity")}
                    className={`pb-2 border-b-2 font-bold text-sm flex items-center gap-2 ${activeTab === "activity"
                      ? "border-blue-600 text-blue-700"
                      : "border-transparent text-slate-500 hover:text-slate-700"
                      }`}
                  >
                    <Activity size={16} /> Activity
                  </button>
                </div>
                {activeTab === "comments" ? (
                  <div className="space-y-6">
                    <div className="flex gap-3">
                      <div className="w-9 h-9 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold shadow-sm overflow-hidden">
                        {currentUser?.avatar ? (
                          <img
                            src={currentUser.avatar}
                            alt="Me"
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          (currentUser?.name || "Y").slice(0, 1).toUpperCase()
                        )}
                      </div>
                      <div className="flex-1 relative">
                        {/* ✅ Multiple Files Preview Area */}
                        {commentFiles.length > 0 && (
                          <div className="flex flex-wrap gap-2 mb-2">
                            {commentFiles.map((file, index) => (
                              <div
                                key={index}
                                className="flex items-center gap-2 bg-slate-100 p-2 rounded-lg border border-slate-200 shadow-sm"
                              >
                                <FileIcon size={14} className="text-blue-500" />
                                <span className="text-xs text-slate-600 truncate max-w-[150px]">
                                  {file.name}
                                </span>
                                <button
                                  onClick={() => removeCommentFile(index)}
                                  className="text-slate-400 hover:text-red-500"
                                >
                                  <X size={14} />
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                        <textarea
                          value={commentInput}
                          onChange={(e) => setCommentInput(e.target.value)}
                          className="w-full border-2 border-slate-200 rounded-xl p-3 pr-10 text-sm focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none resize-none min-h-[60px] text-slate-900"
                          placeholder="Write a comment..."
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              sendComment();
                            }
                          }}
                        />
                        <div className="flex items-center gap-2 mt-2 justify-end">
                          <button
                            onClick={() => chatFileRef.current?.click()}
                            className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                          >
                            <Paperclip size={16} />
                          </button>
                          <div className="relative" ref={emojiRef}>
                            <button
                              onClick={() => setIsEmojiOpen(!isEmojiOpen)}
                              className="p-2 text-slate-500 hover:bg-slate-100 rounded-lg transition-colors"
                            >
                              <Smile size={16} />
                            </button>
                            {isEmojiOpen && (
                              <div className="absolute bottom-full right-0 mb-2 bg-white border border-slate-200 shadow-xl rounded-xl p-3 grid grid-cols-5 gap-2 w-64 z-50">
                                {EMOJI_LIST.map((e) => (
                                  <button
                                    key={e}
                                    onClick={() =>
                                      setCommentInput((prev) => prev + e)
                                    }
                                    className="text-2xl hover:bg-slate-100 p-1 rounded transition"
                                  >
                                    {e}
                                  </button>
                                ))}
                              </div>
                            )}
                          </div>
                          {/* Allow multiple files */}
                          <input
                            type="file"
                            className="hidden"
                            ref={chatFileRef}
                            multiple
                            onChange={handleCommentFileChange}
                          />
                          <button
                            onClick={sendComment}
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-bold hover:bg-blue-700 transition-colors flex items-center gap-2"
                          >
                            Send <Send size={14} />
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="space-y-5 pl-12">
                      {comments.map((c) => (
                        <div key={c.id} className="group w-full mb-4">
                          <div className="flex items-baseline gap-2 mb-1">
                            <span className="font-bold text-slate-900 text-sm">
                              {typeof c.user === "object"
                                ? c.user.name
                                : c.user}
                            </span>
                            <span className="text-xs text-slate-400 font-medium">
                              {c.time}
                            </span>
                            {c.isEdited && (
                              <span className="text-[10px] text-slate-400">
                                (edited)
                              </span>
                            )}
                          </div>
                          <div className="flex items-start gap-2 group/bubble">
                            {editingCommentId === c.id ? (
                              <div className="bg-slate-50 p-3 rounded-xl border border-blue-200 w-full max-w-[85%]">
                                <textarea
                                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-sm text-slate-800 outline-none focus:ring-2 focus:ring-blue-100"
                                  rows={3}
                                  value={editingText}
                                  onChange={(e) =>
                                    setEditingText(e.target.value)
                                  }
                                />
                                {/* ✅ แสดงกล่องไฟล์แนบเดิม (ถ้ามี) แบบเป็นรายการ ตามภาพที่ต้องการ */}
                                {editingFileParts.length > 0 && (
                                  <div className="mt-2 space-y-1">
                                    <p className="text-xs font-bold text-slate-500 mb-1">
                                      ไฟล์แนบเดิม:
                                    </p>
                                    {editingFileParts.map((fileCode, idx) => (
                                      <div
                                        key={idx}
                                        className="flex items-center gap-2 bg-blue-50 p-2 rounded border border-blue-100 text-xs text-blue-600 justify-between"
                                      >
                                        <div className="flex items-center gap-2 overflow-hidden">
                                          <FileIcon
                                            size={12}
                                            className="shrink-0"
                                          />
                                          <span className="truncate">
                                            {getFileNameFromCode(fileCode)}
                                          </span>
                                        </div>
                                        <button
                                          onClick={() => removeEditingFile(idx)}
                                          className="text-red-500 hover:underline shrink-0 ml-2"
                                          title="ลบไฟล์นี้"
                                        >
                                          <Trash2 size={14} />
                                        </button>
                                      </div>
                                    ))}
                                  </div>
                                )}
                                <div className="flex gap-2 mt-2 justify-end">
                                  <button
                                    onClick={handleCancelEdit}
                                    className="text-xs text-slate-500 hover:text-slate-700 px-3 py-1"
                                  >
                                    Cancel
                                  </button>
                                  <button
                                    onClick={() => handleSaveEdit(c.id)}
                                    className="text-xs bg-blue-600 text-white px-3 py-1.5 rounded-lg font-bold hover:bg-blue-700 flex items-center gap-1"
                                  >
                                    <SaveIcon size={12} /> Save
                                  </button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden shrink-0 mt-0.5">
                                  {typeof c.user === "object" &&
                                    c.user.avatar ? (
                                    <img
                                      src={c.user.avatar}
                                      alt=""
                                      className="w-full h-full object-cover"
                                    />
                                  ) : (
                                    <span className="text-[10px] font-bold text-slate-500">
                                      {(typeof c.user === "object"
                                        ? c.user.name
                                        : c.user || "?"
                                      )
                                        .slice(0, 1)
                                        .toUpperCase()}
                                    </span>
                                  )}
                                </div>
                                <div className="text-sm text-slate-800 bg-white p-3.5 rounded-2xl rounded-tl-none border border-slate-200 shadow-sm inline-block font-medium leading-relaxed max-w-[85%] whitespace-pre-wrap">
                                  {renderCommentContent(c.text)}
                                </div>
                              </div>
                            )}
                            {editingCommentId !== c.id && (
                              <div className="opacity-0 group-hover:opacity-100 flex items-center gap-1 transition-opacity self-center">
                                <button
                                  onClick={() => handleCopyComment(c.text)}
                                  className="p-1.5 text-slate-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                                  title="Copy"
                                >
                                  <Copy size={14} />
                                </button>
                                <button
                                  onClick={() => handleStartEdit(c)}
                                  className="p-1.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  title="Edit"
                                >
                                  <Edit2 size={14} />
                                </button>
                                <button
                                  onClick={() => deleteComment(c.id)}
                                  className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  title="Delete"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4 pl-4 border-l-2 border-slate-100 ml-2">
                    {activities.map((a) => (
                      <div key={a.id} className="relative pl-10">
                        <div className="absolute left-0 top-0.5 w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center overflow-hidden border border-white shadow-sm ring-4 ring-white z-10">
                          {typeof a.user === "object" && a.user.avatar ? (
                            <img
                              src={a.user.avatar}
                              alt=""
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <span className="text-[10px] font-bold text-slate-500">
                              {(typeof a.user === "object"
                                ? a.user.name
                                : a.user || "?"
                              )
                                .slice(0, 1)
                                .toUpperCase()}
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-slate-600">
                          <span className="font-bold text-slate-900">
                            {typeof a.user === "object" ? a.user.name : a.user}
                          </span>{" "}
                          {a.action}
                        </p>
                        <span className="text-xs text-slate-400 font-medium mt-0.5">
                          {a.time}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* === RIGHT SIDEBAR (same as before) === */}
            <div className="w-72 bg-slate-50 border-l border-slate-200 p-6 flex flex-col gap-6 shadow-inner relative z-20 overflow-visible">
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3 px-1 tracking-wider">
                  Add to card
                </p>
                <div className="space-y-2 relative">
                  <SidebarBtn
                    icon={User}
                    label="Members"
                    active={activePopover === "members"}
                    onClick={() => setActivePopover("members")}
                  />
                  <SidebarBtn
                    icon={TagIcon}
                    label="Labels"
                    active={activePopover === "tags"}
                    onClick={() => {
                      setActivePopover("tags");
                      setTagView("list");
                    }}
                  />
                  <SidebarBtn
                    icon={CheckSquare}
                    label="Checklist"
                    active={activePopover === "checklist"}
                    onClick={() => setActivePopover("checklist")}
                  />
                  <SidebarBtn
                    icon={Calendar}
                    label="Dates"
                    active={activePopover === "dates"}
                    onClick={() => setActivePopover("dates")}
                  />
                  <SidebarBtn
                    icon={Paperclip}
                    label="Attachment"
                    active={activePopover === "attachment"}
                    onClick={() => setActivePopover("attachment")}
                  />
                  {/* ... Popovers ... */}
                  {activePopover === "members" && (
                    <PopoverContainer
                      title="Members"
                      onClose={() => setActivePopover(null)}
                    >
                      <div className="space-y-1">
                        <input
                          className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mb-2"
                          placeholder="Search members..."
                        />
                        {membersList.map((m) => (
                          <button
                            key={m.id}
                            onClick={() => toggleMember(m.id)}
                            className="w-full text-left px-2 py-1.5 hover:bg-slate-50 rounded flex items-center gap-2 text-sm text-slate-700"
                          >
                            <div
                              className={`w-6 h-6 rounded-full flex items-center justify-center text-white text-[10px] ${m.color}`}
                            >
                              {m.short}
                            </div>
                            <span className="flex-1">{m.name}</span>
                            {assignedMembers.includes(m.id) && (
                              <CheckCircle2
                                size={14}
                                className="text-blue-600"
                              />
                            )}
                          </button>
                        ))}
                      </div>
                    </PopoverContainer>
                  )}
                  {activePopover === "tags" && (
                    <PopoverContainer
                      title={
                        tagView === "list"
                          ? "Labels"
                          : tagView === "create"
                            ? "Create Label"
                            : "Edit Label"
                      }
                      onClose={() => setActivePopover(null)}
                      width="w-80"
                      showBack={tagView !== "list"}
                      onBack={() => setTagView("list")}
                    >
                      {tagView === "list" ? (
                        <div className="space-y-1">
                          <input
                            placeholder="Search labels..."
                            className="w-full border border-slate-200 rounded px-2 py-1.5 text-sm mb-2 text-slate-900 focus:outline-none focus:border-blue-500"
                            value={tagSearch}
                            onChange={(e) => setTagSearch(e.target.value)}
                          />
                          <p className="text-xs font-bold text-slate-500 mb-1 mt-2">
                            LABELS
                          </p>
                          {availableTags
                            .filter((t) =>
                              t.name
                                .toLowerCase()
                                .includes(tagSearch.toLowerCase())
                            )
                            .map((t) => (
                              <div
                                key={t.id}
                                className="flex items-center gap-2 mb-1 group"
                              >
                                <div
                                  onClick={() => toggleTag(t.id)}
                                  className={`flex-1 h-8 rounded px-3 flex items-center justify-between text-sm font-bold shadow-sm transition-all cursor-pointer ${t.bgColor} ${t.textColor} hover:opacity-90`}
                                >
                                  {t.name}
                                  {selectedTagIds.includes(t.id) && (
                                    <CheckCircle2 size={16} />
                                  )}
                                </div>
                                <button
                                  onClick={() => startEditTag(t)}
                                  className="p-1 text-slate-400 hover:bg-slate-100 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  <Edit2 size={14} />
                                </button>
                              </div>
                            ))}
                          <button
                            onClick={startCreateTag}
                            className="w-full mt-2 bg-slate-100 hover:bg-slate-200 text-slate-600 text-sm font-medium py-2 rounded-lg transition-colors"
                          >
                            Create a new label
                          </button>
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <div className="h-24 bg-slate-50 rounded-lg flex items-center justify-center mb-2 border border-slate-100">
                            <span
                              className={`px-4 py-1.5 rounded-md text-sm font-bold shadow-sm ${newTagColor.labelBg} ${newTagColor.labelText}`}
                            >
                              {newTagName || "Label Name"}
                            </span>
                          </div>
                          <input
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900 outline-none focus:border-blue-500"
                            value={newTagName}
                            onChange={(e) => setNewTagName(e.target.value)}
                            placeholder="Name"
                          />
                          <div className="grid grid-cols-5 gap-2">
                            {TAG_COLORS.map((c) => (
                              <div
                                key={c.name}
                                onClick={() => setNewTagColor(c)}
                                className={`h-8 rounded cursor-pointer ${c.bg
                                  } ${newTagColor.name === c.name
                                    ? "ring-2 ring-blue-600 ring-offset-1"
                                    : "hover:opacity-80"
                                  }`}
                              ></div>
                            ))}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={
                                tagView === "create"
                                  ? handleCreateTag
                                  : handleUpdateTag
                              }
                              className="flex-1 bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700"
                            >
                              Save
                            </button>
                            {tagView === "edit" && (
                              <button
                                onClick={handleDeleteTag}
                                className="bg-red-50 text-red-600 px-3 rounded text-sm font-bold hover:bg-red-100"
                              >
                                Delete
                              </button>
                            )}
                          </div>
                        </div>
                      )}
                    </PopoverContainer>
                  )}
                  {activePopover === "checklist" && (
                    <PopoverContainer
                      title="Add checklist"
                      onClose={() => setActivePopover(null)}
                    >
                      <div className="space-y-3">
                        <input
                          autoFocus
                          className="w-full border border-slate-200 rounded px-3 py-2 text-sm outline-none focus:border-blue-500 text-slate-900"
                          placeholder="Title"
                          value={newChecklistTitle}
                          onChange={(e) => setNewChecklistTitle(e.target.value)}
                        />
                        <button
                          onClick={addChecklistBlock}
                          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700"
                        >
                          Add
                        </button>
                      </div>
                    </PopoverContainer>
                  )}
                  {activePopover === "dates" && (
                    <PopoverContainer
                      title="Dates"
                      onClose={() => setActivePopover(null)}
                      width="w-auto"
                    >
                      <div className="p-1">
                        <DayPicker
                          mode="range"
                          defaultMonth={new Date()}
                          selected={dateRange}
                          onSelect={setDateRange}
                          numberOfMonths={1}
                        />
                      </div>
                      <div className="flex gap-2 mt-2 pt-3 border-t border-slate-100 bg-slate-50/50 -mx-4 -mb-4 p-4 rounded-b-xl">
                        <button
                          onClick={async () => {
                            if (isSavingDate) return;
                            setDateRange(undefined);
                            await handleSaveDate();
                          }}
                          className="px-3 py-1.5 text-sm font-bold text-slate-500 hover:bg-white hover:text-slate-700 rounded-lg transition-colors border border-transparent hover:border-slate-200"
                          disabled={isSavingDate}
                        >
                          {isSavingDate ? "Saving..." : "Clear"}
                        </button>
                        <button
                          onClick={handleSaveDate}
                          disabled={!dateRange?.from || isSavingDate}
                          className="flex-1 bg-blue-600 text-white text-sm font-bold py-1.5 rounded-lg hover:bg-blue-700 shadow-sm disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                          {isSavingDate ? "Saving..." : "Save"}
                        </button>
                      </div>
                    </PopoverContainer>
                  )}
                  {activePopover === "attachment" && (
                    <PopoverContainer
                      title="Attach"
                      onClose={() => setActivePopover(null)}
                    >
                      <div className="flex gap-2 mb-3 border-b border-slate-100 pb-2">
                        <button
                          onClick={() => setAttachmentTab("file")}
                          className={`text-xs font-bold px-2 py-1 rounded ${attachmentTab === "file"
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-500"
                            }`}
                        >
                          Computer
                        </button>
                        <button
                          onClick={() => setAttachmentTab("link")}
                          className={`text-xs font-bold px-2 py-1 rounded ${attachmentTab === "link"
                            ? "bg-blue-50 text-blue-600"
                            : "text-slate-500"
                            }`}
                        >
                          Link
                        </button>
                      </div>
                      {attachmentTab === "file" ? (
                        <div
                          className="border-2 border-dashed border-slate-200 rounded-xl py-6 text-center text-xs text-slate-500 cursor-pointer hover:bg-slate-50 hover:border-blue-300 transition-all"
                          onClick={() => fileInputRef.current?.click()}
                        >
                          <UploadCloud
                            size={24}
                            className="mx-auto mb-2 text-slate-400"
                          />{" "}
                          Click to upload file
                          <input
                            type="file"
                            className="hidden"
                            ref={fileInputRef}
                            onChange={(e) => {
                              if (e.target.files?.[0])
                                handleAddAttachment(
                                  "file",
                                  e.target.files[0].name
                                );
                            }}
                          />
                        </div>
                      ) : (
                        <div className="space-y-3">
                          <input
                            placeholder="Paste any link..."
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900"
                            value={linkUrl}
                            onChange={(e) => setLinkUrl(e.target.value)}
                          />
                          <input
                            placeholder="Link name (optional)"
                            className="w-full border border-slate-200 rounded px-3 py-2 text-sm text-slate-900"
                            value={linkText}
                            onChange={(e) => setLinkText(e.target.value)}
                          />
                          <button
                            onClick={() =>
                              handleAddAttachment("link", linkUrl, linkText)
                            }
                            className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg text-sm hover:bg-blue-700"
                          >
                            Attach
                          </button>
                        </div>
                      )}
                    </PopoverContainer>
                  )}
                </div>
              </div>
              <div>
                <p className="text-xs font-bold text-slate-500 uppercase mb-3 px-1 tracking-wider">
                  Actions
                </p>
                <div className="space-y-2">
                  {/* <SidebarBtn icon={Layout} label="Cover" /> */}
                  <SidebarBtn
                    icon={Trash2}
                    label="Delete"
                    onClick={handleDeleteTask}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <CustomModals
        successModal={successModal}
        setSuccessModal={setSuccessModal}
        errorModal={errorModal}
        setErrorModal={setErrorModal}
        deleteModal={deleteModal}
        setDeleteModal={setDeleteModal}
      />
    </>
  );
}

// Render helpers for custom modals within the same component flow
function CustomModals({
  successModal,
  setSuccessModal,
  errorModal,
  setErrorModal,
  deleteModal,
  setDeleteModal,
}: any) {
  return (
    <>
      <ModalSuccess
        open={successModal.open}
        message={successModal.message}
        description={successModal.description}
        onClose={() => setSuccessModal({ ...successModal, open: false })}
      />
      <ModalError
        open={errorModal.open}
        message={errorModal.message}
        description={errorModal.description}
        onClose={() => setErrorModal({ ...errorModal, open: false })}
      />
      <ModalDelete
        open={deleteModal.open}
        message={deleteModal.message}
        onClose={() => setDeleteModal({ ...deleteModal, open: false })}
        onConfirm={deleteModal.onConfirm}
      />
    </>
  );
}

// --- 5. Helper Components ---
const SidebarBtn = ({ icon: Icon, label, onClick, active }: any) => (
  <button
    onClick={onClick}
    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all ${active
      ? "bg-blue-100 text-blue-700 ring-1 ring-blue-300 shadow-sm"
      : "text-slate-700 hover:bg-slate-200/70 active:bg-slate-200"
      }`}
  >
    <Icon size={18} className={active ? "text-blue-600" : "text-slate-500"} />{" "}
    {label}
  </button>
);

const PopoverContainer = ({
  title,
  onClose,
  children,
  width = "w-80",
  showBack,
  onBack,
}: {
  title: any;
  onClose: () => void;
  children?: React.ReactNode;
  width?: string;
  showBack?: boolean;
  onBack?: () => void;
}) => (
  <div
    className={`absolute top-0 right-[105%] mr-2 ${width} bg-white rounded-xl shadow-2xl border border-slate-200 z-50 animate-in fade-in zoom-in-95 slide-in-from-right-4 overflow-hidden ring-1 ring-slate-900/5`}
  >
    <div className="flex justify-between items-center px-4 py-3 border-b border-slate-100 bg-slate-50/50 relative">
      {showBack ? (
        <button
          onClick={onBack}
          className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50"
        >
          <ChevronLeft size={18} />
        </button>
      ) : (
        <div className="w-6"></div>
      )}
      <h4 className="font-bold text-slate-700 text-sm">{title}</h4>
      <button
        onClick={onClose}
        className="text-slate-400 hover:text-slate-700 p-1 rounded hover:bg-slate-200/50 transition-colors"
      >
        <X size={16} />
      </button>
    </div>
    <div className="p-4">{children}</div>
  </div>
);