import type { NextApiRequest, NextApiResponse } from 'next';
// ✅ Import prisma จากไฟล์กลาง (ช่วยแก้ปัญหา global type error)
import { prisma } from "@/lib/prisma";

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'OPTIONS') {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    return res.status(200).end();
  }

  // GET: ดึงข้อมูลทั้งหมด
  if (req.method === 'GET') {
    try {
      const positions = await prisma.internshipPosition.findMany({
        orderBy: { createdAt: "desc" },
      });
      return res.status(200).json(positions);
    } catch (error) {
      console.error("Fetch Error:", error);
      return res.status(500).json({ error: "Failed to fetch positions" });
    }
  }

  // POST: เพิ่มข้อมูลใหม่
  else if (req.method === 'POST') {
    try {
      const { title, description, isOpen } = req.body;

      const newPosition = await prisma.internshipPosition.create({
        data: {
          title,
          description,
          // ✅ ถ้า isOpen ยังขีดแดง แสดงว่าต้องรัน npx prisma generate ก่อนนะครับ
          isOpen: isOpen ?? true,
        },
      });

      return res.status(201).json(newPosition);
    } catch (error) {
      console.error("Create Error:", error);
      return res.status(500).json({ error: "Failed to create position" });
    }
  }

  else {
    res.setHeader('Allow', ['GET', 'POST', 'OPTIONS']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}