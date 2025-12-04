import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid account ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(id, res);
      case "PUT":
        return await handlePut(id, req, res);
      case "DELETE":
        return await handleDelete(id, res);
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
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

// GET /api/account/[id] - ดึงข้อมูล Account ตาม ID
async function handleGet(id: string, res: NextApiResponse) {
  const user = await prisma.user.findUnique({
    where: { id },
  });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  // ส่งข้อมูลกลับ (ซ่อนรหัสผ่าน)
  return res.status(200).json({
    ...user,
    password: "", // ส่งค่าว่างกลับไปที่หน้าฟอร์ม
    passwordHash: undefined // ลบ field นี้ออกจาก response
  });
}

// PUT /api/account/[id] - อัปเดตข้อมูล Account
async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    email,
    password,
    role,
    phone,
    position,
    // รับ role หรือ isActive เพิ่มเติมได้ถ้าต้องการ
  } = req.body;

  // 1. ตรวจสอบว่ามี User นี้อยู่จริงไหม
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // 2. ตรวจสอบว่าอีเมลซ้ำไหม (ถ้ามีการเปลี่ยนอีเมล)
  if (email && email !== existingUser.email) {
    const duplicateEmail = await prisma.user.findUnique({
      where: { email },
    });
    if (duplicateEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }
  }

  // 3. สร้าง object สำหรับอัปเดต
  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (position !== undefined) updateData.position = position;
  if (role !== undefined) updateData.role = role;
  if (req.body.isActive !== undefined) updateData.isActive = req.body.isActive;

  // อัปเดตรหัสผ่านเฉพาะเมื่อมีการกรอกมาใหม่ (ไม่ว่าง)
  if (password && password.trim() !== "") {
    // ✅ Hash password ก่อนบันทึก
    const hashedPassword = await hashPassword(password);
    updateData.passwordHash = hashedPassword;
  }

  // 4. ทำการอัปเดตใน DB
  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return res.status(200).json({
    message: "User updated successfully",
    data: updatedUser
  });
}

// DELETE /api/account/[id] - ลบ Account
async function handleDelete(id: string, res: NextApiResponse) {
  // 1. ตรวจสอบว่ามี User อยู่จริง
  const existingUser = await prisma.user.findUnique({
    where: { id },
  });

  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // 2. ลบ User
  await prisma.user.delete({
    where: { id },
  });

  return res.status(200).json({
    message: "User deleted successfully"
  });
}