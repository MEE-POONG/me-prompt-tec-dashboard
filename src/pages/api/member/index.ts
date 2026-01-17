import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";

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

// GET /api/member - ดึงรายชื่อพนักงานทั้งหมด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    limit = "100",
    search,
    department,
    title,
    sortBy = "createdAt",
    order = "desc"
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // สร้างเงื่อนไขการกรอง (Filter)
  const where: any = {};

  if (department) {
    where.department = department as string;
  }

  if (title) {
    where.title = { contains: title as string };
  }

  if (search) {
    where.OR = [
      { name: { first: { contains: search as string } } },
      { name: { last: { contains: search as string } } },
      { name: { display: { contains: search as string } } },
    ];
  }

  // ดึงข้อมูล
  const [members, total] = await Promise.all([
    prisma.member.findMany({
      where,
      skip,
      take: limitNum,
      orderBy: {
        [sortBy as string]: order as "asc" | "desc",
      },
      // ไม่ต้อง include projectLinks ถ้าไม่ได้ใช้ในหน้ารายการ เพื่อความเร็ว
    }),
    prisma.member.count({ where }),
  ]);

  return res.status(200).json({
    data: members,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

// POST /api/member - เพิ่มพนักงานใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    title,
    department,
    bio,
    photo, // หรือ imageSrc แล้วแต่จะส่งมา
    socials,
    skills,
    slug
  } = req.body;

  // Validation เบื้องต้น
  if (!name || !name.first || !name.last || !slug) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name.first", "name.last", "slug"]
    });
  }

  // ตรวจสอบ slug ซ้ำ
  const existingMember = await prisma.member.findUnique({
    where: { slug },
  });

  if (existingMember) {
    return res.status(409).json({
      error: "Member with this slug already exists"
    });
  }

  // สร้างข้อมูล
  const member = await prisma.member.create({
    data: {
      name: {
        first: name.first,
        last: name.last,
        display: name.display || `${name.first} ${name.last}`,
      },
      title,
      department,
      bio,
      photo, // หรือจะ map จาก avatar/imageSrc ก็ได้
      socials,
      skills: skills || [], // skill เป็น array
      slug,
      isActive: true
    },
  });

  return res.status(201).json({
    message: "Member created successfully",
    data: member
  });
}