import type { NextApiRequest, NextApiResponse } from 'next';
import { PrismaClient } from '@prisma/client';

// สร้าง Prisma Instance (แนะนำให้แยกเป็นไฟล์ lib/prisma.ts ในโปรเจกต์จริงเพื่อลด Connection Pool)
const prisma = new PrismaClient();

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // -----------------------------------------------------------
  // 1. GET: ดึงข้อมูลโปรเจกต์ทั้งหมด (ใช้สำหรับหน้า WorkList)
  // -----------------------------------------------------------
  if (req.method === 'GET') {
    try {
      // ดึงข้อมูล ProjectBoard ทั้งหมด เรียงตามวันที่สร้างล่าสุด
      const boards = await prisma.projectBoard.findMany({
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          members: true, // ดึงข้อมูลสมาชิกมาด้วย (เพื่อโชว์ Avatar หน้า List)
          columns: {     // ดึงข้อมูล Column และ Tasks เพื่อคำนวณ Progress
            include: {
              tasks: true
            }
          }
        },
      });

      return res.status(200).json(boards);
    } catch (error) {
      console.error("GET Error:", error);
      return res.status(500).json({ error: "Failed to fetch boards" });
    }
  }

  // -----------------------------------------------------------
  // 2. POST: สร้างโปรเจกต์ใหม่ (ใช้สำหรับหน้า AddWorkspacePage)
  // -----------------------------------------------------------
  if (req.method === 'POST') {
    console.log("Received Body:", req.body);
    try {
        
      // รับค่าที่ส่งมาจากหน้าบ้าน
      const { name, description, color, visibility } = req.body;
        
      // Validate: ชื่อห้ามว่าง
      if (!name) {
        return res.status(400).json({ error: "Project name is required" });
      }

      // สร้างข้อมูลลง Database
      const newBoard = await prisma.projectBoard.create({
        data: {
          name,
          description: description || "", // ถ้าไม่มีคำอธิบาย ใส่สตริงว่าง
          color: color || "#3B82F6",      // ถ้าไม่มีสี ใส่สีฟ้าเป็นค่าเริ่มต้น
          visibility: visibility || "PRIVATE", // ✅ บันทึกค่า Visibility (ถ้าไม่ส่งมา Default เป็น PRIVATE)
          
          // สร้าง Column เริ่มต้นให้เลย (To Do, In Progress, Done)
          columns: {
            create: [
              { title: "To Do", order: 0, color: "bg-red-500" },
              { title: "In Progress", order: 1, color: "bg-yellow-500" },
              { title: "Done", order: 2, color: "bg-green-500" },
            ]
          }
        },
      });

      return res.status(201).json(newBoard);
    } catch (error) {
      console.error("POST Error:", error);
      return res.status(500).json({ error: "Failed to create board" });
    }
  }

  // Method อื่นๆ ที่ไม่รองรับ
  res.setHeader('Allow', ['GET', 'POST']);
  res.status(405).end(`Method ${req.method} Not Allowed`);
}