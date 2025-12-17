import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
// import { ProjectStatus } from "@/generated/prisma";



export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid project ID" });
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(id, req, res);
      case "PUT":
        return await handlePut(id, req, res);
      case "DELETE":
        return await handleDelete(id, req, res);
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

// GET /api/project/[id] - ดึงข้อมูล project ตาม ID
async function handleGet(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const project = await prisma.project.findUnique({
    where: { id },
    include: {
      memberLinks: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              title: true,
              department: true,
              photo: true,
              slug: true,
              socials: true,
            },
          },
        },
      },
      internLinks: {
        include: {
          intern: {
            select: {
              id: true,
              name: true,
              university: true,
              faculty: true,
              major: true,
              avatar: true,
              portfolioSlug: true,
            },
          },
        },
      },
    },
  });

  if (!project) {
    return res.status(404).json({ error: "Project not found" });
  }

  return res.status(200).json({ data: project });
}

// PUT /api/project/[id] - อัพเดท project
async function handlePut(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  const {
    title,
    slug,
    summary,
    description,
    status,
    startDate,
    endDate,
    clientName,
    clientSector,
    tags,
    techStack,
    cover,
    gallery,
    links,
    featured,
    members,
    interns,
  } = req.body;

  // ตรวจสอบว่า project มีอยู่หรือไม่
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return res.status(404).json({ error: "Project not found" });
  }

  // ถ้ามีการเปลี่ยน slug ให้ตรวจสอบว่าซ้ำกับโปรเจกต์อื่นหรือไม่
  if (slug && slug !== existingProject.slug) {
    const slugExists = await prisma.project.findUnique({
      where: { slug },
    });

    if (slugExists) {
      return res.status(409).json({
        error: "Project with this slug already exists"
      });
    }
  }

  // อัพเดท project
  const updateData: any = {
    ...(title && { title }),
    ...(slug && { slug }),
    ...(summary !== undefined && { summary }),
    ...(description !== undefined && { description }),
    ...(status && { status: status as ProjectStatus }),
    ...(startDate !== undefined && { startDate: startDate ? new Date(startDate) : null }),
    ...(endDate !== undefined && { endDate: endDate ? new Date(endDate) : null }),
    ...(clientName !== undefined && { clientName }),
    ...(clientSector !== undefined && { clientSector }),
    ...(tags !== undefined && { tags }),
    ...(techStack !== undefined && { techStack }),
    ...(cover !== undefined && { cover }),
    ...(gallery !== undefined && { gallery }),
    ...(links !== undefined && { links }),
    ...(featured !== undefined && { featured }),
  };

  // จัดการ member links
  if (members !== undefined) {
    // ลบ links เก่าทั้งหมดแล้วสร้างใหม่
    updateData.memberLinks = {
      deleteMany: {},
      create: members.map((m: any) => ({
        memberId: m.memberId,
        role: m.role,
        note: m.note,
      })),
    };
  }

  // จัดการ intern links
  if (interns !== undefined) {
    // ลบ links เก่าทั้งหมดแล้วสร้างใหม่
    updateData.internLinks = {
      deleteMany: {},
      create: interns.map((i: any) => ({
        internId: i.internId,
        responsibility: i.responsibility,
        note: i.note,
      })),
    };
  }

  const project = await prisma.project.update({
    where: { id },
    data: updateData,
    include: {
      memberLinks: {
        include: {
          member: {
            select: {
              id: true,
              name: true,
              title: true,
              photo: true,
              slug: true,
            },
          },
        },
      },
      internLinks: {
        include: {
          intern: {
            select: {
              id: true,
              name: true,
              avatar: true,
              portfolioSlug: true,
            },
          },
        },
      },
    },
  });

  return res.status(200).json({
    message: "Project updated successfully",
    data: project
  });
}

// DELETE /api/project/[id] - ลบ project
async function handleDelete(
  id: string,
  req: NextApiRequest,
  res: NextApiResponse
) {
  // ตรวจสอบว่า project มีอยู่หรือไม่
  const existingProject = await prisma.project.findUnique({
    where: { id },
  });

  if (!existingProject) {
    return res.status(404).json({ error: "Project not found" });
  }

  // ลบ project (จะลบ member links และ intern links อัตโนมัติ)
  await prisma.project.delete({
    where: { id },
  });

  return res.status(200).json({
    message: "Project deleted successfully"
  });
}
