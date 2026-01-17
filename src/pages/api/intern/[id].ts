
// import { CoopType } from "@/generated/prisma";
import { prisma } from "@/lib/prisma";
import { CoopType } from "@prisma/client";
import type { NextApiRequest, NextApiResponse } from "next";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid intern ID" });
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
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// GET /api/intern/[id] - ดึงข้อมูล intern ตาม ID
async function handleGet(id: string, res: NextApiResponse) {
  const intern = await prisma.intern.findUnique({
    where: { id },
    include: {
      projectLinks: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              cover: true,
              tags: true,
              techStack: true,
            },
          },
        },
      },
    },
  });

  if (!intern) {
    return res.status(404).json({ error: "Intern not found" });
  }

  return res.status(200).json({ data: intern });
}

// PUT /api/intern/[id] - อัปเดตข้อมูล intern
async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    university,
    faculty,
    major,
    studentId,
    coopType,
    contact,
    resume,
    avatar,
    portfolioSlug,
    status,
    projects,
    gen, // ✅ 1. รับค่า gen จากหน้าเว็บ
  } = req.body;

  // ตรวจสอบว่า intern มีอยู่จริง
  const existingIntern = await prisma.intern.findUnique({
    where: { id },
  });

  if (!existingIntern) {
    return res.status(404).json({ error: "Intern not found" });
  }

  // ตรวจสอบว่า portfolioSlug ซ้ำหรือไม่ (ถ้ามีการเปลี่ยน)
  if (portfolioSlug && portfolioSlug !== existingIntern.portfolioSlug) {
    const duplicateSlug = await prisma.intern.findUnique({
      where: { portfolioSlug },
    });

    if (duplicateSlug) {
      return res.status(409).json({
        error: "Portfolio slug already exists"
      });
    }
  }

  // สร้าง update data object
  const updateData: any = {};

  if (name) {
    updateData.name = {
      first: name.first,
      last: name.last,
      display: name.display || `${name.first} ${name.last}`,
    };
  }

  if (university !== undefined) updateData.university = university;
  if (faculty !== undefined) updateData.faculty = faculty;
  if (major !== undefined) updateData.major = major;
  if (studentId !== undefined) updateData.studentId = studentId;
  if (coopType !== undefined) updateData.coopType = coopType as CoopType;
  if (contact !== undefined) updateData.contact = contact;
  if (resume !== undefined) updateData.resume = resume;
  if (avatar !== undefined) updateData.avatar = avatar;
  if (portfolioSlug !== undefined) updateData.portfolioSlug = portfolioSlug;
  if (status !== undefined) updateData.status = status;

  // ✅ 2. เพิ่ม Logic อัปเดต gen ลง Database
  if (gen !== undefined) {
    updateData.gen = String(gen);
  }

  // จัดการ project links (ถ้ามี)
  if (projects) {
    // ลบ project links เก่าทั้งหมด
    await prisma.projectIntern.deleteMany({
      where: { internId: id },
    });

    // สร้าง project links ใหม่
    if (projects.length > 0) {
      updateData.projectLinks = {
        create: projects.map((p: any) => ({
          projectId: p.projectId,
          responsibility: p.responsibility,
          note: p.note,
        })),
      };
    }
  }

  // อัปเดตข้อมูล
  const intern = await prisma.intern.update({
    where: { id },
    data: updateData,
    include: {
      projectLinks: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
              cover: true,
            },
          },
        },
      },
    },
  });

  return res.status(200).json({
    message: "Intern updated successfully",
    data: intern
  });
}

// DELETE /api/intern/[id] - ลบ intern
async function handleDelete(id: string, res: NextApiResponse) {
  // ตรวจสอบว่า intern มีอยู่จริง
  const existingIntern = await prisma.intern.findUnique({
    where: { id },
  });

  if (!existingIntern) {
    return res.status(404).json({ error: "Intern not found" });
  }

  // ลบ project links ก่อน
  await prisma.projectIntern.deleteMany({
    where: { internId: id },
  });

  // ลบ intern
  await prisma.intern.delete({
    where: { id },
  });

  return res.status(200).json({
    message: "Intern deleted successfully"
  });
}