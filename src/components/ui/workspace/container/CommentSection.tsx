import React, { useState, useRef } from "react";
import {
  User,
  Plus,
  Paperclip,
  X,
  Link as LinkIcon,
  FileText,
} from "lucide-react";
import { CommentItem, AttachmentItem } from "./types";

interface CommentSectionProps {
  logActivity: (action: string, target?: string, type?: "comment") => void;
}

export function CommentSection({ logActivity }: CommentSectionProps) {
  // Comment State
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [newComment, setNewComment] = useState("");
  const [commentAttachments, setCommentAttachments] = useState<
    AttachmentItem[]
  >([]);

  // Comment Editing State
  const [editingCommentId, setEditingCommentId] = useState<string | null>(null);
  const [editingCommentText, setEditingCommentText] = useState("");

  const commentFileInputRef = useRef<HTMLInputElement>(null);

  const handleAddComment = () => {
    if (!newComment.trim() && commentAttachments.length === 0) return;

    const newCommentItem: CommentItem = {
      id: Date.now().toString(),
      user: "Poom", // Using hardcoded user for now
      text: newComment,
      timestamp: new Date(),
      attachments: commentAttachments,
    };

    setComments([...comments, newCommentItem]);
    logActivity("แสดงความคิดเห็น", undefined, "comment");
    setNewComment("");
    setCommentAttachments([]);
  };

  const handleCommentFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const newAttachment: AttachmentItem = {
      id: Date.now().toString(),
      type: "file",
      name: file.name,
      dateAdded: new Date(),
    };

    setCommentAttachments([...commentAttachments, newAttachment]);
    if (commentFileInputRef.current) commentFileInputRef.current.value = "";
  };

  const removeCommentAttachment = (attachmentId: string) => {
    setCommentAttachments(
      commentAttachments.filter((a) => a.id !== attachmentId)
    );
  };

  const handleDeleteComment = (id: string) => {
    setComments(comments.filter((c) => c.id !== id));
    logActivity("ลบความคิดเห็น", undefined, "comment");
  };

  const startEditComment = (comment: CommentItem) => {
    setEditingCommentId(comment.id);
    setEditingCommentText(comment.text);
  };

  const cancelEditComment = () => {
    setEditingCommentId(null);
    setEditingCommentText("");
  };

  const saveEditComment = (id: string) => {
    setComments(
      comments.map((c) =>
        c.id === id ? { ...c, text: editingCommentText } : c
      )
    );
    setEditingCommentId(null);
    setEditingCommentText("");
    logActivity("แก้ไขความคิดเห็น", undefined, "comment");
  };

  return (
    <div className="space-y-6">
      {/* Comment List */}
      <div className="space-y-6">
        {comments.map((c) => (
          <div key={c.id} className="flex gap-4 group">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm shrink-0 shadow-sm border border-blue-200">
              {c.user[0]}
            </div>
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-gray-900">{c.user}</span>
                <span className="text-xs text-gray-400">
                  {c.timestamp.toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
              <div className="bg-white border border-gray-200 p-4 rounded-2xl rounded-tl-none shadow-sm text-gray-700 relative">
                {editingCommentId === c.id ? (
                  <div className="space-y-2">
                    <textarea
                      value={editingCommentText}
                      onChange={(e) => setEditingCommentText(e.target.value)}
                      className="w-full border border-blue-300 rounded-xl p-2 text-sm outline-none focus:ring-2 focus:ring-blue-100"
                      rows={3}
                      autoFocus
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={cancelEditComment}
                        className="px-3 py-1 text-xs font-bold text-gray-500 hover:bg-gray-100 rounded-lg"
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => saveEditComment(c.id)}
                        className="px-3 py-1 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-lg"
                      >
                        Save
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    <p className="whitespace-pre-wrap">{c.text}</p>

                    {/* Comment Attachments */}
                    {c.attachments && c.attachments.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {c.attachments.map((att) => (
                          <div
                            key={att.id}
                            className="flex items-center gap-2 bg-gray-50 border border-gray-200 px-3 py-2 rounded-lg hover:bg-white hover:shadow-sm transition-all cursor-pointer"
                          >
                            <div className="text-blue-500">
                              {att.type === "link" ? (
                                <LinkIcon size={16} />
                              ) : (
                                <FileText size={16} />
                              )}
                            </div>
                            <span className="text-sm font-medium text-gray-700 truncate max-w-[150px]">
                              {att.name}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* Edit/Delete Actions */}
                    <div className="flex justify-end gap-3 mt-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEditComment(c)}
                        className="text-xs font-bold text-gray-400 hover:text-blue-600 hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteComment(c.id)}
                        className="text-xs font-bold text-gray-400 hover:text-red-600 hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Input Area */}
      <div className="flex gap-5 pt-4 border-t border-gray-100">
        <div className="w-11 h-11 rounded-full bg-linear-to-br from-gray-200 to-gray-300 shrink-0 mt-1 flex items-center justify-center shadow-inner">
          <User className="w-6 h-6 text-white" fill="white" />
        </div>
        <div className="flex-1 space-y-4">
          <div className="bg-gray-50 border border-gray-200 focus-within:bg-white focus-within:border-blue-400 focus-within:shadow-lg focus-within:shadow-blue-500/10 p-2 rounded-3xl min-h-[100px] transition-all duration-300 relative">
            {/* Attachment Preview in Input */}
            {commentAttachments.length > 0 && (
              <div className="flex flex-wrap gap-2 px-3 pt-2 pb-1">
                {commentAttachments.map((att) => (
                  <div
                    key={att.id}
                    className="flex items-center gap-2 bg-blue-50 border border-blue-100 px-2 py-1 rounded-lg text-xs"
                  >
                    <span className="font-semibold text-blue-700 max-w-[100px] truncate">
                      {att.name}
                    </span>
                    <button
                      onClick={() => removeCommentAttachment(att.id)}
                      className="text-blue-400 hover:text-blue-600"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
              </div>
            )}
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleAddComment();
                }
              }}
              placeholder="แสดงความคิดเห็น หรือ @mention..."
              className="w-full bg-transparent outline-none text-gray-700 placeholder-gray-400 resize-none min-h-[80px] text-base px-3 py-2"
            />
            <div className="flex justify-between items-center px-2 pb-1">
              <div className="flex gap-2">
                <button
                  onClick={() => commentFileInputRef.current?.click()}
                  className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 rounded-full transition-colors"
                  title="Attach file"
                >
                  <Paperclip size={18} />
                </button>
                <input
                  type="file"
                  ref={commentFileInputRef}
                  className="hidden"
                  onChange={handleCommentFileUpload}
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end">
            <button
              onClick={handleAddComment}
              disabled={!newComment.trim() && commentAttachments.length === 0}
              className="bg-yellow-400 hover:bg-yellow-300 disabled:opacity-50 disabled:cursor-not-allowed text-blue-900 font-bold px-8 py-2.5 rounded-2xl transition-all shadow-md hover:shadow-lg hover:-translate-y-1 active:translate-y-0 text-sm flex items-center gap-2"
            >
              ส่งคอมเมนต์ <Plus size={16} strokeWidth={3} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
