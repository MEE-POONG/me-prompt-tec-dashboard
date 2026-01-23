import React, { useState, useRef, useEffect } from "react";
import { X, ChevronDown, Check, Plus, Trash2, AlertCircle, Search } from "lucide-react";
import { WorkspaceMember } from "@/types/workspace";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";

const MemberAvatar = ({ member, className }: { member: WorkspaceMember; className?: string }) => {
    const [imgError, setImgError] = useState(false);
    const avatarUrl = member.userAvatar || member.avatar;
    const hasAvatar = !imgError && avatarUrl && (typeof avatarUrl === 'string') &&
        (avatarUrl.startsWith("http") || avatarUrl.startsWith("/") || avatarUrl.startsWith("data:"));

    const bgColor = member.color?.replace("text-", "bg-").split(" ")[0] || "bg-indigo-500";
    const initials = member.name ? member.name.substring(0, 2).toUpperCase() : "??";

    return (
        <div className={`relative flex items-center justify-center overflow-hidden rounded-full font-bold text-white shadow-sm border border-white ${bgColor} ${className}`}>
            <span className="z-0 text-xs">{initials}</span>
            {hasAvatar && (
                <img
                    src={avatarUrl as string}
                    alt={member.name}
                    className="absolute inset-0 w-full h-full object-cover z-10"
                    onError={() => setImgError(true)}
                />
            )}
        </div>
    );
};

