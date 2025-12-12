import React, { useState } from "react";
import {
  X,
  AlignLeft,
  CheckCircle2,
  Users,
  User,
  CheckSquare,
  Tag as TagIcon,
  Calendar,
  Paperclip,
  Plus,
  Clock,
  FileText,
  MoveRight,
  MessageSquare,
  Settings,
  ChevronLeft,
  Search,
  Trash2,
  Link as LinkIcon,
  Monitor,
  MoreHorizontal,
} from "lucide-react";

import { ActivitySection } from "./container/ActivitySection";
import { CommentSection } from "./container/CommentSection";
import { TaskActionButton } from "./container/TaskActionButton";
import { MemberModal } from "./container/MemberModal";
import {
  ActivityItem,
  CardContentBlock,
  Tag,
  AttachmentItem,
  ModalWorkflowProps,
  Member,
} from "./container/types";

// Mock Data Source for Members
const ALL_MEMBERS: Member[] = [
  { id: "1", name: "Poom", role: "Admin", color: "bg-blue-500" },
  { id: "2", name: "Jame", role: "Editor", color: "bg-green-500" },
  { id: "3", name: "Toon", role: "Viewer", color: "bg-pink-500" },
  { id: "4", name: "Korn", role: "Viewer", color: "bg-orange-500" },
];

// Mock Member Data

