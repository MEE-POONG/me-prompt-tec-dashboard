import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/password";

export default async function handler(
    req: NextApiRequest,
    res: NextApiResponse
) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method not allowed" });
    }

    try {
        const { token, newPassword } = req.body;

        if (!token || !newPassword) {
            return res.status(400).json({ error: "Token และรหัสผ่านใหม่จำเป็นต้องระบุ" });
        }

        if (newPassword.length < 6) {
            return res.status(400).json({ error: "รหัสผ่านต้องมีอย่างน้อย 6 ตัวอักษร" });
        }

        // ค้นหาผู้ใช้ด้วย reset token
        const user = await prisma.user.findFirst({
            where: {
                resetToken: token,
                resetTokenExpire: {
                    gt: new Date(), // token ยังไม่หมดอายุ
                },
            },
        });

        if (!user) {
            return res.status(400).json({
                error: "ลิงก์รีเซ็ตรหัสผ่านไม่ถูกต้องหรือหมดอายุแล้ว"
            });
        }

        // อัปเดตรหัสผ่านและลบ token
        const hashedPassword = await hashPassword(newPassword);

        await prisma.user.update({
            where: { id: user.id },
            data: {
                passwordHash: hashedPassword,
                resetToken: null,
                resetTokenExpire: null,
            },
        });

        console.log("✅ Password reset successful for:", user.email);

        return res.status(200).json({
            message: "รีเซ็ตรหัสผ่านสำเร็จ คุณสามารถเข้าสู่ระบบด้วยรหัสผ่านใหม่ได้แล้ว"
        });
    } catch (err: any) {
        console.error("Reset password error:", err);
        return res.status(500).json({ error: "เกิดข้อผิดพลาดในการรีเซ็ตรหัสผ่าน" });
    }
}
