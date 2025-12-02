// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ error: "กรุณากรอกข้อมูลให้ครบถ้วน" });
  }

  try {
    // 1. ตรวจสอบว่ามี Username (Email) นี้หรือไม่
    // หมายเหตุ: อิงตาม Schema เดิมของคุณที่ใช้ email เป็น unique key
    const user = await prisma.user.findUnique({
      where: { email: username },
    });

    // กรณีที่ 1: ไม่พบ Username
    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: `ไม่เจอ username "${username}" โปรดเพิ่มเข้าระบบก่อน`
      });
    }

    // 2. ตรวจสอบ Password (เทียบกับ passwordHash)
    // หมายเหตุ: ในโค้ดเดิมของคุณเก็บ password เป็น plain text ชั่วคราว
    // ถ้าระบบจริงมีการ Hash ต้องใช้ bcrypt.compare(password, user.passwordHash)
    if (user.passwordHash !== password) {
      // กรณีที่ 2: Password ผิด
      return res.status(401).json({
        error: "INVALID_PASSWORD",
        message: "Password ไม่ถูกต้อง"
      });
    }

    // กรณีที่ 3: สำเร็จ
    // สามารถสร้าง Token (JWT) หรือ Session ตรงนี้ได้
    return res.status(200).json({
      message: "เข้าสู่ระบบสำเร็จ",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role
      }
    });

  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}