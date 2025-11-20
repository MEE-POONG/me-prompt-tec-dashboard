import type { NextApiRequest, NextApiResponse } from 'next';
import { prisma } from '@/lib/prisma'; // ตรวจสอบ path prisma ให้ถูกต้อง

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // รองรับเฉพาะ Method GET
  if (req.method !== 'GET') {
    return res.status(405).json({ message: 'Method Not Allowed' });
  }

  try {
    // 1. ดึงค่าจาก Query Strings (ใน Pages Router จะอยู่ใน req.query)
    const { page = '1', limit = '20', status, search, date } = req.query;

    // Helper แปลงค่าให้เป็น string (กรณีเป็น array ให้เอาตัวแรก)
    const getString = (val: string | string[] | undefined) => {
      if (Array.isArray(val)) return val[0];
      return val || undefined;
    };

    const pageInt = parseInt(getString(page) || '1');
    const limitInt = parseInt(getString(limit) || '20');
    const statusStr = getString(status);
    const searchStr = getString(search);
    const dateStr = getString(date);

    // 2. Pagination Calculation
    const skip = (pageInt - 1) * limitInt;

    // 3. Build Where Clause
    const whereClause: any = {};

    if (statusStr) {
      whereClause.status = statusStr;
    }

    if (searchStr) {
      whereClause.OR = [
        { name: { contains: searchStr, mode: 'insensitive' } },
        { email: { contains: searchStr, mode: 'insensitive' } },
        { subject: { contains: searchStr, mode: 'insensitive' } },
      ];
    }

    if (dateStr) {
      const startDate = new Date(dateStr);
      const endDate = new Date(dateStr);
      // ปรับเวลาให้ครอบคลุมทั้งวัน 00:00 - 23:59
      endDate.setHours(23, 59, 59, 999);

      if (!isNaN(startDate.getTime())) {
        whereClause.createdAt = {
          gte: startDate,
          lte: endDate,
        };
      }
    }

    // 4. Execute Database Query
    const [messages, total] = await prisma.$transaction([
      prisma.contactMessage.findMany({
        where: whereClause,
        skip: skip,
        take: limitInt,
        orderBy: {
          createdAt: 'desc',
        },
        include: {
          handledBy: {
            select: {
              id: true,
              name: true,
              email: true,
            }
          }
        }
      }),
      prisma.contactMessage.count({ where: whereClause }),
    ]);

    // 5. Return Response
    return res.status(200).json({
      data: messages,
      meta: {
        total,
        page: pageInt,
        limit: limitInt,
        totalPages: Math.ceil(total / limitInt),
      }
    });

  } catch (error) {
    console.error('API Contact Error:', error);
    return res.status(500).json({ error: 'Failed to fetch messages' });
  }
}