// src/pages/api/verify-email.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import crypto from "crypto";
import { sendEmail } from "@/lib/mailer";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ error: "email is required" });
    }

    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(404).json({ error: "ไม่พบผู้ใช้ในระบบ" });
    }

    // 🔧 สร้าง token ใหม่
    const token = crypto.randomUUID();
    const expires = new Date(Date.now() + 30 * 60 * 1000);

    // 🔧 update token แต่ **ไม่แตะ isActive หรือ isVerified**
    await prisma.user.update({
      where: { email },
      data: {
        verifyToken: token,
        tokenExpire: expires,
      },
    });

    // We use NODE_ENV to determine the URL, bypassing .env issues entirely
    const baseUrl = process.env.NODE_ENV === "development"
      ? "http://localhost:3000"
      : "https://dashboard.me-prompt-technology.com";
    console.log("✅ Verification email sent to:", email);
    console.log("🔗 Base URL used:", baseUrl);
    console.log("🔗 Verification link:", `${baseUrl}/verify?token=${token}`);

    // 🔧 ส่งอีเมล
    await sendEmail({
      to: email,
      subject: "ยืนยันอีเมลของคุณ - บริษัทของเรา",
      html: `
    <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#f9f9f9;">
      <h2 style="color:#0d47a1;">ยืนยันอีเมลของคุณ</h2>
      <p>สวัสดี ${email},</p>
      <p>ขอบคุณที่สมัครบัญชีกับบริษัทของเรา กรุณาคลิกปุ่มด้านล่างเพื่อยืนยันอีเมลของคุณ:</p>
      <p style="text-align:center; margin:30px 0;">
        <a href="${baseUrl}/verify?token=${token}" style="color: white; text-decoration: none; font-weight: bold; background-color: #3B82F6; padding: 10px 20px; border-radius: 8px;">
  ยืนยันอีเมล
</a>
      </p>
      <p>หมายเหตุ: ลิงก์นี้จะหมดอายุภายใน <strong>30 นาที</strong> หลังจากส่งอีเมล</p>
      <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
      <p style="font-size:12px; color:#999;">
        หากคุณไม่ได้สมัครบัญชีนี้ โปรดละเว้นอีเมลนี้
      </p>
      <p style="font-size:12px; color:#999;">บริษัทของเรา | support@company.com</p>
    </div>
  `,
    });

    return res.status(200).json({ message: "email sent" });
  } catch (err: any) {
    console.error("verify-email error:", err);
    return res.status(500).json({ error: "server error" });
  }
}
