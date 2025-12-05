import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { XCircle } from "lucide-react"; // ใช้ไอคอนจาก lucide-react ที่คุณมีอยู่แล้ว

// --- กฎเหล็ก: ห้ามใครเข้าไหนบ้าง (เหมือนเดิม) ---
const RESTRICTED_ROUTES: Record<string, string[]> = {
  STUDENT: [
    "/account", 
    "/manage_partners", 
    "/teammember", 
    "/intern",
    "/manage"
  ],
  STAFF: [
    "/account", 
  ],
  VIEWER: [
    "/account", 
    "/manage_partners", 
    "/teammember", 
    "/intern", 
    "/workspace"
  ],
};

const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
  const router = useRouter();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [showDeniedPopup, setShowDeniedPopup] = useState(false); // ✅ สร้าง State สำหรับโชว์ Popup เอง
  const [userRole, setUserRole] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined") {
      const storedUser = localStorage.getItem("user");

      if (!storedUser) {
        router.push("/login");
        return;
      }

      const user = JSON.parse(storedUser);
      const role = (user.role || "VIEWER").toUpperCase();
      setUserRole(role);
      
      const currentPath = router.pathname;
      const forbiddenPaths = RESTRICTED_ROUTES[role] || [];
      const isForbidden = forbiddenPaths.some((forbidden) => 
        currentPath.startsWith(forbidden)
      );

      if (isForbidden) {
        // ⛔️ ถ้าห้ามเข้า -> เปิด Popup ของเราเอง
        setShowDeniedPopup(true);
      } else {
        // ✅ ถ้าเข้าได้
        setIsAuthorized(true);
      }
    }
  }, [router.pathname]);

  const handleRedirect = () => {
    setShowDeniedPopup(false);
    router.push("/"); // พอกดปุ่มใน Popup -> ดีดกลับ Dashboard
  };

  // 1. ถ้ากำลังโชว์ Popup "ห้ามเข้า" ให้แสดงหน้านี้แทน
  if (showDeniedPopup) {
    return (
      <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in duration-200">
        <div className="bg-white p-6 rounded-2xl shadow-2xl max-w-sm w-full mx-4 text-center border border-white/50">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h2 className="text-xl font-bold text-slate-800 mb-2">ไม่มีสิทธิ์เข้าถึง!</h2>
          <p className="text-slate-500 mb-6 text-sm">
            สิทธิ์ของคุณ (<span className="font-semibold text-red-500">{userRole}</span>) <br/>
            ไม่ได้รับอนุญาตให้เข้าใช้งานหน้านี้
          </p>
          <button
            onClick={handleRedirect}
            className="w-full py-2.5 px-4 bg-red-500 hover:bg-red-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-red-200"
          >
            กลับหน้าหลัก
          </button>
        </div>
      </div>
    );
  }

  // 2. ถ้ายังไม่ได้รับอนุญาต (กำลังเช็ค) ไม่ต้องโชว์อะไร
  if (!isAuthorized) {
    return null; 
  }

  // 3. ถ้าผ่าน -> โชว์เนื้อหาปกติ
  return <>{children}</>;
};

export default ProtectedRoute;