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

// ============ GET ============
async function handleGet(id: string, res: NextApiResponse) {
  const user = await prisma.user.findUnique({ where: { id } });

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  return res.status(200).json({
    id: user.id,
    email: user.email,
    name: user.name,
    phone: user.phone,
    position: user.position,
    role: user.role,
    isActive: user.isActive,
    emailVerified: user.isVerified,   // 👈 ใช้ตรงนี้
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
    password: "",
  });
}

// ============ PUT ============
async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  const { name, email, password, role, phone, position } = req.body;

  const existingUser = await prisma.user.findUnique({ where: { id } });
  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  // เช็ค email ซ้ำ
  if (email && email !== existingUser.email) {
    const duplicateEmail = await prisma.user.findUnique({ where: { email } });
    if (duplicateEmail) {
      return res.status(409).json({ error: "Email already exists" });
    }
  }

  // object สำหรับ update
  const updateData: any = {};

  if (name !== undefined) updateData.name = name;
  if (email !== undefined) updateData.email = email;
  if (phone !== undefined) updateData.phone = phone;
  if (position !== undefined) updateData.position = position;
  if (role !== undefined) updateData.role = role;

  if (req.body.isActive !== undefined)
    updateData.isActive = req.body.isActive;

  // 👇 **ตรงนี้คือของจริง** — อัปเดตค่ายืนยันอีเมล์
  if (req.body.isVerified !== undefined)
    updateData.isVerified = req.body.isVerified;

  // อัปเดตรหัสผ่านถ้าผู้ใช้กรอกใหม่
  if (password && password.trim() !== "") {
    updateData.passwordHash = await hashPassword(password);
  }

  const updatedUser = await prisma.user.update({
    where: { id },
    data: updateData,
  });

  return res.status(200).json({
    message: "User updated successfully",
    data: updatedUser,
  });
}

// ============ DELETE ============
async function handleDelete(id: string, res: NextApiResponse) {
  const existingUser = await prisma.user.findUnique({ where: { id } });

  if (!existingUser) {
    return res.status(404).json({ error: "User not found" });
  }

  await prisma.user.delete({ where: { id } });

  return res.status(200).json({ message: "User deleted successfully" });
}
