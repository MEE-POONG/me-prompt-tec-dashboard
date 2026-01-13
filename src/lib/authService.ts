// src/lib/authService.ts
import { prisma } from "@/lib/prisma";
import { Role } from "@/generated/prisma";
import crypto from "crypto";

export async function createUser(data: {
  email: string;
  passwordHash: string;
  role?: Role;
  name?: string;
  phone?: string;
  position?: string;
}) {
  const verifyToken = crypto.randomUUID();
  const tokenExpire = new Date(Date.now() + 30 * 60 * 1000); // 30 นาที

  return prisma.user.create({
    data: {
      email: data.email,
      passwordHash: data.passwordHash,
      role: data.role ?? Role.viewer,

      verifyToken,
      tokenExpire,
      isActive: false,

      name: data.name,
      phone: data.phone,
      position: data.position,
    },
  });
}

export async function verifyEmailToken(token: string) {
  const user = await prisma.user.findFirst({
    where: {
      verifyToken: token,
      tokenExpire: { gte: new Date() },
    },
  });

  if (!user) return null;

  return prisma.user.update({
    where: { id: user.id },
    data: {
      isActive: true,
      verifyToken: null,
      tokenExpire: null,
    },
  });
}
