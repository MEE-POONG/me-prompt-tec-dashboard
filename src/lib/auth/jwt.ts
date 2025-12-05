import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-super-secret-key-change-this-in-production";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "7d"; // 7 วัน

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
  name?: string;
}

/**
 * สร้าง JWT Token
 */
export function signToken(payload: JWTPayload): string {
  // เพิ่ม as string เพื่อยืนยันกับ TypeScript ว่าค่านี้เป็น string แน่นอน
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as any, 
  });
}


/**
 * ตรวจสอบและ decode JWT Token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    console.error("JWT verification failed:", error);
    return null;
  }
}

/**
 * Decode JWT Token โดยไม่ตรวจสอบ (ใช้สำหรับ debug)
 */
export function decodeToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.decode(token) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}
