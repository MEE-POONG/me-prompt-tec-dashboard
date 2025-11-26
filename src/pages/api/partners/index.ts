import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ✅ ส่วนที่เพิ่ม: ปลดล็อค CORS เพื่อให้หน้าบ้าน (Port 3001) ดึงข้อมูลได้
  res.setHeader('Access-Control-Allow-Origin', '*'); 
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  // ถ้า Browser ส่งมาเช็คสิทธิ์ (Preflight) ให้ตอบกลับว่า OK เลย
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// ฟังก์ชันดึงข้อมูล
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const { search, status } = req.query;
  const where: any = {};

  if (status) where.status = status as string;
  if (search) where.name = { contains: search as string, mode: "insensitive" };

  const partners = await prisma.partner.findMany({
    where,
    orderBy: { createdAt: "desc" },
  });

  return res.status(200).json({ data: partners });
}

// ฟังก์ชันเพิ่มข้อมูล
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const { name, type, website, logo, description, status } = req.body;

  if (!name) return res.status(400).json({ error: "Missing name" });

  const newPartner = await prisma.partner.create({
    data: {
      name,
      type: type || "Company",
      website,
      logo,
      description,
      status: status || "active",
    },
  });

  return res.status(201).json({ message: "Success", data: newPartner });
}