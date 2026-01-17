import React, { useState, useEffect } from "react";
import Layouts from "@/components/Layouts";
import { Shield, Lock, Users, User, LogOut, RefreshCw } from "lucide-react";

interface UserData {
  id: string;
  email: string;
  name: string | null;
  role: string;
  position: string | null;
  isActive: boolean;
}

export default function TestAuthPage() {
  const [user, setUser] = useState<UserData | null>(null);
  const [loading, setLoading] = useState(true);
  const [testResults, setTestResults] = useState<{ [key: string]: any }>({});

  // ดึงข้อมูล User ปัจจุบัน
  const fetchCurrentUser = async () => {
    try {
      setLoading(true);
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("/api/auth/me", {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUser(data.user);
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user:", error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCurrentUser();
  }, []);

  // ทดสอบ API
  const testAPI = async (endpoint: string, name: string) => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch(endpoint, {
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });
      const data = await response.json();

      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: response.status,
          success: response.ok,
          data,
        }
      }));
    } catch (error) {
      setTestResults(prev => ({
        ...prev,
        [name]: {
          status: 'error',
          success: false,
          error: error instanceof Error ? error.message : 'Unknown error',
        }
      }));
    }
  };

  // Logout
  const handleLogout = async () => {
    try {
      const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
      const response = await fetch("/api/auth/logout", {
        method: "POST",
        headers: {
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
      });

      if (response.ok) {
        setUser(null);
        setTestResults({});
        alert("ออกจากระบบสำเร็จ");
      }
    } catch (error) {
      console.error("Logout error:", error);
      alert("เกิดข้อผิดพลาดในการออกจากระบบ");
    }
  };

  if (loading) {
    return (
      <Layouts>
        <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 animate-spin mx-auto text-violet-600 mb-4" />
            <p className="text-slate-600">กำลังโหลด...</p>
          </div>
        </div>
      </Layouts>
    );
  }

  return (
    <Layouts>
      <div className="min-h-screen bg-linear-to-br from-purple-50 to-blue-50 py-12 px-4">
        <div className="max-w-6xl mx-auto">

          {/* Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="p-3 bg-linear-to-br from-violet-600 to-purple-600 rounded-xl">
                  <Shield className="w-8 h-8 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-slate-800">ทดสอบระบบ Authentication</h1>
                  <p className="text-slate-500 mt-1">JWT Token + httpOnly Cookies + Role-based Authorization</p>
                </div>
              </div>

              {user && (
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              )}
            </div>
          </div>

          {/* User Info */}
          {user ? (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8">
              <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center gap-2">
                <User size={24} className="text-green-600" />
                ข้อมูลผู้ใช้ปัจจุบัน
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Email</p>
                  <p className="font-bold text-slate-800">{user.email}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Name</p>
                  <p className="font-bold text-slate-800">{user.name || "-"}</p>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Role</p>
                  <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${user.role === "admin" ? "bg-red-100 text-red-700" :
                      user.role === "staff" ? "bg-blue-100 text-blue-700" :
                        "bg-gray-100 text-gray-700"
                    }`}>
                    {user.role.toUpperCase()}
                  </span>
                </div>
                <div className="p-4 bg-slate-50 rounded-lg">
                  <p className="text-sm text-slate-500">Status</p>
                  <span className={`inline-block px-3 py-1 rounded-lg font-bold text-sm ${user.isActive ? "bg-green-100 text-green-700" : "bg-red-100 text-red-700"
                    }`}>
                    {user.isActive ? "Active" : "Inactive"}
                  </span>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 text-center">
              <Lock className="w-16 h-16 mx-auto text-slate-300 mb-4" />
              <h2 className="text-xl font-bold text-slate-800 mb-2">ยังไม่ได้ login</h2>
              <p className="text-slate-500 mb-4">กรุณา login ก่อนเพื่อทดสอบระบบ</p>
              <a
                href="/login"
                className="inline-block px-6 py-3 bg-violet-600 text-white rounded-lg hover:bg-violet-700 transition-colors font-bold"
              >
                ไปหน้า Login
              </a>
            </div>
          )}

          {/* API Tests */}
          <div className="bg-white rounded-2xl shadow-lg p-8">
            <h2 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
              <Users size={24} className="text-violet-600" />
              ทดสอบ Protected APIs
            </h2>

            <div className="space-y-4">
              {/* Test 1: Any logged in */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">API: ทุก Role (ที่ login แล้ว)</h3>
                    <p className="text-sm text-slate-500">/api/protected/any-logged-in</p>
                  </div>
                  <button
                    onClick={() => testAPI("/api/protected/any-logged-in", "anyLoggedIn")}
                    className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors text-sm font-bold"
                  >
                    ทดสอบ
                  </button>
                </div>
                {testResults.anyLoggedIn && (
                  <div className={`mt-2 p-3 rounded-lg ${testResults.anyLoggedIn.success ? "bg-green-100" : "bg-red-100"}`}>
                    <pre className="text-xs overflow-auto">{JSON.stringify(testResults.anyLoggedIn, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Test 2: Staff or Admin */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">API: Staff หรือ Admin</h3>
                    <p className="text-sm text-slate-500">/api/protected/staff-or-admin</p>
                  </div>
                  <button
                    onClick={() => testAPI("/api/protected/staff-or-admin", "staffOrAdmin")}
                    className="px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors text-sm font-bold"
                  >
                    ทดสอบ
                  </button>
                </div>
                {testResults.staffOrAdmin && (
                  <div className={`mt-2 p-3 rounded-lg ${testResults.staffOrAdmin.success ? "bg-green-100" : "bg-red-100"}`}>
                    <pre className="text-xs overflow-auto">{JSON.stringify(testResults.staffOrAdmin, null, 2)}</pre>
                  </div>
                )}
              </div>

              {/* Test 3: Admin only */}
              <div className="p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <h3 className="font-bold text-slate-800">API: เฉพาะ Admin</h3>
                    <p className="text-sm text-slate-500">/api/protected/admin-only</p>
                  </div>
                  <button
                    onClick={() => testAPI("/api/protected/admin-only", "adminOnly")}
                    className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors text-sm font-bold"
                  >
                    ทดสอบ
                  </button>
                </div>
                {testResults.adminOnly && (
                  <div className={`mt-2 p-3 rounded-lg ${testResults.adminOnly.success ? "bg-green-100" : "bg-red-100"}`}>
                    <pre className="text-xs overflow-auto">{JSON.stringify(testResults.adminOnly, null, 2)}</pre>
                  </div>
                )}
              </div>
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-sm text-yellow-800">
                <strong>หมายเหตุ:</strong> ลองทดสอบด้วย User ที่มี Role ต่างๆ เพื่อดูการทำงานของระบบ Authorization
              </p>
            </div>
          </div>
        </div>
      </div>
    </Layouts>
  );
}
