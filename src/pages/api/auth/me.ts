import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

/**
 * API สำหรับดึงข้อมูล User ปัจจุบัน (จาก JWT token)
 * GET /api/auth/me
 */
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    return res.status(200).end();
  }

  if (req.method !== "GET") {
    res.setHeader("Allow", ["GET", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ดึง token จาก cookies
    const token = getAuthToken(req.headers.cookie);

    if (!token) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "กรุณาเข้าสู่ระบบ"
      });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        error: "INVALID_TOKEN",
        message: "Token ไม่ถูกต้องหรือหมดอายุ"
      });
    }

    // ดึงข้อมูล User จาก database
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        name: true,
        role: true,
        position: true,
        phone: true,
        isActive: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "ไม่พบข้อมูลผู้ใช้"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "ACCOUNT_DISABLED",
        message: "บัญชีถูกปิดการใช้งาน"
      });
    }

    return res.status(200).json({
      success: true,
      user
    });

  } catch (error) {
    console.error("Get User Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