const TAG_COLORS = [
  "bg-amber-400",
  "bg-orange-400",
  "bg-red-500",
  "bg-pink-500",
  "bg-purple-600",
  "bg-indigo-600",
  "bg-blue-600",
  "bg-cyan-500",
  "bg-teal-500",
  "bg-green-500",
  "bg-lime-500",
  "bg-slate-500",
];

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
  const [isMoreMenuOpen, setIsMoreMenuOpen] = useState(false);
  const [contentBlocks, setContentBlocks] = useState<CardContentBlock[]>([]);
  const [isChecklistPopoverOpen, setIsChecklistPopoverOpen] = useState(false);
  const [newChecklistTitle, setNewChecklistTitle] = useState("");
  const [isMemberModalOpen, setIsMemberModalOpen] = useState(false);
  const [assignedMemberIds, setAssignedMemberIds] = useState<string[]>([
    "1",
    "2",
    "3",
  ]); // Initial mock assigned

  const assignedMembers = ALL_MEMBERS.filter((m) =>
    assignedMemberIds.includes(m.id)
  );

  // Tags State
  const [isTagsPopoverOpen, setIsTagsPopoverOpen] = useState(false);
  const [tagPopoverView, setTagPopoverView] = useState<
    "list" | "create" | "edit"
  >("list");
  const [searchTag, setSearchTag] = useState("");
  const [editingTag, setEditingTag] = useState<Tag | null>(null);

  const [availableTags, setAvailableTags] = useState<Tag[]>([
    { id: "1", name: "", color: "bg-amber-400" },
    { id: "2", name: "", color: "bg-red-500" },
    { id: "3", name: "", color: "bg-purple-600" },
    { id: "4", name: "", color: "bg-blue-600" },
    { id: "5", name: "", color: "bg-green-500" },
  ]);

  const [selectedTagIds, setSelectedTagIds] = useState<string[]>([]);

  // Date Picker State
  const [isDatePopoverOpen, setIsDatePopoverOpen] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [tempStartDate, setTempStartDate] = useState<Date | null>(null);
  const [tempEndDate, setTempEndDate] = useState<Date | null>(null);

  const monthNames = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December",
  ];

  // Mock Data for Activities
  // Mock Data for Activities
  const [activities, setActivities] = useState<ActivityItem[]>([]);

  const logActivity = (
    action: string,
    target?: string,
    type: ActivityItem["type"] = "topci"
  ) => {
    const newActivity: ActivityItem = {
      id: Date.now().toString(),
      user: "Poom", // Using hardcoded user
      action,
      target,
      type,
      timestamp: new Date(),
    };
    setActivities((prev) => [newActivity, ...prev]);
  };

  // Comment logic moved to CommentSection component

  const addContentBlock = (type: CardContentBlock["type"], data?: any) => {
    setContentBlocks([
      ...contentBlocks,
      { id: Date.now().toString(), type, ...data },
    ]);
  };

  const addChecklist = () => {
    if (!newChecklistTitle.trim()) return;

    const existingChecklistIndex = contentBlocks.findIndex(
      (b) => b.type === "checklist"
    );

    if (existingChecklistIndex >= 0) {
      const updatedBlocks = [...contentBlocks];
      const block = updatedBlocks[existingChecklistIndex];
      updatedBlocks[existingChecklistIndex] = {
        ...block,
        items: [
          ...(block.items || []),
          {
            id: Date.now().toString(),
            text: newChecklistTitle,
            isChecked: false,
          },
        ],
      };
      setContentBlocks(updatedBlocks);
    } else {
      addContentBlock("checklist", {
        title: "Checklist",
        items: [
          {
            id: Date.now().toString(),
            text: newChecklistTitle,
            isChecked: false,
          },
        ],
      });
    }

    logActivity("เพิ่ม Checklist", newChecklistTitle, "topci");

    setNewChecklistTitle("");
    setIsChecklistPopoverOpen(false);
  };

  const addChecklistItem = (blockId: string, text: string) => {
    setContentBlocks(
      contentBlocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            items: [
              ...(block.items || []),
              { id: Date.now().toString(), text, isChecked: false },
            ],
          };
        }
        return block;
      })
    );
  };

  const toggleChecklistItem = (blockId: string, itemId: string) => {
    setContentBlocks(
      contentBlocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            items: block.items?.map((item) =>
              item.id === itemId
                ? { ...item, isChecked: !item.isChecked }
                : item
            ),
          };
        }
        return block;
      })
    );
  };

  const removeChecklistItem = (blockId: string, itemId: string) => {
    setContentBlocks(
      contentBlocks.map((block) => {
        if (block.id === blockId) {
          return {
            ...block,
            items: block.items?.filter((item) => item.id !== itemId),
          };
        }
        return block;
      })
    );
  };

  const removeContentBlock = (id: string) => {
    setContentBlocks(contentBlocks.filter((b) => b.id !== id));
  };

  // Tag Logic
  const handleTagToggle = (tagId: string) => {
    // Check if we need to add the 'tags' block if it doesn't exist
    const hasTagsBlock = contentBlocks.some((b) => b.type === "tags");

    let newSelectedIds: string[];
    if (selectedTagIds.includes(tagId)) {
      newSelectedIds = selectedTagIds.filter((id) => id !== tagId);
    } else {
      newSelectedIds = [...selectedTagIds, tagId];
    }
    setSelectedTagIds(newSelectedIds);

    // Sync with content blocks
    if (!hasTagsBlock && newSelectedIds.length > 0) {
      addContentBlock("tags", { selectedTags: newSelectedIds });
    } else {
      // Update existing block
      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.type === "tags" ? { ...b, selectedTags: newSelectedIds } : b
        )
      );
    }

    // Log Activity
    const tag = availableTags.find((t) => t.id === tagId);
    if (tag) {
      if (selectedTagIds.includes(tagId)) {
        logActivity("ลบป้ายกำกับ", tag.name, "topci");
      } else {
        logActivity("เพิ่มป้ายกำกับ", tag.name, "topci");
      }
    }
  };

  const handleCreateTag = () => {
    if (editingTag) {
      const newTag: Tag = {
        id: Date.now().toString(),
        name: editingTag.name,
        color: editingTag.color || "bg-blue-500",
      };
      setAvailableTags([...availableTags, newTag]);
      setTagPopoverView("list");
      setEditingTag(null);
    }
  };

  const handleUpdateTag = () => {
    if (editingTag) {
      setAvailableTags((tags) =>
        tags.map((t) => (t.id === editingTag.id ? editingTag : t))
      );
      setTagPopoverView("list");
      setEditingTag(null);
    }
  };

  const handleDeleteTag = () => {
    if (editingTag) {
      setAvailableTags((tags) => tags.filter((t) => t.id !== editingTag.id));
      setSelectedTagIds((ids) => ids.filter((id) => id !== editingTag.id));
      setTagPopoverView("list");
      setEditingTag(null);
    }
  };

  const openEditTag = (tag: Tag) => {
    setEditingTag(tag);
    setTagPopoverView("edit");
  };

  const openCreateTag = () => {
    setEditingTag({ id: "", name: "", color: TAG_COLORS[0] });
    setTagPopoverView("create");
  };

  // Date Logic
  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const firstDayOfMonth = new Date(year, month, 1).getDay(); // 0 = Sunday

    const days = [];
    // Add empty slots for previous month days
    for (let i = 0; i < firstDayOfMonth; i++) {
      days.push(null);
    }
    // Add actual days
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(new Date(year, month, i));
    }
    return days;
  };

  const handleDateClick = (date: Date) => {
    if (!tempStartDate || (tempStartDate && tempEndDate)) {
      // Start new selection
      setTempStartDate(date);
      setTempEndDate(null);
    } else {
      // Complete selection
      if (date < tempStartDate) {
        setTempEndDate(tempStartDate);
        setTempStartDate(date);
      } else {
        setTempEndDate(date);
      }
    }
  };

  const handleSaveDate = () => {
    if (!tempStartDate) return;

    const existingBlockIndex = contentBlocks.findIndex(
      (b) => b.type === "date"
    );
    if (existingBlockIndex >= 0) {
      const updatedBlocks = [...contentBlocks];
      updatedBlocks[existingBlockIndex] = {
        ...updatedBlocks[existingBlockIndex],
        startDate: tempStartDate,
        endDate: tempEndDate || tempStartDate,
      };
      setContentBlocks(updatedBlocks);
    } else {
      addContentBlock("date", {
        startDate: tempStartDate,
        endDate: tempEndDate || tempStartDate,
      });
    }

    logActivity(
      "กำหนดวันที่",
      `${formatDateShort(tempStartDate)} - ${
        tempEndDate ? formatDateShort(tempEndDate) : ""
      }`,
      "topci"
    );
    setIsDatePopoverOpen(false);
  };

  const removeDateBlock = () => {
    const dateBlock = contentBlocks.find((b) => b.type === "date");
    if (dateBlock) removeContentBlock(dateBlock.id);
    setIsDatePopoverOpen(false);
    setTempStartDate(null);
    setTempEndDate(null);
  };

  const changeMonth = (offset: number) => {
    const newDate = new Date(currentMonth);
    newDate.setMonth(newDate.getMonth() + offset);
    setCurrentMonth(newDate);
  };

  const isDateSelected = (date: Date) => {
    if (!date) return false;
    if (tempStartDate && date.toDateString() === tempStartDate.toDateString())
      return true;
    if (tempEndDate && date.toDateString() === tempEndDate.toDateString())
      return true;
    return false;
  };

  const isDateInRange = (date: Date) => {
    if (!date || !tempStartDate || !tempEndDate) return false;
    return date > tempStartDate && date < tempEndDate;
  };

  const formatDateShort = (date: Date) => {
    return date.toLocaleDateString("en-GB", {
      day: "numeric",
      month: "short",
      year: "numeric",
    });
  };

  // Attachment Logic
  const [isAttachmentPopoverOpen, setIsAttachmentPopoverOpen] = useState(false);
  const [attachmentView, setAttachmentView] = useState<"select" | "link">(
    "select"
  );
  const [linkUrl, setLinkUrl] = useState("");
  const [linkText, setLinkText] = useState("");
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleAddLink = () => {
    if (!linkUrl.trim()) return;

    const newAttachment: AttachmentItem = {
      id: Date.now().toString(),
      type: "link",
      name: linkText.trim() || linkUrl,
      url: linkUrl,
      dateAdded: new Date(),
    };

    addAttachmentToBlock(newAttachment);
    setLinkUrl("");
    setLinkText("");
    setIsAttachmentPopoverOpen(false);
    setAttachmentView("select");
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newAttachment: AttachmentItem = {
      id: Date.now().toString(),
      type: "file",
      name: file.name,
      dateAdded: new Date(),
    };

    addAttachmentToBlock(newAttachment);
    setIsAttachmentPopoverOpen(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const addAttachmentToBlock = (item: AttachmentItem) => {
    const existingBlockIndex = contentBlocks.findIndex(
      (b) => b.type === "attachment"
    );
    if (existingBlockIndex >= 0) {
      const updated = [...contentBlocks];
      updated[existingBlockIndex] = {
        ...updated[existingBlockIndex],
        attachments: [...(updated[existingBlockIndex].attachments || []), item],
      };
      setContentBlocks(updated);
    } else {
      addContentBlock("attachment", { attachments: [item] });
    }

    logActivity("แนบไฟล์", item.name, "upload");
  };

  const removeAttachmentItem = (blockId: string, attachmentId: string) => {
    const blockIndex = contentBlocks.findIndex((b) => b.id === blockId);
    if (blockIndex < 0) return;

    const block = contentBlocks[blockIndex];
    const newAttachments =
      block.attachments?.filter((a) => a.id !== attachmentId) || [];

    if (newAttachments.length === 0) {
      removeContentBlock(blockId);
    } else {
      const updated = [...contentBlocks];
      updated[blockIndex] = { ...block, attachments: newAttachments };
      setContentBlocks(updated);
    }
  };

  // Effect to remove tags block if empty
  React.useEffect(() => {
    const tagsBlock = contentBlocks.find((b) => b.type === "tags");
    if (tagsBlock && selectedTagIds.length === 0) {
      removeContentBlock(tagsBlock.id);
    } else if (tagsBlock) {
      // ensure block data is up to date if selectedTagIds changes externally (though here it's local)
      setContentBlocks((blocks) =>
        blocks.map((b) =>
          b.type === "tags" ? { ...b, selectedTags: selectedTagIds } : b
        )
      );
    }
  }, [selectedTagIds]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 font-sans animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-5xl h-auto max-h-[90vh] overflow-hidden flex flex-col transform transition-all scale-100">
        {/* === Header === */}
        <div className="bg-white text-gray-900 px-6 py-4 flex items-center justify-between shrink-0 border-b border-gray-100 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={() => {
                const newStatus = !isAccepted;
                setIsAccepted(newStatus);
                logActivity(
                  newStatus ? "รับงานนี้แล้ว" : "ยกเลิกการรับงาน",
                  undefined,
                  "topci"
                );
              }}
              className={`
                    text-xs font-bold px-4 py-2 rounded-full flex items-center gap-1.5 transition-all duration-300 shadow-sm
                    hover:shadow-md active:scale-95
                    ${
                      isAccepted
                        ? "bg-green-100 text-green-700 hover:bg-green-200"
                        : "bg-blue-600 text-white hover:bg-blue-700 hover:-translate-y-0.5"
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
            <div className="flex -space-x-2 ml-2">
              {assignedMembers.map((member) => (
                <div
                  key={member.id}
                  title={member.name}
                  className={`w-8 h-8 rounded-full border-2 border-white shadow-sm ${member.color}`}
                />
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative">
              <button
                onClick={() => setIsMoreMenuOpen(!isMoreMenuOpen)}
                className="hover:bg-gray-100 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-all"
              >
                <MoreHorizontal size={24} />
              </button>
              {isMoreMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setIsMoreMenuOpen(false)}
                  />
                  <div className="absolute top-12 right-0 w-48 bg-white rounded-xl shadow-xl border border-gray-100 p-2 z-50 animate-in fade-in zoom-in-95 duration-200">
                    <button
                      onClick={() => {
                        setIsMoreMenuOpen(false);
                        setIsMemberModalOpen(true);
                      }}
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <Users size={18} className="text-gray-500" />
                      Members
                    </button>
                    <div className="h-px bg-gray-100 my-1" />
                    <button
                      onClick={() => setIsMoreMenuOpen(false)}
                      className="w-full text-left px-3 py-2.5 text-sm font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-3 transition-colors"
                    >
                      <Trash2 size={18} />
                      Delete Task
                    </button>
                  </div>
                </>
              )}
            </div>
            <button
              onClick={onClose}
              className="hover:bg-gray-100 text-gray-400 hover:text-gray-600 p-2 rounded-full transition-all hover:rotate-90"
            >
              <X size={24} />
            </button>
          </div>
        </div>

        {/* Member Modal */}
        <MemberModal
          isOpen={isMemberModalOpen}
          onClose={() => setIsMemberModalOpen(false)}
          members={ALL_MEMBERS}
          assignedMemberIds={assignedMemberIds}
          onToggle={(id) => {
            setAssignedMemberIds((prev) =>
              prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
            );
          }}
        />

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
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-3 text-gray-800">
                              <CheckSquare className="w-6 h-6 text-blue-600" />
                              <h3 className="text-xl font-bold">
                                {block.title || "Checklist"}
                                <span className="text-gray-400 text-lg font-medium ml-2">
                                  (
                                  {block.items?.filter((i) => i.isChecked)
                                    .length || 0}
                                  /{block.items?.length || 0})
                                </span>
                              </h3>
                            </div>
                            <button
                              onClick={() => removeContentBlock(block.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <span className="sr-only">Delete</span>
                            </button>
                          </div>

                          {/* Progress Bar */}
                          <div className="flex items-center gap-3 mb-4">
                            <span className="text-sm text-gray-500 font-semibold min-w-fit">
                              {Math.round(
                                ((block.items?.filter((i) => i.isChecked)
                                  .length || 0) /
                                  (block.items?.length || 1)) *
                                  100
                              )}
                              %
                            </span>
                            <div className="h-2 flex-1 bg-gray-100 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-blue-500 transition-all duration-300 rounded-full"
                                style={{
                                  width: `${
                                    ((block.items?.filter((i) => i.isChecked)
                                      .length || 0) /
                                      (block.items?.length || 1)) *
                                    100
                                  }%`,
                                }}
                              />
                            </div>
                          </div>

                          {/* Items List */}
                          <div className="space-y-3 pl-1">
                            {block.items?.map((item) => (
                              <div
                                key={item.id}
                                className="flex items-center gap-3 group/item"
                              >
                                <div className="relative flex items-center justify-center">
                                  <input
                                    type="checkbox"
                                    checked={item.isChecked}
                                    onChange={() =>
                                      toggleChecklistItem(block.id, item.id)
                                    }
                                    className="peer appearance-none w-5 h-5 rounded border-2 border-gray-300 checked:border-blue-500 checked:bg-blue-500 transition-all cursor-pointer"
                                  />
                                  <CheckCircle2
                                    size={14}
                                    className="absolute text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity"
                                    strokeWidth={4}
                                  />
                                </div>
                                <span
                                  className={`flex-1 text-gray-700 transition-all ${
                                    item.isChecked
                                      ? "line-through text-gray-400"
                                      : ""
                                  }`}
                                >
                                  {item.text}
                                </span>
                                <button
                                  onClick={() =>
                                    removeChecklistItem(block.id, item.id)
                                  }
                                  className="text-gray-300 hover:text-red-500 opacity-0 group-hover/item:opacity-100 transition-all p-1 hover:bg-red-50 rounded-full"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}

                            {/* Add Item Input */}
                            <div className="flex items-center gap-3 mt-2">
                              <Plus size={20} className="text-gray-400" />
                              <input
                                type="text"
                                placeholder="Add an item"
                                className="flex-1 outline-none border-none bg-transparent placeholder-gray-400 text-gray-700 focus:placeholder-gray-300 text-sm py-1"
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    const target = e.target as HTMLInputElement;
                                    if (target.value.trim()) {
                                      addChecklistItem(
                                        block.id,
                                        target.value.trim()
                                      );
                                      target.value = "";
                                    }
                                  }
                                }}
                              />
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "tags" && (
                        <div>
                          <div className="flex items-center gap-3 mb-4 text-gray-800">
                            <TagIcon className="w-6 h-6 text-blue-600" />
                            <h3 className="text-xl font-bold">Tags</h3>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {selectedTagIds.map((tagId) => {
                              const tag = availableTags.find(
                                (t) => t.id === tagId
                              );
                              if (!tag) return null;
                              return (
                                <span
                                  key={tagId}
                                  className={`px-3 py-1 ${tag.color} text-white font-bold rounded-lg text-sm border border-transparent/20 cursor-pointer shadow-sm`}
                                >
                                  {tag.name || "Untitled"}
                                </span>
                              );
                            })}
                            <button
                              onClick={() => {
                                setIsTagsPopoverOpen(true);
                              }}
                              className="px-3 py-1 bg-gray-100 text-gray-500 font-bold rounded-lg text-sm border border-gray-200 hover:bg-gray-200 transition-colors"
                            >
                              +
                            </button>
                          </div>
                        </div>
                      )}

                      {block.type === "date" && (
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-gray-800">
                              <Calendar className="w-6 h-6 text-blue-600" />
                              <h3 className="text-xl font-bold">Dates</h3>
                            </div>
                            {/* Redundant close button removed to use the global card hover button */}
                          </div>
                          <div
                            className="flex items-center gap-4 bg-gray-50 p-4 rounded-xl border border-gray-100 w-full"
                            onClick={() => {
                              if (block.startDate)
                                setTempStartDate(block.startDate);
                              if (block.endDate) setTempEndDate(block.endDate);
                              setIsDatePopoverOpen(true);
                            }}
                          >
                            <div className="text-center flex-1 cursor-pointer">
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Start
                              </p>
                              <p className="font-bold text-gray-800 text-lg">
                                {block.startDate
                                  ? formatDateShort(block.startDate)
                                  : "-"}
                              </p>
                            </div>
                            <MoveRight className="text-gray-400" />
                            <div className="text-center flex-1 cursor-pointer">
                              <p className="text-xs text-gray-500 font-bold uppercase">
                                Due
                              </p>
                              <p className="font-bold text-gray-800 text-lg">
                                {block.endDate
                                  ? formatDateShort(block.endDate)
                                  : "-"}
                              </p>
                            </div>
                          </div>
                        </div>
                      )}

                      {block.type === "attachment" && (
                        <div className="w-full">
                          <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center gap-3 text-gray-800">
                              <Paperclip className="w-6 h-6 text-blue-600" />
                              <h3 className="text-xl font-bold">Attachments</h3>
                            </div>
                            <button
                              onClick={() => removeContentBlock(block.id)}
                              className="text-gray-400 hover:text-red-500 transition-colors"
                            >
                              <span className="sr-only">Delete</span>
                              <X size={20} />
                            </button>
                          </div>

                          <div className="grid grid-cols-1 gap-3">
                            {block.attachments?.map((att) => (
                              <div
                                key={att.id}
                                className="flex items-center gap-4 p-3 border border-gray-200 rounded-xl hover:bg-gray-50 transition-colors w-full group/att relative bg-white"
                              >
                                <div
                                  className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0 ${
                                    att.type === "link"
                                      ? "bg-blue-100 text-blue-600"
                                      : "bg-red-100 text-red-500"
                                  }`}
                                >
                                  {att.type === "link" ? (
                                    <LinkIcon size={24} />
                                  ) : (
                                    <FileText size={24} />
                                  )}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="font-bold text-gray-800 text-sm truncate">
                                    {att.name}
                                  </p>
                                  <p className="text-xs text-gray-400">
                                    Added {formatDateShort(att.dateAdded)}
                                  </p>
                                  {att.type === "link" && att.url && (
                                    <a
                                      href={att.url}
                                      target="_blank"
                                      rel="noreferrer"
                                      className="text-xs text-blue-500 hover:underline truncate block"
                                    >
                                      {att.url}
                                    </a>
                                  )}
                                </div>
                                <button
                                  onClick={() =>
                                    removeAttachmentItem(block.id, att.id)
                                  }
                                  className="absolute top-3 right-3 text-gray-300 hover:text-red-500 opacity-0 group-hover/att:opacity-100 transition-all p-1"
                                >
                                  <X size={16} />
                                </button>
                              </div>
                            ))}
                          </div>
                          <div className="mt-3">
                            <button
                              onClick={() => {
                                setAttachmentView("select");
                                setIsAttachmentPopoverOpen(true);
                              }}
                              className="text-sm text-gray-500 font-semibold hover:text-blue-600 hover:bg-blue-50 px-3 py-1.5 rounded-lg transition-colors flex items-center gap-2"
                            >
                              <Plus size={16} /> Add another attachment
                            </button>
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
                  <CommentSection logActivity={logActivity} />
                )}

                {activeTab === "activity" && (
                  <ActivitySection activities={activities} />
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
                <div className="relative z-50">
                  <TaskActionButton
                    icon={<CheckSquare size={20} />}
                    label="CheckList"
                    onClick={() => setIsChecklistPopoverOpen(true)}
                  />
                  {/* Popover */}
                  {isChecklistPopoverOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsChecklistPopoverOpen(false)}
                      />
                      <div className="absolute top-0 right-full mr-4 w-72 bg-white rounded-xl shadow-xl border border-gray-100 z-50 p-4 animate-in fade-in zoom-in-95 duration-200">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="font-bold text-gray-700">
                            Add Checklist
                          </h4>
                          <button
                            onClick={() => setIsChecklistPopoverOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={16} />
                          </button>
                        </div>
                        <div className="space-y-3">
                          <div className="space-y-1">
                            <label className="text-xs font-semibold text-gray-500">
                              Item
                            </label>
                            <input
                              type="text"
                              value={newChecklistTitle}
                              onChange={(e) =>
                                setNewChecklistTitle(e.target.value)
                              }
                              placeholder="Add an item"
                              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all"
                              autoFocus
                            />
                          </div>
                          <button
                            onClick={addChecklist}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded-lg text-sm transition-colors shadow-sm shadow-blue-500/30"
                          >
                            Add
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="relative z-45">
                  <TaskActionButton
                    icon={<TagIcon size={20} />}
                    label="Tags"
                    onClick={() => {
                      setTagPopoverView("list");
                      setIsTagsPopoverOpen(true);
                    }}
                  />

                  {isTagsPopoverOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsTagsPopoverOpen(false)}
                      />
                      <div className="absolute top-0 right-full mr-4 w-80 bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                        {/* === LIST VIEW === */}
                        {tagPopoverView === "list" && (
                          <>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                              <div className="flex-1 text-center font-bold text-gray-700">
                                Tags
                              </div>
                              <button
                                onClick={() => setIsTagsPopoverOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors absolute right-4"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="p-3">
                              <div className="bg-gray-50 border border-gray-200 rounded-md flex items-center px-3 py-2 mb-3 focus-within:ring-2 focus-within:ring-blue-500/20 focus-within:border-blue-400 transition-all">
                                <Search
                                  size={14}
                                  className="text-gray-400 mr-2"
                                />
                                <input
                                  type="text"
                                  placeholder="Search tag"
                                  className="bg-transparent border-none outline-none text-sm w-full text-gray-700 placeholder-gray-400"
                                  value={searchTag}
                                  onChange={(e) => setSearchTag(e.target.value)}
                                />
                              </div>

                              <div className="space-y-2 max-h-[300px] overflow-y-auto custom-scrollbar">
                                <h5 className="text-xs font-bold text-gray-400 mb-2 uppercase">
                                  Tags
                                </h5>
                                {availableTags
                                  .filter((t) =>
                                    t.name
                                      .toLowerCase()
                                      .includes(searchTag.toLowerCase())
                                  )
                                  .map((tag) => {
                                    const isSelected = selectedTagIds.includes(
                                      tag.id
                                    );
                                    return (
                                      <div
                                        key={tag.id}
                                        className="flex items-center gap-2 group"
                                      >
                                        <div
                                          onClick={() =>
                                            handleTagToggle(tag.id)
                                          }
                                          className={`w-4 h-4 rounded-full border-2 cursor-pointer transition-colors flex items-center justify-center shrink-0 ${
                                            isSelected
                                              ? "border-blue-500 bg-blue-500"
                                              : "border-gray-300 hover:border-gray-400"
                                          }`}
                                        >
                                          {isSelected && (
                                            <div className="w-1.5 h-1.5 bg-white rounded-full" />
                                          )}
                                        </div>
                                        <div
                                          onClick={() =>
                                            handleTagToggle(tag.id)
                                          }
                                          className={`flex-1 h-8 rounded text-white text-sm font-bold flex items-center px-3 cursor-pointer transition-transform active:scale-95 ${tag.color}`}
                                        >
                                          {tag.name}
                                        </div>
                                        <button
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            openEditTag(tag);
                                          }}
                                          className="text-gray-400 hover:text-gray-700 p-1 hover:bg-gray-100 rounded opacity-100 transition-opacity"
                                        >
                                          <Settings size={14} />
                                        </button>
                                      </div>
                                    );
                                  })}
                              </div>

                              <button
                                onClick={openCreateTag}
                                className="w-full mt-4 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm shadow-blue-500/30"
                              >
                                Create a new tag
                              </button>
                            </div>
                          </>
                        )}

                        {/* === CREATE / EDIT VIEW === */}
                        {(tagPopoverView === "create" ||
                          tagPopoverView === "edit") && (
                          <>
                            <div className="p-4 border-b border-gray-100 flex items-center justify-between relative">
                              <button
                                onClick={() => setTagPopoverView("list")}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors absolute left-4"
                              >
                                <ChevronLeft size={18} />
                              </button>
                              <div className="flex-1 text-center font-bold text-gray-700">
                                {tagPopoverView === "create"
                                  ? "Create Tag"
                                  : "Change Tag"}
                              </div>
                              <button
                                onClick={() => setIsTagsPopoverOpen(false)}
                                className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded-full transition-colors absolute right-4"
                              >
                                <X size={16} />
                              </button>
                            </div>
                            <div className="p-4 bg-gray-50/50">
                              <div className="flex justify-center py-6">
                                <div
                                  className={`h-10 px-6 rounded-lg text-white font-bold flex items-center justify-center min-w-[200px] shadow-sm ${editingTag?.color}`}
                                >
                                  {editingTag?.name || "Tag Name"}
                                </div>
                              </div>
                            </div>
                            <div className="p-4 space-y-4">
                              <div className="space-y-1.5">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                  Tag name
                                </label>
                                <input
                                  type="text"
                                  value={editingTag?.name || ""}
                                  onChange={(e) =>
                                    setEditingTag((prev) =>
                                      prev
                                        ? { ...prev, name: e.target.value }
                                        : null
                                    )
                                  }
                                  className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all font-medium text-gray-700"
                                  placeholder="Enter tag name"
                                />
                              </div>

                              <div className="space-y-2">
                                <label className="text-xs font-bold text-gray-500 uppercase">
                                  Select Color
                                </label>
                                <div className="grid grid-cols-5 gap-3">
                                  {TAG_COLORS.map((color) => (
                                    <div
                                      key={color}
                                      onClick={() =>
                                        setEditingTag((prev) =>
                                          prev ? { ...prev, color } : null
                                        )
                                      }
                                      className={`h-8 w-8 rounded-full cursor-pointer transition-all hover:scale-110 ${color} relative flex items-center justify-center`}
                                    >
                                      {editingTag?.color === color && (
                                        <div className="w-full h-full rounded-full border-2 border-white shadow-sm ring-2 ring-blue-500" />
                                      )}
                                    </div>
                                  ))}
                                </div>
                              </div>

                              <div className="flex items-center gap-3 pt-4 border-t border-gray-100 mt-4">
                                {tagPopoverView === "edit" && (
                                  <button
                                    onClick={handleDeleteTag}
                                    className="px-4 py-2 border border-red-200 text-red-500 hover:bg-red-50 font-bold rounded-lg text-sm transition-colors"
                                  >
                                    Delete
                                  </button>
                                )}
                                <button
                                  onClick={
                                    tagPopoverView === "create"
                                      ? handleCreateTag
                                      : handleUpdateTag
                                  }
                                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm shadow-blue-500/30"
                                >
                                  Save
                                </button>
                              </div>
                            </div>
                          </>
                        )}
                      </div>
                    </>
                  )}
                </div>
                <div className="relative z-40">
                  <TaskActionButton
                    icon={<Calendar size={20} />}
                    label="Dates"
                    onClick={() => {
                      setTempStartDate(null);
                      setTempEndDate(null);
                      setIsDatePopoverOpen(true);
                    }}
                  />

                  {isDatePopoverOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsDatePopoverOpen(false)}
                      />
                      <div className="absolute top-0 right-full mr-4 w-[340px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <h4 className="font-bold text-gray-800 text-lg">
                            Start/End Date
                          </h4>
                          {/* Duplicate close button removed */}
                        </div>

                        <div className="p-4">
                          <div className="flex items-center justify-between mb-4">
                            <h5 className="font-bold text-gray-700 text-base">
                              {monthNames[currentMonth.getMonth()]}{" "}
                              {currentMonth.getFullYear()}
                            </h5>
                            <div className="flex gap-1">
                              <button
                                onClick={() => changeMonth(-1)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                              >
                                <ChevronLeft size={20} />
                              </button>
                              <button
                                onClick={() => changeMonth(1)}
                                className="p-1 hover:bg-gray-100 rounded text-gray-500"
                              >
                                <ChevronLeft size={20} className="rotate-180" />
                              </button>
                            </div>
                          </div>

                          <div className="grid grid-cols-7 mb-2 text-center">
                            {["S", "M", "T", "W", "T", "F", "S"].map((d, i) => (
                              <div
                                key={i}
                                className="text-xs font-bold text-blue-400"
                              >
                                {d}
                              </div>
                            ))}
                          </div>

                          <div className="grid grid-cols-7 gap-y-1">
                            {getDaysInMonth(currentMonth).map((date, i) => {
                              if (!date) return <div key={i} />;
                              const isSelected = isDateSelected(date);
                              const inRange = isDateInRange(date);
                              const isToday =
                                new Date().toDateString() ===
                                date.toDateString();

                              // Handling range styling logic
                              let rangeClass = "";
                              if (inRange)
                                rangeClass = "bg-blue-100 text-blue-900";
                              if (isSelected)
                                rangeClass =
                                  "bg-blue-500 text-white shadow-md transform scale-105 z-10";
                              // Rounding corners for range ends
                              if (
                                tempStartDate &&
                                date.toDateString() ===
                                  tempStartDate.toDateString() &&
                                tempEndDate
                              ) {
                                rangeClass += " rounded-l-full";
                              } else if (
                                tempEndDate &&
                                date.toDateString() ===
                                  tempEndDate.toDateString()
                              ) {
                                rangeClass += " rounded-r-full";
                              } else if (isSelected && !tempEndDate) {
                                rangeClass += " rounded-full";
                              } else if (!isSelected && !inRange) {
                                rangeClass +=
                                  " hover:bg-gray-100 text-gray-700 rounded-full";
                              }

                              if (inRange) rangeClass += " rounded-none"; // Range middle

                              return (
                                <button
                                  key={i}
                                  onClick={() => handleDateClick(date)}
                                  className={`
                                                        h-9 w-9 text-sm font-medium flex items-center justify-center transition-all relative
                                                        ${rangeClass}
                                                        ${
                                                          isToday &&
                                                          !isSelected &&
                                                          !inRange
                                                            ? "text-blue-600 font-bold"
                                                            : ""
                                                        } 
                                                    `}
                                >
                                  {date.getDate()}
                                  {isToday && !isSelected && !inRange && (
                                    <div className="absolute -bottom-1 w-1 h-1 bg-orange-400 rounded-full"></div>
                                  )}
                                </button>
                              );
                            })}
                          </div>
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
                          <div className="text-xs text-gray-500 font-semibold  max-w-[150px] truncate">
                            {tempStartDate ? (
                              <>
                                {formatDateShort(tempStartDate)}
                                {tempEndDate &&
                                  ` - ${formatDateShort(tempEndDate)}`}
                              </>
                            ) : (
                              "Select a date"
                            )}
                          </div>
                          <div className="flex gap-2">
                            {contentBlocks.some((b) => b.type === "date") && (
                              <button
                                onClick={removeDateBlock}
                                className="px-3 py-1.5 text-red-500 hover:bg-red-50 text-xs font-bold rounded-lg transition-colors"
                              >
                                Unset
                              </button>
                            )}
                            <button
                              onClick={handleSaveDate}
                              disabled={!tempStartDate}
                              className="px-4 py-1.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-lg shadow-sm transition-all"
                            >
                              Done
                            </button>
                          </div>
                        </div>
                      </div>
                    </>
                  )}
                </div>
                <div className="relative z-30">
                  <TaskActionButton
                    icon={<Paperclip size={20} />}
                    label="Attachment"
                    onClick={() => {
                      setAttachmentView("select");
                      setIsAttachmentPopoverOpen(true);
                    }}
                  />
                  {isAttachmentPopoverOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsAttachmentPopoverOpen(false)}
                      />
                      <div className="absolute top-0 right-full mr-4 w-[340px] bg-white rounded-xl shadow-2xl border border-gray-100 z-50 animate-in fade-in zoom-in-95 duration-200 overflow-hidden flex flex-col">
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {attachmentView === "link" && (
                              <button
                                onClick={() => setAttachmentView("select")}
                                className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 p-1 rounded-full"
                              >
                                <ChevronLeft size={18} />
                              </button>
                            )}
                            <h4 className="font-bold text-gray-800 text-base">
                              {attachmentView === "select"
                                ? "Add Attachment"
                                : "Add Link"}
                            </h4>
                          </div>
                          <button
                            onClick={() => setIsAttachmentPopoverOpen(false)}
                            className="text-gray-400 hover:text-gray-600"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {attachmentView === "select" && (
                          <div className="p-2">
                            <button
                              onClick={() => fileInputRef.current?.click()}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors text-gray-700 font-medium"
                            >
                              <Monitor size={18} className="text-gray-500" />
                              Computer
                            </button>
                            <button
                              onClick={() => setAttachmentView("link")}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 rounded-lg flex items-center gap-3 transition-colors text-gray-700 font-medium"
                            >
                              <LinkIcon size={18} className="text-gray-500" />
                              Paste a link
                            </button>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              onChange={handleFileUpload}
                            />
                          </div>
                        )}

                        {attachmentView === "link" && (
                          <div className="p-4 space-y-4">
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">
                                Link URL
                              </label>
                              <input
                                type="text"
                                value={linkUrl}
                                onChange={(e) => setLinkUrl(e.target.value)}
                                placeholder="Paste any link here..."
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white"
                                autoFocus
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-xs font-bold text-gray-500 uppercase">
                                Link Name (Optional)
                              </label>
                              <input
                                type="text"
                                value={linkText}
                                onChange={(e) => setLinkText(e.target.value)}
                                placeholder="Text to display"
                                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all bg-gray-50 focus:bg-white"
                              />
                            </div>
                            <button
                              onClick={handleAddLink}
                              disabled={!linkUrl}
                              className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-2 rounded-lg text-sm transition-colors shadow-sm shadow-blue-500/30"
                            >
                              Attach
                            </button>
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
