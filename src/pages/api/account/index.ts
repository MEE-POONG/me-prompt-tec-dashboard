import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";
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
      case "GET":
        return await handleGet(req, res);
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
// 📌 GET: ดึงรายการผู้ใช้งานทั้งหมด
// -------------------------------------------------------------------
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  try {
    const user = checkAuth(req);
    const role = ((user as any)?.role || "").toUpperCase();

    // อนุญาตเฉพาะ ADMIN / HR / STAFF
    if (!["ADMIN", "HR", "STAFF"].includes(role)) {
      return res
        .status(403)
        .json({ error: "คุณไม่มีสิทธิ์ดูรายชื่อผู้ใช้งาน" });
    }

    const users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        isVerified: true, // ← มาจาก branch poom
        isActive: true,
      },
    });

    return res.status(200).json(users);
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return res.status(401).json({ error: "กรุณาเข้าสู่ระบบ (Token Invalid)" });
    }
    throw error;
  }
}

// -------------------------------------------------------------------
// 📌 POST: สร้างผู้ใช้ใหม่ (เฉพาะ ADMIN เท่านั้น)
// -------------------------------------------------------------------
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  try {
    const requester = checkAuth(req);
    const requesterRole = ((requester as any)?.role || "").toUpperCase();

    if (requesterRole !== "ADMIN") {
      return res
        .status(403)
        .json({ error: "เฉพาะ Admin เท่านั้นที่สามารถเพิ่มผู้ใช้ได้" });
    }

    const { name, email, password, phone, position, role } = req.body;

    // Validation
    if (!name || !email || !password) {
      return res.status(400).json({
        error: "Missing required fields",
        required: ["name", "email", "password"],
      });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Hash Password
    const hashedPassword = await hashPassword(password);

    // Create User
    const newUser = await prisma.user.create({
      data: {
        email,
        passwordHash: hashedPassword,
        name,
        phone,
        position,
        role: role || "viewer",
        isActive: true,
        isVerified: false, // ← มาจาก branch poom
      },
    });

    return res.status(201).json({
      message: "Account created successfully",
      data: newUser,
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED") {
      return res
        .status(401)
        .json({ error: "กรุณาเข้าสู่ระบบก่อนทำรายการ" });
    }
    throw error;
  }
}
