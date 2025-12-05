import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
import { verifyToken } from "@/lib/auth/jwt"; // ✅ เช็ค path ให้ถูกนะครับ (อาจจะเป็น ../../../lib/auth/jwt)

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// -------------------------------------------------------------------
// 🛡️ ฟังก์ชันช่วยเช็คสิทธิ์ (แก้ไขใหม่ให้ TypeScript ไม่บ่น)
// -------------------------------------------------------------------
function checkAuth(req: NextApiRequest) {
  const token = req.headers.authorization?.split(" ")[1];
  
  if (!token) {
    throw new Error("UNAUTHORIZED"); // ไม่มี Token
  }

  const decoded = verifyToken(token);

  // ✅ เช็คเข้มข้น: ถ้าไม่มีค่า หรือไม่ใช่ Object ให้ error เลย
  if (!decoded || typeof decoded !== 'object') {
    throw new Error("UNAUTHORIZED"); 
  }

  return decoded; // ตรงนี้ TypeScript จะมั่นใจแล้วว่า decoded ไม่ใช่ null
}

// GET /api/account - ดึงรายการ account ทั้งหมด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = checkAuth(req);
    // ✅ ใส่ ?. กันเหนียว และ as string เพื่อความชัวร์
    const role = ((user as any)?.role || "").toUpperCase();

    if (!["ADMIN", "HR", "STAFF"].includes(role)) {
       return res.status(403).json({ error: "คุณไม่มีสิทธิ์ดูรายชื่อผู้ใช้งาน" });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
      }
    });

    return res.status(200).json(users);

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ (Token Invalid)" });
    }
    throw error;
  }
}

// POST /api/account - สร้าง account ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = checkAuth(req);
    // ✅ ใส่ ?. กันเหนียวเช่นกัน
    const requesterRole = ((requester as any)?.role || "").toUpperCase();

    if (requesterRole !== "ADMIN") {
        return res.status(403).json({ error: "เฉพาะ Admin เท่านั้นที่สามารถเพิ่มผู้ใช้ได้" });
    }

    const { name, email, password, phone, position } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "email", "password"]
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({
        error: "Email already exists"
      });
    }

    const hashedPassword = await hashPassword(password);

    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        position,
        role: req.body.role || "viewer",
        isActive: req.body.isActive ?? true
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      data: newUser
    });

  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.name === "JsonWebTokenError") {
        return res.status(401).json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
    }
    throw error;
  }
}