// src/pages/api/verify.ts
import { prisma } from "@/lib/prisma";
import type { NextApiRequest, NextApiResponse } from "next";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).json({ success: false, message: "Token invalid" });
  }

  try {
    const user = await prisma.user.findFirst({
      where: {
        verifyToken: token,
        tokenExpire: { gt: new Date() }, // 🔥 เช็คไม่หมดอายุ
      },
    });

    if (!user) {
      return res
        .status(400)
        .json({ success: false, message: "Token not found or expired" });
    }

    // 🔥 อัปเดตสถานะให้ครบ
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        isActive: true,
        verifyToken: null,
        tokenExpire: null,
      },
    });

    return res.json({ success: true });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false });
  }
}
