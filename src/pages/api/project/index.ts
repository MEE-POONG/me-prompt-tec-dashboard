import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { ProjectStatus } from "@prisma/client";
// import { ProjectStatus } from "@/generated/prisma";


export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
    return res.status(500).json({
      error: "Internal Server Error",
      message: error instanceof Error ? error.message : "Unknown error"
    });
  }
}

// GET /api/project - ดึงรายการ project ทั้งหมด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    limit = "10",
    status,
    featured,
    search,
    tags,
    sortBy = "createdAt",
    order = "desc"
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // สร้าง filter conditions
  const where: any = {};

  if (status) {
    where.status = status as ProjectStatus;
  }

  if (featured !== undefined) {
    where.featured = featured === "true";
  }

  if (search) {
    where.OR = [
      { title: { contains: search as string, mode: "insensitive" } },
      { description: { contains: search as string, mode: "insensitive" } },
      { summary: { contains: search as string, mode: "insensitive" } },
    ];
  }

  if (tags) {
    const tagArray = (tags as string).split(",");
    where.tags = { hasSome: tagArray };
  }

  // ดึงข้อมูล
  const [projects, total] = await Promise.all([
    prisma.project.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: order as "asc" | "desc",
      },
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
    }),
    prisma.project.count({ where }),
  ]);

  return res.status(200).json({
    data: projects,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

// POST /api/project - สร้าง project ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
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

  // Validation
  if (!title || !slug) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["title", "slug"]
    });
  }

  // ตรวจสอบว่า slug ซ้ำหรือไม่
  const existingProject = await prisma.project.findUnique({
    where: { slug },
  });

  if (existingProject) {
    return res.status(409).json({
      error: "Project with this slug already exists"
    });
  }

  // สร้าง project
  const project = await prisma.project.create({
    data: {
      title,
      slug,
      summary,
      description,
      status: status || ProjectStatus.in_progress,
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      clientName,
      clientSector,
      tags: tags || [],
      techStack: techStack || [],
      cover,
      gallery: gallery || [],
      links: links || [],
      featured: featured || false,
      // เชื่อม members
      memberLinks: members?.length ? {
        create: members.map((m: any) => ({
          memberId: m.memberId,
          role: m.role,
          note: m.note,
        })),
      } : undefined,
      // เชื่อม interns
      internLinks: interns?.length ? {
        create: interns.map((i: any) => ({
          internId: i.internId,
          responsibility: i.responsibility,
          note: i.note,
        })),
      } : undefined,
    },
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

  return res.status(201).json({
    message: "Project created successfully",
    data: project
  });
}
