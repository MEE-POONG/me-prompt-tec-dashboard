// src/lib/prisma.ts

// เช็ค path นี้ ถ้ามันขีดเส้นแดง ให้ลองลบ /client ออก หรือแก้ให้ตรงกับโฟลเดอร์ generated
import { PrismaClient } from '../generated/prisma'; 

declare global {
  var prisma: PrismaClient | undefined;
}

export const prisma = global.prisma || new PrismaClient();

if (process.env.NODE_ENV !== 'production') {
  global.prisma = prisma;
}