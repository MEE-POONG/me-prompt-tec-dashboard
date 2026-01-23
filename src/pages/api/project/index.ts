import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

// Helper to handle BigInt serialization
(BigInt.prototype as any).toJSON = function () {
  return Number(this);
};

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
    return res.status(200).end();
  }

  try {
    switch (req.method) {
      case "GET":
        return await handleGet(req, res);
      case "POST":
        return await handlePost(req, res);
      default:
        res.setHeader("Allow", ["GET", "POST", "OPTIONS"]);
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

  const where: any = {};
  if (status) where.status = status;
  if (featured !== undefined) where.featured = featured === "true";
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

  const [projects, total] = await Promise.all([
    (prisma.project.findMany as any)({
      where,
      skip,
      take: limitNum,
      orderBy: { [sortBy as string]: order as "asc" | "desc" },
      include: {
        memberLinks: { include: { member: true } },
        internLinks: { include: { intern: true } },
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

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    title, slug, summary, description, status,
    startDate, endDate, clientName, clientSector,
    tags, techStack, cover, gallery, links, featured,
    members, interns
  } = req.body;

  if (!title || !slug) return res.status(400).json({ error: "Missing title or slug" });

  const project = await (prisma.project.create as any)({
    data: {
      title, slug, summary, description,
      status: status || "in_progress",
      startDate: startDate ? new Date(startDate) : null,
      endDate: endDate ? new Date(endDate) : null,
      clientName, clientSector,
      tags: tags || [],
      techStack: techStack || [],
      cover,
      gallery: gallery || [],
      links: links || [],
      featured: featured || false,
      createdAt: new Date(),
      updatedAt: new Date(),
      internalProgress: 0,
      isCustomColor: false,
      color: "#3B82F6",
      memberLinks: members?.length ? {
        create: members.map((m: any) => ({
          memberId: m.memberId,
          role: m.role || "Member",
          note: m.note || ""
        })),
      } : undefined,
      internLinks: interns?.length ? {
        create: interns.map((i: any) => ({
          internId: i.internId,
          responsibility: i.responsibility || "",
          note: i.note || ""
        })),
      } : undefined,
    }
  });

  return res.status(201).json({ message: "Project created", data: project });
}
