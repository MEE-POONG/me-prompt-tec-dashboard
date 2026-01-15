import type { NextApiResponse } from "next";
import { serialize, parse } from "cookie";

export const AUTH_COOKIE_NAME = "auth_token";
const COOKIE_MAX_AGE = 7 * 24 * 60 * 60; // 7 วัน (seconds)

/**
 * ตั้งค่า httpOnly cookie สำหรับ JWT token
 */
export function setAuthCookie(res: NextApiResponse, token: string) {
  const cookie = serialize(AUTH_COOKIE_NAME, token, {
    httpOnly: true, // ป้องกัน XSS - ไม่สามารถเข้าถึงผ่าน JavaScript
    secure: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_Site_URL?.startsWith("https") || false, // ใช้ HTTPS เฉพาะถ้า URL เป็น https
    sameSite: "lax", // ป้องกัน CSRF
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}

/**
 * ลบ auth cookie
 */
export function removeAuthCookie(res: NextApiResponse) {
  const cookie = serialize(AUTH_COOKIE_NAME, "", {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_Site_URL?.startsWith("https") || false,
    sameSite: "lax",
    maxAge: 0, // ลบทันที
    path: "/",
  });

  res.setHeader("Set-Cookie", cookie);
}

/**
 * ดึง token จาก cookies
 */
export function getAuthToken(cookieHeader?: string): string | null {
  if (!cookieHeader) return null;

  const cookies = parse(cookieHeader);
  return cookies[AUTH_COOKIE_NAME] || null;
}
