import type { NextApiRequest, NextApiResponse } from "next";
import { prisma } from "../../../lib/prisma";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { id } = req.query;

  if (!id || typeof id !== "string") {
    return res.status(400).json({ error: "Invalid member ID" });
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

// GET /api/member/[id]
async function handleGet(id: string, res: NextApiResponse) {
  const member = await prisma.member.findUnique({
    where: { id },
    include: {
      projectLinks: {
        include: {
          project: {
            select: {
              id: true,
              title: true,
              slug: true,
            }
          }
        }
      }
    }
  });

  if (!member) {
    return res.status(404).json({ error: "Member not found" });
  }

  return res.status(200).json({ data: member });
}

// PUT /api/member/[id]
async function handlePut(id: string, req: NextApiRequest, res: NextApiResponse) {
  const {
    name,
    title,
    department,
    bio,
    photo,
    socials,
    skills,
    slug,
    isActive
  } = req.body;

  // เช็คว่ามีอยู่จริงไหม
  const existingMember = await prisma.member.findUnique({ where: { id } });
  if (!existingMember) {
    return res.status(404).json({ error: "Member not found" });
  }

  // เช็ค slug ซ้ำ (ถ้าเปลี่ยน)
  if (slug && slug !== existingMember.slug) {
    const duplicate = await prisma.member.findUnique({ where: { slug } });
    if (duplicate) return res.status(409).json({ error: "Slug already exists" });
  }

  const updateData: any = {};

  if (name) {
    updateData.name = {
      first: name.first,
      last: name.last,
      display: name.display || `${name.first} ${name.last}`,
    };
  }
  if (title !== undefined) updateData.title = title;
  if (department !== undefined) updateData.department = department;
  if (bio !== undefined) updateData.bio = bio;
  if (photo !== undefined) updateData.photo = photo;
  if (socials !== undefined) updateData.socials = socials;
  if (skills !== undefined) updateData.skills = skills;
  if (slug !== undefined) updateData.slug = slug;
  if (isActive !== undefined) updateData.isActive = isActive;

  const updatedMember = await prisma.member.update({
    where: { id },
    data: updateData,
  });

  return res.status(200).json({
    message: "Member updated successfully",
    data: updatedMember
  });
}

// DELETE /api/member/[id]
async function handleDelete(id: string, res: NextApiResponse) {
  const existingMember = await prisma.member.findUnique({ where: { id } });
  if (!existingMember) return res.status(404).json({ error: "Member not found" });

  // ลบความสัมพันธ์กับ Project ก่อน (ถ้ามี)
  await prisma.projectMember.deleteMany({ where: { memberId: id } });

  // ลบ Member
  await prisma.member.delete({ where: { id } });

  return res.status(200).json({ message: "Member deleted successfully" });
}