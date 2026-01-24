import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/mailer";


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

// GET /api/intern - ดึงรายการ intern ทั้งหมด
async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const {
    page = "1",
    limit = "100",
    search,
    coopType,
    status,
    gen,
  } = req.query;

  const pageNum = parseInt(page as string);
  const limitNum = parseInt(limit as string);
  const skip = (pageNum - 1) * limitNum;

  // สร้าง filter conditions
  const where: any = {};

  // Logic กรองรุ่น
  if (gen && gen !== 'all') {
    where.gen = gen as string;
  }

  if (coopType) {
    where.coopType = coopType;
  }

  if (status) {
    where.status = status as string;
  }

  if (search) {
    where.OR = [
      { name: { first: { contains: search as string } } },
      { name: { last: { contains: search as string } } },
      { name: { display: { contains: search as string } } },
    ];
  }

  // ดึงข้อมูล
  const [interns, total] = await Promise.all([
    prisma.intern.findMany({
      where,
      skip,
      take: limitNum,
      // ✅ แก้ไขการเรียงลำดับตรงนี้
      orderBy: [
        { gen: 'desc' },      // 1. รุ่นใหม่สุดอยู่บน (เรียงจากเลขมากไปน้อย)
        { createdAt: 'desc' } // 2. ในรุ่นเดียวกัน ข้อมูลใหม่สุดอยู่ก่อน
      ],
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
    }),
    prisma.intern.count({ where }),
  ]);

  return res.status(200).json({
    data: interns,
    pagination: {
      page: pageNum,
      limit: limitNum,
      total,
      totalPages: Math.ceil(total / limitNum),
    },
  });
}

// POST /api/intern - สร้าง intern ใหม่
async function handlePost(req: NextApiRequest, res: NextApiResponse) {
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
    gen,
  } = req.body;

  // Validation
  if (!name || !name.first || !name.last || !portfolioSlug) {
    return res.status(400).json({
      error: "Missing required fields",
      required: ["name.first", "name.last", "portfolioSlug"]
    });
  }

  // ตรวจสอบว่า portfolioSlug ซ้ำหรือไม่
  const existingIntern = await prisma.intern.findUnique({
    where: { portfolioSlug },
  });

  if (existingIntern) {
    return res.status(409).json({
      error: "Intern with this portfolio slug already exists"
    });
  }

  // สร้าง intern
  const intern = await prisma.intern.create({
    data: {
      name: {
        first: name.first,
        last: name.last,
        display: name.display || `${name.first} ${name.last}`,
      },
      university: university || "มหาวิทยาลัยเทคโนโลยีราชมงคลอีสาน",
      faculty: faculty || "คณะบริหารธุรกิจ",
      major: major || "สารสนเทศทางคอมพิวเตอร์",
      studentId,
      coopType: coopType || "coop",
      contact: contact || undefined,
      resume: resume || undefined,
      avatar,
      portfolioSlug,
      status: status || "published",

      gen: gen || "6",

      createdAt: new Date(),
      updatedAt: new Date(),

      // Note: projectLinks disabled due to schema incompatibility
    },
    // Note: include removed due to schema incompatibility
  });

  // Send email notification to Admin
  try {
    const emailSubject = `New Intern Application: ${name.first} ${name.last}`;
    const emailBody = `
      <h3>Me-Prompt-Tec: New Intern Application</h3>
      <p><strong>Name:</strong> ${name.first} ${name.last}</p>
      <p><strong>University:</strong> ${university || "-"}</p>
      <p><strong>Faculty/Major:</strong> ${faculty || "-"} / ${major || "-"}</p>
      <p><strong>Portfolio Slug:</strong> ${portfolioSlug}</p>
      <p><strong>Coop Type:</strong> ${coopType || "-"}</p>
      <hr/>
      <p><strong>Link:</strong> <a href="${process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"}/intern/${portfolioSlug}">View Portfolio</a></p>
      <p>Date: ${new Date().toLocaleString()}</p>
    `;

    await sendEmail({
      to: process.env.MAIL_USER || "", // Send to Admin
      subject: emailSubject,
      html: emailBody,
    });
    console.log("Email notification sent to admin for new intern");
  } catch (emailError) {
    console.error("Failed to send email notification:", emailError);
  }

  return res.status(201).json({
    message: "Intern created successfully",
    data: intern
  });
}