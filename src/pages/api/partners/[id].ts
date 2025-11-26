import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ ส่วนที่เพิ่ม: ปลดล็อค CORS
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        const partner = await prisma.partner.findUnique({ where: { id } });
        return partner 
          ? res.status(200).json({ data: partner }) 
          : res.status(404).json({ error: "Not Found" });

      case "PUT":
        const { name, type, website, logo, description, status } = req.body;
        const updated = await prisma.partner.update({
          where: { id },
          data: { name, type, website, logo, description, status },
        });
        return res.status(200).json({ message: "Updated", data: updated });

      case "DELETE":
        await prisma.partner.delete({ where: { id } });
        return res.status(200).json({ message: "Deleted" });

      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}