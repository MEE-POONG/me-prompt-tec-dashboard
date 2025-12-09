import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { verifyToken } from "@/lib/auth/jwt";

// -------------------------------------------------------------------
// 🔒 ฟังก์ชันตรวจสอบ Token
// -------------------------------------------------------------------
function checkAuth(req: NextApiRequest) {
  const token = req.headers.authorization?.split(" ")[1];
  if (!token) throw new Error("UNAUTHORIZED");

  const decoded = verifyToken(token);

  if (!decoded || typeof decoded !== "object") {
    throw new Error("UNAUTHORIZED");
  }

  return decoded;
}

// -------------------------------------------------------------------
// API Handler
// -------------------------------------------------------------------
export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      // case "GET":
      //   return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res
          .status(405)
          .json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error",
    });
  }
}

// -------------------------------------------------------------------
// 📌 POST: ดึงรายการผู้ใช้งานทั้งหมด (ใช้ POST เพื่อส่ง keyword ซ่อนไว้ใน body)
// -------------------------------------------------------------------
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    // 1. ตรวจสอบ JWT Token
    // const user = checkAuth(req);
    // const role = ((user as any)?.role || "").toUpperCase();

    // // 2. ตรวจสอบสิทธิ์ - อนุญาตเฉพาะ ADMIN / HR / STAFF
    // if (!["ADMIN", "HR", "STAFF"].includes(role)) {
    //   return res
    //     .status(403)
    //     .json({ error: "คุณไม่มีสิทธิ์ดูรายชื่อผู้ใช้งาน" });
    // }
    const where: any = {};
    // 3. ตรวจสอบ keyword ที่ส่งมาใน body (เพิ่มความปลอดภัย)
    const { keyword } = req.body;
    // const SECRET_KEYWORD = process.env.ACCOUNT_ACCESS_KEYWORD || "fetch_all_users_2025";
    if (keyword) {
      where.OR = [
        { name: { first: { contains: keyword as string } } },
        { name: { last: { contains: keyword as string } } },
        { name: { display: { contains: keyword as string } } },
      ];
    }
    // 4. ดึงข้อมูลผู้ใช้ทั้งหมด
    const users = await prisma.user.findMany({
        where,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        isVerified: true,
        isActive: true,
      },
    });
console.log(users);

    return res.status(200).json(users);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "กรุณาเข้าสู่ระบบ (Token Invalid)",
      });
    }
    throw error;
  }
}
