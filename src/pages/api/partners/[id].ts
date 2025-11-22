import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid Partner ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(id, res);
      case "PUT":
        return await handlePut(id, req, res);
      case "DELETE":
        return await handleDelete(id, res);
      default:
        res.setHeader("Allow", ["GET", "PUT", "DELETE"]);
        return res.status(405).json({ error: `Method ${req.method} Not Allowed` });
    }
  } catch (error) {
    console.error("API Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

// GET: ดึงข้อมูลรายตัว
async function handleGet(id: string, res: NextApiResponse) {
  const partner = await prisma.partner.findUnique({ where: { id } });
  
  if (!partner) return res.status(404).json({ error: "Partner not found" });

  return res.status(200).json({ data: partner });
}

// PUT: อัปเดตข้อมูล
async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  const { name, type, website, logo, description, status } = req.body;

  const updatedPartner = await prisma.partner.update({
    where: { id },
    data: {
      name,
      type,
      website,
      logo,
      description,
      status,
    },
  });

  return res.status(200).json({ 
    message: "Partner updated successfully", 
    data: updatedPartner 
  });
}

// DELETE: ลบข้อมูล
async function handleDelete(id: string, res: NextApiResponse) {
  await prisma.partner.delete({ where: { id } });
  return res.status(200).json({ message: "Partner deleted successfully" });
}