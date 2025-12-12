import React, { useState } from "react";
import { X, Search, Check, MoreVertical, Trash2, Edit } from "lucide-react";
import { Member } from "./types";

interface MemberModalProps {
  isOpen: boolean;
  onClose: () => void;
  members: Member[];
  assignedMemberIds: string[];
  onToggle: (memberId: string) => void;
}

export function MemberModal({
  isOpen,
  onClose,
  members,
  assignedMemberIds,
  onToggle,
}: MemberModalProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [openMenuMemberId, setOpenMenuMemberId] = useState<string | null>(null);

  if (!isOpen) return null;

  // Filter for search results: Matches search AND NOT assigned
  const searchResults = members.filter(
    (member) =>
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !assignedMemberIds.includes(member.id)
  );

  // Filter for assigned list: Only assigned members
  const assignedMembers = members.filter((member) =>
    assignedMemberIds.includes(member.id)
  );

  return (
    <div className="fixed inset-0 z-60 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-2xl overflow-hidden border border-gray-100 transform transition-all scale-100">
        <div className="p-6 space-y-6">
          {/* Search Section */}
          <div className="space-y-2">
            <h3 className="font-bold text-gray-900 text-lg">ค้นหาสมาชิก</h3>
            <div className="relative group">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                size={18}
              />
              <input
                type="text"
                placeholder="พิมพ์ชื่อสมาชิกที่จะเพิ่ม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl py-2.5 pl-10 pr-4 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/10 transition-all text-sm text-gray-700 placeholder-gray-400"
              />
            </div>

            {/* Search Results */}
            {searchTerm && (
              <div className="mt-2 space-y-2">
                {searchResults.map((member) => (
                  <div
                    key={member.id}
                    className="flex items-center justify-between p-2 bg-white border border-gray-100 rounded-xl shadow-sm"
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-9 h-9 rounded-full ${member.color} border-2 border-white shadow-sm`}
                      />
                      <span className="font-semibold text-gray-900 text-sm">
                        {member.name}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-gray-400 px-2 py-1">
                        {member.role}
                      </span>
                      <button
                        onClick={() => onToggle(member.id)} // Adds the member
                        className="bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-xs px-3 py-1.5 rounded-lg transition-colors"
                      >
                        เพิ่ม
                      </button>
                    </div>
                  </div>
                ))}
                {searchResults.length === 0 && (
                  <p className="text-xs text-center text-gray-400 py-1">
                    ไม่พบรายชื่อที่ค้นหา
                  </p>
                )}
              </div>
            )}
          </div>

          <div className="h-px bg-gray-100" />

          {/* Members List Section */}
          <div className="space-y-3">
            <h3 className="font-bold text-gray-900 text-lg">สมาชิกทั้งหมด</h3>
            <div className="max-h-[200px] overflow-y-auto space-y-2 custom-scrollbar pr-1">
              {assignedMembers.map((member) => (
                <div
                  key={member.id}
                  onClick={() => onToggle(member.id)} // Removes on click
                  className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-xl transition-colors cursor-pointer group"
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-9 h-9 rounded-full ${member.color} border-2 border-white shadow-sm`}
                    />
                    <span className="font-semibold text-gray-900 text-sm">
                      {member.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-md group-hover:bg-white group-hover:text-blue-500 transition-colors">
                      {member.role}
                    </span>
                    <div className="relative">
                      <button
                        className="p-1 hover:bg-white rounded-full transition-colors"
                        onClick={(e) => {
                          e.stopPropagation();
                          setOpenMenuMemberId(
                            openMenuMemberId === member.id ? null : member.id
                          );
                        }}
                      >
                        <MoreVertical
                          size={16}
                          className="text-gray-400 group-hover:text-gray-600"
                        />
                      </button>

                      {/* Dropdown Menu */}
                      {openMenuMemberId === member.id && (
                        <>
                          <div
                            className="fixed inset-0 z-10"
                            onClick={(e) => {
                              e.stopPropagation();
                              setOpenMenuMemberId(null);
                            }}
                          />
                          <div className="absolute right-0 top-full mt-1 w-32 bg-white rounded-xl shadow-lg border border-gray-100 p-1.5 z-20 animate-in fade-in zoom-in-95 duration-200">
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                console.log("Edit role for", member.name);
                                setOpenMenuMemberId(null);
                              }}
                              className="w-full text-left px-2 py-1.5 text-xs font-semibold text-gray-700 hover:bg-gray-50 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Edit size={14} />
                              แก้ไข
                            </button>
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                onToggle(member.id); // Delete
                                setOpenMenuMemberId(null);
                              }}
                              className="w-full text-left px-2 py-1.5 text-xs font-semibold text-red-600 hover:bg-red-50 rounded-lg flex items-center gap-2 transition-colors"
                            >
                              <Trash2 size={14} />
                              ลบ
                            </button>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              ))}
              {assignedMembers.length === 0 && (
                <div className="text-center py-4 text-gray-400 text-sm">
                  ไม่มีสมาชิกในงานนี้
                </div>
              )}
            </div>
          </div>

          {/* Footer / Save Button */}
          <div className="flex justify-end pt-2">
            <button
              onClick={onClose}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-8 rounded-xl shadow-md shadow-blue-500/20 active:scale-95 transition-all text-sm"
            >
              เสร็จสิ้น
            </button>
          </div>
        </div>
      </div>

      {/* Background click to close */}
      <div className="fixed inset-0 -z-10" onClick={onClose} />
    </div>
  );
}
