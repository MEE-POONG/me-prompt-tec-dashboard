import type { NextApiRequest, NextApiResponse } from 'next';
// ✅ Import prisma จากไฟล์กลางที่เราสร้างไว้ (เส้นแดงตรง global จะหายไป)
import { prisma } from "@/lib/prisma"; 

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  // ตรวจสอบว่า ID ถูกต้อง
  if (!id || typeof id !== 'string') {
    return res.status(400).json({ error: "Invalid ID" });
  }

  // PUT: แก้ไขข้อมูล
  if (req.method === 'PUT') {
    try {
      const { title, description, isOpen } = req.body;
      
      const updatedPosition = await prisma.internshipPosition.update({
        where: { id: id },
        data: { title, description, isOpen },
      });
      
      return res.status(200).json(updatedPosition);
    } catch (error) {
      console.error("Update Error:", error); // ควร log error ดูใน Terminal ด้วย
      return res.status(500).json({ error: "Failed to update position" });
    }
  }

  // DELETE: ลบข้อมูล
  else if (req.method === 'DELETE') {
    try {
      await prisma.internshipPosition.delete({
        where: { id: id },
      });
      
      return res.status(200).json({ message: "Deleted successfully" });
    } catch (error) {
      console.error("Delete Error:", error);
      return res.status(500).json({ error: "Failed to delete position" });
    }
  }

  // Method อื่นๆ ไม่รองรับ
  else {
    res.setHeader('Allow', ['PUT', 'DELETE']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}