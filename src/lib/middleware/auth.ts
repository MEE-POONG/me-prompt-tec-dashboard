import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken, JWTPayload } from "@/lib/auth/jwt";
import { prisma } from "@/lib/prisma";

// เพิ่ม user ใน request
export interface AuthenticatedRequest extends NextApiRequest {
  user?: JWTPayload & {
    isActive: boolean;
  };
}

/**
 * Middleware สำหรับตรวจสอบ Authentication
 * ใช้ตรวจสอบว่า User login อยู่หรือไม่
 */
export async function requireAuth(
  req: AuthenticatedRequest,
  res: NextApiResponse,
  next: () => void | Promise<void>
) {
  try {
    // ดึง token จาก cookies
    const token = getAuthToken(req.headers.cookie);

    if (!token) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "กรุณาเข้าสู่ระบบ"
      });
    }

    // Verify token
    const payload = verifyToken(token);

    if (!payload) {
      return res.status(401).json({
        error: "INVALID_TOKEN",
        message: "Token ไม่ถูกต้องหรือหมดอายุ"
      });
    }

    // ตรวจสอบว่า User ยังมีอยู่และ active
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        email: true,
        role: true,
        isActive: true,
      }
    });

    if (!user) {
      return res.status(404).json({
        error: "USER_NOT_FOUND",
        message: "ไม่พบข้อมูลผู้ใช้"
      });
    }

    if (!user.isActive) {
      return res.status(403).json({
        error: "ACCOUNT_DISABLED",
        message: "บัญชีถูกปิดการใช้งาน"
      });
    }

    // เพิ่ม user ข้อมูลใน request
    req.user = {
      ...payload,
      isActive: user.isActive,
    };

    // ไปต่อ
    await next();

  } catch (error) {
    console.error("Auth Middleware Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}

/**
 * Middleware สำหรับตรวจสอบ Role (Authorization)
 * ใช้ร่วมกับ requireAuth
 */
export function requireRole(...allowedRoles: string[]) {
  return async (
    req: AuthenticatedRequest,
    res: NextApiResponse,
    next: () => void | Promise<void>
  ) => {
    if (!req.user) {
      return res.status(401).json({
        error: "UNAUTHORIZED",
        message: "กรุณาเข้าสู่ระบบ"
      });
    }

    const userRole = req.user.role;

    if (!allowedRoles.includes(userRole)) {
      return res.status(403).json({
        error: "FORBIDDEN",
        message: "คุณไม่มีสิทธิ์เข้าถึงส่วนนี้",
        requiredRoles: allowedRoles,
        yourRole: userRole
      });
    }

    await next();
  };
}

/**
 * Helper function สำหรับใช้ middleware
 */
export function withAuth(
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    await requireAuth(req, res, async () => {
      await handler(req, res);
    });
  };
}

/**
 * Helper function สำหรับใช้ middleware + role check
 */
export function withAuthAndRole(
  allowedRoles: string[],
  handler: (req: AuthenticatedRequest, res: NextApiResponse) => Promise<void>
) {
  return async (req: AuthenticatedRequest, res: NextApiResponse) => {
    await requireAuth(req, res, async () => {
      await requireRole(...allowedRoles)(req, res, async () => {
        await handler(req, res);
      });
    });
  };
}
