import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import {
  User,
  Mail,
  Phone,
  Briefcase,
  Shield,
  Save,
  Edit2,
  X,
  Camera,
  Key,
} from "lucide-react";
import ModalSuccess from "@/components/ui/Modals/ModalSuccess";
import ModalError from "@/components/ui/Modals/ModalError";
import ImageUpload from "@/components/ImageUpload";
import { CloudflareImageData } from "@/lib/cloudflareImage";

type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  phone: string | null;
  position: string | null;
  role: string | null;
  isVerified: boolean;
  avatar?: string | null;
};

export default function ProfilePage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [showPasswordModal, setShowPasswordModal] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    avatar: "",
  });

  // Password modal state
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });

  // Image upload state
  const [avatarUrl, setAvatarUrl] = useState("");
  const [imageData, setImageData] = useState<CloudflareImageData | null>(null);

  // Modal states
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

  // Fetch current user profile
  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      setLoading(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      if (!token || !user.id) {
        setErrorModal({
          open: true,
          message: "ไม่พบข้อมูลผู้ใช้",
          description: "กรุณาเข้าสู่ระบบใหม่อีกครั้ง",
        });
        return;
      }

      const res = await fetch(`/api/account/${user.id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        throw new Error("Failed to fetch profile");
      }

      const data = await res.json();
      console.log("API Response:", data); // Debug log
      console.log("Avatar from API:", data.avatar); // Debug log

      setProfile(data);

      // Update both formData and avatarUrl from API response
      const avatarFromApi = data.avatar || "";
      console.log("Setting avatarUrl to:", avatarFromApi); // Debug log

      setFormData({
        name: data.name || "",
        email: data.email || "",
        phone: data.phone || "",
        avatar: avatarFromApi,
      });
      setAvatarUrl(avatarFromApi);
    } catch (error) {
      console.error("Error fetching profile:", error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด",
        description: "ไม่สามารถโหลดข้อมูลโปรไฟล์ได้",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (url: string, data?: CloudflareImageData) => {
    console.log("handleImageChange called with URL:", url); // Debug
    setAvatarUrl(url);
    setFormData((prev) => ({ ...prev, avatar: url }));
    if (data) {
      setImageData(data);
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const updateData: any = {
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        avatar: avatarUrl,
      };

      const res = await fetch(`/api/account/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(updateData),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to update profile");
      }

      // Update localStorage with new user data
      const updatedUser = {
        ...user,
        name: formData.name,
        email: formData.email,
        avatar: avatarUrl,
      };
      localStorage.setItem("user", JSON.stringify(updatedUser));

      setSuccessModal({
        open: true,
        message: "บันทึกสำเร็จ",
        description: "ข้อมูลโปรไฟล์ของคุณได้รับการอัปเดตแล้ว",
      });

      setIsEditing(false);
      await fetchProfile();
    } catch (error: any) {
      console.error("Error updating profile:", error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถบันทึกข้อมูลได้",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    // Validate passwords
    if (
      !passwordData.currentPassword ||
      !passwordData.newPassword ||
      !passwordData.confirmPassword
    ) {
      setErrorModal({
        open: true,
        message: "กรุณากรอกข้อมูลให้ครบถ้วน",
        description: "กรุณากรอกรหัสผ่านปัจจุบันและรหัสผ่านใหม่",
      });
      return;
    }

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setErrorModal({
        open: true,
        message: "รหัสผ่านไม่ตรงกัน",
        description: "กรุณาตรวจสอบรหัสผ่านและยืนยันรหัสผ่านอีกครั้ง",
      });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setErrorModal({
        open: true,
        message: "รหัสผ่านสั้นเกินไป",
        description: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร",
      });
      return;
    }

    try {
      const token = localStorage.getItem("token");
      const user = JSON.parse(localStorage.getItem("user") || "{}");

      const res = await fetch(`/api/account/${user.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          password: passwordData.newPassword,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Failed to change password");
      }

      setSuccessModal({
        open: true,
        message: "เปลี่ยนรหัสผ่านสำเร็จ",
        description: "รหัสผ่านของคุณได้รับการอัปเดตแล้ว",
      });

      setShowPasswordModal(false);
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (error: any) {
      console.error("Error changing password:", error);
      setErrorModal({
        open: true,
        message: "เกิดข้อผิดพลาด",
        description: error.message || "ไม่สามารถเปลี่ยนรหัสผ่านได้",
      });
    }
  };

  const handleCancel = () => {
    if (profile) {
      setFormData({
        name: profile.name || "",
        email: profile.email || "",
        phone: profile.phone || "",
        avatar: profile.avatar || "",
      });
      setAvatarUrl(profile.avatar || "");
    }
    setIsEditing(false);
  };

  if (loading) {
    return (
      <Layouts>
        <div className="min-h-screen bg-[#f8f9fc] flex items-center justify-center">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-slate-600 font-medium">กำลังโหลดข้อมูล...</p>
          </div>
        </div>
      </Layouts>
    );
  }

  return (
    <Layouts>
      <div className="min-h-screen bg-[#f8f9fc] py-8 px-4 relative overflow-hidden font-sans text-slate-800">
        {/* Background Aurora */}
        <div className="fixed inset-0 w-full h-full -z-10 pointer-events-none">
          <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-blue-200/40 rounded-full blur-[120px] mix-blend-multiply animate-pulse"></div>
          <div className="absolute top-[-10%] right-[-5%] w-[40%] h-[40%] bg-purple-200/40 rounded-full blur-[120px] mix-blend-multiply"></div>
          <div className="absolute bottom-[-10%] left-[-5%] w-[40%] h-[40%] bg-indigo-200/30 rounded-full blur-[120px] mix-blend-multiply"></div>
        </div>

        <div className="max-w-4xl mx-auto relative z-10">
          {/* Header */}
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
              <div className="p-3.5 bg-linear-to-br from-blue-600 to-indigo-600 text-white rounded-2xl shadow-lg shadow-blue-500/30">
                <User size={32} strokeWidth={1.5} />
              </div>
              <div>
                <h1 className="text-4xl font-black tracking-tight bg-linear-to-r from-slate-800 via-blue-800 to-slate-800 bg-clip-text text-transparent">
                  โปรไฟล์ของฉัน
                </h1>
                <p className="text-slate-500 mt-1 font-medium">
                  จัดการข้อมูลส่วนตัวของคุณ
                </p>
              </div>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => setShowPasswordModal(true)}
                className="flex items-center gap-2 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-purple-500/20 hover:-translate-y-1"
              >
                <Key size={20} />
                <span>เปลี่ยนรหัสผ่าน</span>
              </button>

              {!isEditing ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 hover:-translate-y-1"
                >
                  <Edit2 size={20} />
                  <span>แก้ไขข้อมูล</span>
                </button>
              ) : (
                <>
                  <button
                    onClick={handleCancel}
                    className="flex items-center gap-2 bg-slate-200 hover:bg-slate-300 text-slate-700 px-6 py-3 rounded-xl text-sm font-bold transition-all"
                  >
                    <X size={20} />
                    <span>ยกเลิก</span>
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl text-sm font-bold transition-all shadow-lg shadow-green-500/20 hover:-translate-y-1 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <Save size={20} />
                    <span>{isSaving ? "กำลังบันทึก..." : "บันทึก"}</span>
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Profile Card */}
          <div className="bg-white/80 backdrop-blur-xl rounded-3xl shadow-sm border border-white/60 overflow-hidden">
            <div className="p-8">
              {/* Avatar Section */}
              <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="relative group">
                  {isEditing ? (
                    <div className="relative">
                      <input
                        type="file"
                        accept="image/*"
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            // Show preview immediately
                            const reader = new FileReader();
                            reader.onloadend = () => {
                              setAvatarUrl(reader.result as string);
                            };
                            reader.readAsDataURL(file);

                            // Upload to Cloudflare
                            const formData = new FormData();
                            formData.append("file", file);

                            try {
                              const res = await fetch(
                                "/api/cloudflare-image/upload",
                                {
                                  method: "POST",
                                  body: formData,
                                }
                              );

                              if (res.ok) {
                                const response = await res.json();
                                console.log("Full upload response:", response); // Debug

                                // API returns { success, message, data: imageRecord }
                                // imageRecord has publicUrl field
                                const imageUrl =
                                  response.data?.publicUrl ||
                                  response.publicUrl;
                                console.log("Extracted imageUrl:", imageUrl); // Debug

                                if (imageUrl) {
                                  handleImageChange(
                                    imageUrl,
                                    response.data || response
                                  );
                                } else {
                                  console.error(
                                    "No URL found in response:",
                                    response
                                  );
                                  setErrorModal({
                                    open: true,
                                    message: "เกิดข้อผิดพลาด",
                                    description: "ไม่พบ URL ของรูปภาพ",
                                  });
                                }
                              } else {
                                console.error("Upload failed:", res.status); // Debug
                                setErrorModal({
                                  open: true,
                                  message: "เกิดข้อผิดพลาด",
                                  description: "ไม่สามารถอัปโหลดรูปภาพได้",
                                });
                              }
                            } catch (error) {
                              console.error("Upload error:", error);
                              setErrorModal({
                                open: true,
                                message: "เกิดข้อผิดพลาด",
                                description: "ไม่สามารถอัปโหลดรูปภาพได้",
                              });
                            }
                          }
                        }}
                        className="hidden"
                        id="avatar-upload"
                      />
                      <label
                        htmlFor="avatar-upload"
                        className="cursor-pointer block"
                      >
                        {avatarUrl ? (
                          <div className="relative group">
                            <img
                              src={avatarUrl}
                              alt="Profile"
                              className="w-32 h-32 rounded-full object-cover shadow-lg shadow-blue-500/30 border-4 border-white"
                            />
                            <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={32} className="text-white" />
                            </div>
                          </div>
                        ) : (
                          <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-blue-500/30 border-4 border-white group-hover:opacity-80 transition-opacity relative">
                            {(formData.name || "U").charAt(0).toUpperCase()}
                            <div className="absolute inset-0 bg-black/30 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <Camera size={32} className="text-white" />
                            </div>
                          </div>
                        )}
                      </label>
                    </div>
                  ) : (
                    <div className="relative">
                      {avatarUrl ? (
                        <img
                          src={avatarUrl}
                          alt="Profile"
                          className="w-32 h-32 rounded-full object-cover shadow-lg shadow-blue-500/30 border-4 border-white"
                        />
                      ) : (
                        <div className="w-32 h-32 rounded-full bg-linear-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-5xl font-bold shadow-lg shadow-blue-500/30 border-4 border-white">
                          {(formData.name || "U").charAt(0).toUpperCase()}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                <div className="flex-1 text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-800">
                    {formData.name || "ไม่ระบุชื่อ"}
                  </h2>
                  <p className="text-slate-500 font-medium">
                    {profile?.position || "ไม่ระบุตำแหน่ง"}
                  </p>
                  <p className="text-sm text-slate-400 mt-1">
                    {(profile?.role || "viewer").toUpperCase()}
                  </p>
                  {profile?.isVerified ? (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold bg-green-50 text-green-600 border border-green-100">
                      ✔ อีเมลยืนยันแล้ว
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 mt-2 px-3 py-1 rounded-full text-xs font-bold bg-amber-50 text-amber-600 border border-amber-100">
                      ✖ ยังไม่ยืนยันอีเมล
                    </span>
                  )}
                </div>
              </div>

              {/* Form Fields */}
              <div className="space-y-6">
                {/* Name */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                    <User size={16} />
                    ชื่อ-นามสกุล
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({ ...formData, name: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {/* Email */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                    <Mail size={16} />
                    อีเมล
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {/* Phone */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                    <Phone size={16} />
                    เบอร์โทรศัพท์
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    disabled={!isEditing}
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all outline-none disabled:bg-slate-50 disabled:text-slate-500"
                  />
                </div>

                {/* Position (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                    <Briefcase size={16} />
                    ตำแหน่ง
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                    {profile?.position || "-"}
                  </div>
                </div>

                {/* Role (Read-only) */}
                <div>
                  <label className="flex items-center gap-2 text-sm font-bold text-slate-600 mb-2">
                    <Shield size={16} />
                    บทบาท
                  </label>
                  <div className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-slate-50 text-slate-500">
                    {(profile?.role || "viewer").toUpperCase()}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Password Change Modal */}
        {showPasswordModal && (
          <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center backdrop-blur-sm animate-in fade-in">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md m-4 overflow-hidden">
              <div className="bg-linear-to-r from-purple-600 to-indigo-600 p-6 text-white">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-white/20 rounded-lg">
                      <Key size={24} />
                    </div>
                    <h3 className="text-xl font-bold">เปลี่ยนรหัสผ่าน</h3>
                  </div>
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="p-1 hover:bg-white/20 rounded-lg transition-colors"
                  >
                    <X size={20} />
                  </button>
                </div>
              </div>

              <div className="p-6 space-y-4">
                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">
                    รหัสผ่านปัจจุบัน
                  </label>
                  <input
                    type="password"
                    value={passwordData.currentPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        currentPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="กรอกรหัสผ่านปัจจุบัน"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">
                    รหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={passwordData.newPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        newPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="กรอกรหัสผ่านใหม่ (อย่างน้อย 6 ตัวอักษร)"
                  />
                </div>

                <div>
                  <label className="text-sm font-bold text-slate-600 mb-2 block">
                    ยืนยันรหัสผ่านใหม่
                  </label>
                  <input
                    type="password"
                    value={passwordData.confirmPassword}
                    onChange={(e) =>
                      setPasswordData({
                        ...passwordData,
                        confirmPassword: e.target.value,
                      })
                    }
                    className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:border-purple-500 focus:ring-4 focus:ring-purple-100 transition-all outline-none"
                    placeholder="ยืนยันรหัสผ่านใหม่อีกครั้ง"
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    onClick={() => {
                      setShowPasswordModal(false);
                      setPasswordData({
                        currentPassword: "",
                        newPassword: "",
                        confirmPassword: "",
                      });
                    }}
                    className="flex-1 px-4 py-3 rounded-xl border border-slate-200 bg-white text-slate-600 font-bold hover:bg-slate-50 transition-all"
                  >
                    ยกเลิก
                  </button>
                  <button
                    onClick={handlePasswordChange}
                    className="flex-1 px-4 py-3 rounded-xl bg-purple-600 text-white font-bold hover:bg-purple-700 shadow-lg shadow-purple-500/20 transition-all"
                  >
                    บันทึก
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Modals */}
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
    </Layouts>
  );
}
