import type { NextApiResponse } from "next";
import { AuthenticatedRequest, withAuth } from "@/lib/middleware/auth";

/**
 * ตัวอย่าง Protected API - ทุก Role ที่ login แล้วเข้าถึงได้
 * GET /api/protected/any-logged-in
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  return res.status(200).json({
    success: true,
    message: "ยินดีต้อนรับผู้ใช้ที่ login แล้ว",
    user: req.user,
    data: {
      info: "ข้อมูลนี้ทุก Role ที่ login แล้วเข้าถึงได้",
      yourRole: req.user?.role,
      timestamp: new Date().toISOString(),
    }
  });
}

// ส่งออกพร้อม middleware - ทุก role ที่ login แล้ว
export default withAuth(handler);
