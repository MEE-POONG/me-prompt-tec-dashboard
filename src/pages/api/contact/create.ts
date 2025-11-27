import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const {
      name,
      email,
      phone,
      subject,
      message,
      source,
      status,
      resumeUrl,
      portfolioUrl,
      handledById
    } = req.body;

    const newMessage = await prisma.contactMessage.create({
      data: {
        name: name ?? "ไม่ระบุ",
        email: email ?? "",
        phone: phone ?? "",
        subject: subject ?? "ใบสมัครงาน",
        message: message ?? "",
        source: source ?? "website",
        status: status ?? "new",
        date: new Date(),
        resumeUrl: resumeUrl ?? undefined,
        portfolioUrl: portfolioUrl ?? undefined,
        handledById: handledById ?? undefined
      },
    });

    return res.status(201).json(newMessage);
  } catch (error) {
    console.error("Create Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}