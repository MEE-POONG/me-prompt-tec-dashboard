// pages/api/login.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { comparePassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { setAuthCookie } from "@/lib/auth/cookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  const { username, password } = req.body;

  // Log for debugging (remove in production if needed)
  console.log('Login attempt:', { username, hasPassword: !!password });

  if (!username || !password) {
    console.log('Login failed: Missing credentials');
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
        message: `ไม่เจอ username "${username}" โปรดเพิ่มเข้าระบบก่อน`,
      });
    }

    // 2. ตรวจสอบว่า User active หรือไม่
    if (!user.isActive) {
      return res.status(403).json({
        error: "ACCOUNT_DISABLED",
        message: "บัญชีของคุณถูกปิดการใช้งาน",
      });
    }

    // 3. ตรวจสอบ Password (ใช้ bcrypt)
    const isPasswordValid = await comparePassword(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        error: "INVALID_PASSWORD",
        message: "Password ไม่ถูกต้อง",
      });
    }

    // 4. สร้าง JWT Token
    const token = signToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      name: user.name || undefined,
    });

    // 5. ตั้งค่า httpOnly cookie
    setAuthCookie(res, token);

    // 6. ส่ง response กลับ (พร้อม token)
    return res.status(200).json({
      success: true,
      message: "เข้าสู่ระบบสำเร็จ",
      token, // 👈 เพิ่ม token ในการ response
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
