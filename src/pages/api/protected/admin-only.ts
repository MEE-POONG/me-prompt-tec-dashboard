import type { NextApiResponse } from "next";
import { AuthenticatedRequest, withAuthAndRole } from "@/lib/middleware/auth";

/**
 * ตัวอย่าง Protected API - เฉพาะ Admin เท่านั้น
 * GET /api/protected/admin-only
 */
async function handler(req: AuthenticatedRequest, res: NextApiResponse) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  // เข้าถึงได้เฉพาะ Admin
  return res.status(200).json({
    success: true,
    message: "ยินดีต้อนรับ Admin!",
    user: req.user,
    data: {
      secret: "นี่คือข้อมูลที่เฉพาะ Admin เท่านั้นที่เห็นได้",
      timestamp: new Date().toISOString(),
    }
  });
}

// ส่งออกพร้อม middleware - เฉพาะ admin
export default withAuthAndRole(["admin"], handler);
