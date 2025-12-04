import type { NextApiResponse } from "next";
import { AuthenticatedRequest, withAuthAndRole } from "@/lib/middleware/auth";

/**
 * ตัวอย่าง Protected API - Admin และ Staff เข้าถึงได้
 * GET /api/protected/staff-or-admin
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  return res.status(200).json({
    success: true,
    message: `ยินดีต้อนรับ ${req.user?.role}!`,
    user: req.user,
    data: {
      info: "ข้อมูลสำหรับ Staff และ Admin",
      timestamp: new Date().toISOString(),
    }
  });
}

// ส่งออกพร้อม middleware - admin และ staff
export default withAuthAndRole(["admin", "staff"], handler);
