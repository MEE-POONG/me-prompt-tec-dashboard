// src/lib/prisma.ts

// เช็ค path นี้ ถ้ามันขีดเส้นแดง ให้ลองลบ /client ออก หรือแก้ให้ตรงกับโฟลเดอร์ generated
import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;