export function MembersManageModal({
    isOpen,
    onClose,
    members,
    workspaceId,
    onMemberAdded,
    currentUser,
}: {
    isOpen: boolean;
    onClose: () => void;
    members: WorkspaceMember[];
    workspaceId?: string;
    onMemberAdded?: () => void;
    currentUser?: any;
}) {
    const [inviteEmail, setInviteEmail] = useState("");
    const [inviteRole, setInviteRole] = useState("Viewer");
    const [loading, setLoading] = useState(false);
    const [successMsg, setSuccessMsg] = useState("");
    const [errorMsg, setErrorMsg] = useState("");

    const [availUsers, setAvailUsers] = useState<any[]>([]);
    const [isInviteDropdownOpen, setIsInviteDropdownOpen] = useState(false);
    const inviteDropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (isOpen) {
            fetch('/api/workspace/users')
                .then(res => res.json())
                .then(data => {
                    if (Array.isArray(data)) {
                        const existingEmails = new Set(members.map(m => (m.email || "").toLowerCase()));
                        const filtered = data.filter((u: any) => !existingEmails.has((u.email || "").toLowerCase()));
                        setAvailUsers(filtered);
                    }
                })
                .catch(err => console.error("Failed to load users", err));
        }
    }, [isOpen, members]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (inviteDropdownRef.current && !inviteDropdownRef.current.contains(event.target as Node)) {
                setIsInviteDropdownOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const [successModal, setSuccessModal] = useState({ open: false, message: "", description: "" });
    const [errorModal, setErrorModal] = useState({ open: false, message: "", description: "" });

    const handleInvite = async () => {
        if (!inviteEmail.trim()) return;
        if (!workspaceId) {
            setErrorMsg("Workspace ID missing.");
            return;
        }

        setLoading(true);
        setSuccessMsg("");
        setErrorMsg("");

        try {
            const res = await fetch("/api/workspace/member", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    boardId: workspaceId,
                    email: inviteEmail.trim(),
                    role: inviteRole,
                }),
            });

            const data = await res.json();

            if (!res.ok) {
                throw new Error(data.message || "Failed to invite member");
            }

            setSuccessMsg("Member invited successfully!");
            setInviteEmail("");
            setInviteRole("Viewer");
            if (onMemberAdded) {
                onMemberAdded();
            }

            setTimeout(() => setSuccessMsg(""), 3000);
        } catch (err: any) {
            console.error(err);
            setErrorMsg(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateRole = async (memberId: string, newRole: string) => {
        try {
            const res = await fetch("/api/workspace/member", {
                method: "PUT",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ id: memberId, role: newRole }),
            });

            if (!res.ok) throw new Error("Failed to update role");

            if (onMemberAdded) onMemberAdded();
        } catch (error) {
            console.error(error);
            setErrorModal({
                open: true,
                message: "เกิดข้อผิดพลาด!",
                description: "ไม่สามารถเปลี่ยนบทบาทได้",
            });
        }
    };

    const [confirmRemoveId, setConfirmRemoveId] = useState<string | null>(null);

    const executeRemoveMember = async (memberId: string) => {
        try {
            const res = await fetch(`/api/workspace/member?id=${memberId}`, {
                method: "DELETE",
            });

            if (!res.ok) throw new Error("Failed to remove member");

            if (onMemberAdded) onMemberAdded();
            setConfirmRemoveId(null);
        } catch (error) {
            console.error(error);
            setErrorMsg("Failed to remove member");
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/40 z-60 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-xl w-full max-w-[500px] shadow-2xl p-5 m-4">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-xl text-slate-900">
                        เชิญสมาชิก (Invite member)
                    </h3>
                    <button onClick={onClose}>
                        <X size={20} className="text-slate-400 hover:text-slate-600" />
                    </button>
                </div>
                <div className="px-6 py-6 bg-slate-50/50 rounded-lg mb-4">
                    <div className="flex gap-2">
                        <div className="relative flex-1 group" ref={inviteDropdownRef}>
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 z-10 pointer-events-none">
                                <Search size={18} />
                            </div>
                            <input
                                value={inviteEmail}
                                onChange={(e) => {
                                    setInviteEmail(e.target.value);
                                    setIsInviteDropdownOpen(true);
                                }}
                                onFocus={() => setIsInviteDropdownOpen(true)}
                                placeholder="ค้นหาชื่อ หรือ อีเมล (Search name or email)"
                                className="w-full pl-10 pr-4 py-2.5 rounded-lg border border-slate-300 bg-white text-slate-900 placeholder:text-slate-500 text-sm focus:outline-none focus:border-blue-500 shadow-sm"
                            />

                            {isInviteDropdownOpen && (
                                <div className="absolute left-0 right-0 top-full mt-1 bg-white border border-slate-200 rounded-lg shadow-xl max-h-60 overflow-y-auto z-50 animate-in fade-in zoom-in-95">
                                    {availUsers
                                        .filter(u =>
                                            u.name.toLowerCase().includes(inviteEmail.toLowerCase()) ||
                                            u.email.toLowerCase().includes(inviteEmail.toLowerCase())
                                        )
                                        .slice(0, 50)
                                        .map((u) => (
                                            <div
                                                key={u.id}
                                                onClick={() => {
                                                    setInviteEmail(u.email);
                                                    setIsInviteDropdownOpen(false);
                                                }}
                                                className="px-4 py-2 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 flex items-center gap-3 transition-colors"
                                            >
                                                <div className="w-8 h-8 rounded-full bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    {u.avatar ? (
                                                        <img src={u.avatar} alt={u.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="flex items-center justify-center w-full h-full text-[10px] font-bold text-slate-400">
                                                            {u.name.substring(0, 2).toUpperCase()}
                                                        </div>
                                                    )}
                                                </div>

                                                <div className="flex-1 min-w-0">
                                                    <div className="flex items-center gap-2">
                                                        <p className="text-sm font-bold text-slate-800 truncate">{u.name}</p>

                                                        {u.position && (
                                                            <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide border
                                ${u.position.toLowerCase() === 'student' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' :
                                                                    u.position.toLowerCase() === 'staff' ? 'bg-amber-50 text-amber-600 border-amber-100' :
                                                                        u.role === 'admin' ? 'bg-purple-50 text-purple-600 border-purple-100' :
                                                                            'bg-slate-50 text-slate-500 border-slate-100'
                                                                }
                              `}>
                                                                {u.position}
                                                            </span>
                                                        )}
                                                        {u.role === 'admin' && !u.position && (
                                                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide bg-purple-50 text-purple-600 border border-purple-100">
                                                                Admin
                                                            </span>
                                                        )}
                                                    </div>
                                                    <p className="text-xs text-slate-500 truncate">{u.email}</p>
                                                </div>
                                            </div>
                                        ))}
                                    {availUsers.filter(u => u.name.toLowerCase().includes(inviteEmail.toLowerCase()) || u.email.includes(inviteEmail)).length === 0 && (
                                        <div className="px-4 py-3 text-center text-sm text-slate-400">
                                            ไม่พบผู้ใช้ (พิมพ์อีเมลเพื่อเชิญคนนอก)
                                        </div>
                                    )}
                                </div>
                            )}
                        </div>

                        <div className="relative w-32 shrink-0">
                            <select
                                value={inviteRole}
                                onChange={(e) => setInviteRole(e.target.value)}
                                className="w-full appearance-none px-3 py-2.5 rounded-lg border border-slate-300 bg-white text-sm font-medium text-slate-700 focus:outline-none focus:border-blue-500 shadow-sm cursor-pointer"
                            >
                                <option value="Viewer">Viewer</option>
                                <option value="Editor">Editor</option>
                            </select>
                            <ChevronDown
                                size={14}
                                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none"
                            />
                        </div>

                        <button
                            onClick={handleInvite}
                            disabled={loading}
                            className="px-4 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-bold hover:bg-blue-700 shadow-md active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                        >
                            {loading ? "..." : "เชิญ"}
                        </button>
                    </div>

                    {successMsg && (
                        <div className="flex items-center gap-2 text-sm text-green-600 font-medium animate-in fade-in slide-in-from-top-1 mt-2">
                            <Check size={16} /> {successMsg}
                        </div>
                    )}
                    {errorMsg && (
                        <div className="flex items-center gap-2 text-sm text-red-600 font-medium animate-in fade-in slide-in-from-top-1 mt-2">
                            <AlertCircle size={16} /> {errorMsg}
                        </div>
                    )}
                </div>
                <div className="flex-1 overflow-y-auto max-h-[300px] custom-scrollbar">
                    <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">
                        Members ({members.length})
                    </h4>
                    <div className="space-y-1">
                        {members.map((member, index) => {
                            const currentUserMember = members.find(m =>
                                (currentUser && m.userId === currentUser.id) ||
                                (currentUser && m.name === currentUser.name)
                            );
                            const currentUserRole = currentUserMember?.role || "Viewer";
                            const isOwner = currentUserRole === "Owner";

                            const isSelf =
                                currentUser &&
                                (member.userId === currentUser.id ||
                                    member.id === currentUser.id);
                            const isBoardOwner = member.role === "Owner";

                            const canDelete = !isSelf && !isBoardOwner && isOwner;
                            const canEdit = !isBoardOwner && isOwner;

                            return (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-2 hover:bg-slate-50 rounded-xl transition-colors group"
                                >
                                    <div className="flex items-center gap-3">
                                        <MemberAvatar member={member} className="w-10 h-10 text-sm" />
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-slate-800 flex items-center gap-2">
                                                {member.name}
                                                {member.role === "Owner" && (
                                                    <span className="px-1.5 py-0.5 rounded bg-purple-100 text-purple-700 text-[10px] font-extrabold uppercase tracking-wider">
                                                        Owner
                                                    </span>
                                                )}
                                                {member.role === "Editor" && (
                                                    <span className="px-1.5 py-0.5 rounded bg-blue-100 text-blue-700 text-[10px] font-bold uppercase tracking-wider">
                                                        Editor
                                                    </span>
                                                )}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <select
                                            value={member.role || "Viewer"}
                                            onChange={(e) =>
                                                handleUpdateRole(member.id, e.target.value)
                                            }
                                            disabled={!canEdit}
                                            className={`text-xs font-bold text-slate-600 px-2 py-1.5 bg-slate-100 rounded-lg border-none focus:ring-2 focus:ring-blue-500 outline-none ${!canEdit ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                                        >
                                            <option value="Viewer">Viewer</option>
                                            <option value="Editor">Editor</option>
                                            {member.role === "Owner" && <option value="Owner">Owner</option>}
                                        </select>
                                        {canDelete &&
                                            (confirmRemoveId === member.id ? (
                                                <div className="flex items-center gap-1 ml-1 animate-in slide-in-from-right-2 fade-in duration-200">
                                                    <span className="text-[10px] font-bold text-red-500 hidden sm:inline">
                                                        ยืนยัน?
                                                    </span>
                                                    <button
                                                        onClick={() => executeRemoveMember(member.id)}
                                                        className="p-1 px-3 bg-red-600 text-white rounded-lg text-xs font-bold hover:bg-red-700 shadow-sm transition-all"
                                                    >
                                                        ลบ
                                                    </button>
                                                    <button
                                                        onClick={() => setConfirmRemoveId(null)}
                                                        className="p-1 text-slate-400 hover:text-slate-600 hover:bg-slate-100 rounded-lg transition-colors"
                                                    >
                                                        <X size={14} />
                                                    </button>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => setConfirmRemoveId(member.id)}
                                                    className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
                                                    title="Remove member"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            ))}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>

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
        </div>
    );
}
