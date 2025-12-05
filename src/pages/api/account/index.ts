import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

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

// GET /api/account - ดึงรายการ account ทั้งหมด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  // ดึงข้อมูลจากตาราง User
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true, // ✅ แก้ไข: ต้องใช้ name ให้ตรงกับ Schema
      email: true,
      phone: true,
      position: true,
      role: true,
      isVerified: true, // ✅ เพิ่มตรงนี้
      // ไม่ส่ง passwordHash กลับไปเพื่อความปลอดภัย
    },
  });

  return res.status(200).json(users);
}

// POST /api/account - สร้าง account ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  // ✅ แก้ไข: รับค่า name มาจากหน้าบ้าน
  const { name, email, password, phone, position } = req.body;

  // Validation เบื้องต้น
  // ✅ แก้ไข: เช็ค name แทน fullName
  if (!name || !email || !password) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name", "email", "password"],
    });
  }

  // ตรวจสอบว่าอีเมลซ้ำหรือไม่
  const existingUser = await prisma.user.findUnique({
    where: { email },
  });

  if (existingUser) {
    return res.status(409).json({
      error: "Email already exists",
    });
  }

  // Hash password ก่อนบันทึก
  const hashedPassword = await hashPassword(password);

  // สร้าง User ใหม่
  const newUser = await prisma.user.create({
    data: {
      email,
      passwordHash: hashedPassword, // ✅ บันทึก password ที่ hash แล้ว
      name, // ✅ แก้ไข: บันทึกลงฟิลด์ name
      phone,
      position,
      role: req.body.role || "viewer", // ✅ รองรับ role ที่ส่งมาจากหน้าบ้าน
      isActive: false,
      isVerified: false,
    },
  });

  return res.status(201).json({
    message: "Account created successfully",
    data: newUser,
  });
}
