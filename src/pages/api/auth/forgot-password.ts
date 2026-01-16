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
            return res.status(400).json({ error: "Email is required" });
        }

        // ค้นหาผู้ใช้
        const user = await prisma.user.findUnique({
            where: { email },
        });

        if (!user) {
            // ไม่บอกว่าไม่มี user เพื่อความปลอดภัย
            return res.status(200).json({
                message: "หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้"
            });
        }

        // สร้าง reset token
        const resetToken = crypto.randomUUID();
        const resetExpires = new Date(Date.now() + 30 * 60 * 1000); // 30 นาที

        // บันทึก token
        await prisma.user.update({
            where: { email },
            data: {
                resetToken: resetToken,
                resetTokenExpire: resetExpires,
            },
        });

        const baseUrl = process.env.BASE_URL || process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
        const resetUrl = `${baseUrl}/reset-password?token=${resetToken}`;

        console.log("✅ Password reset email sent to:", email);
        console.log("🔗 Reset URL:", resetUrl);

        // ส่งอีเมล
        await sendEmail({
            to: email,
            subject: "รีเซ็ตรหัสผ่าน - ME Prompt Tec",
            html: `
        <div style="font-family: Arial, sans-serif; line-height:1.6; color:#333; max-width:600px; margin:auto; padding:20px; border:1px solid #eee; border-radius:8px; background-color:#f9f9f9;">
          <h2 style="color:#0d47a1;">รีเซ็ตรหัสผ่านของคุณ</h2>
          <p>สวัสดี,</p>
          <p>เราได้รับคำขอให้รีเซ็ตรหัสผ่านสำหรับบัญชี: <strong>${email}</strong></p>
          <p>กรุณาคลิกปุ่มด้านล่างเพื่อตั้งรหัสผ่านใหม่:</p>
          <p style="text-align:center; margin:30px 0;">
            <a href="${resetUrl}" style="color: white; text-decoration: none; font-weight: bold; background-color: #7C3AED; padding: 12px 24px; border-radius: 8px; display: inline-block;">
              รีเซ็ตรหัสผ่าน
            </a>
          </p>
          <p>หรือคัดลอกลิงก์นี้ไปวางในเบราว์เซอร์:</p>
          <p style="background-color: #f0f0f0; padding: 10px; border-radius: 4px; word-break: break-all; font-size: 12px;">${resetUrl}</p>
          <p><strong>หมายเหตุ:</strong> ลิงก์นี้จะหมดอายุภายใน <strong>30 นาที</strong></p>
          <hr style="border:none; border-top:1px solid #eee; margin:20px 0;">
          <p style="font-size:12px; color:#999;">
            หากคุณไม่ได้ขอรีเซ็ตรหัสผ่าน โปรดละเว้นอีเมลนี้
          </p>
          <p style="font-size:12px; color:#999;">ME Prompt Tec | me.prompt.tec@gmail.com</p>
        </div>
      `,
        });

        return res.status(200).json({
            message: "หากอีเมลนี้มีอยู่ในระบบ เราจะส่งลิงก์รีเซ็ตรหัสผ่านไปให้"
        });
    } catch (err: any) {
        console.error("Forgot password error:", err);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการส่งอีเมล" });
    }
}
