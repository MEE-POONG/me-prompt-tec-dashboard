import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

/**
 * Hash password ด้วย bcrypt
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(SALT_ROUNDS);
  const hashedPassword = await bcrypt.hash(password, salt);
  return hashedPassword;
}

/**
 * เปรียบเทียบ password กับ hash
 */
export async function comparePassword(
  password: string,
  hashedPassword: string
): Promise<boolean> {
  return await bcrypt.compare(password, hashedPassword);
}

/**
 * ตรวจสอบความแข็งแกร่งของ password
 */
export function validatePasswordStrength(password: string): {
  isValid: boolean;
  errors: string[];
} {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("รหัสผ่านต้องมีอย่างน้อย 8 ตัวอักษร");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("รหัสผ่านต้องมีตัวอักษรพิมพ์ใหญ่อย่างน้อย 1 ตัว");
  }

  if (!/[a-z]/.test(password)) {
    errors.push("รหัสผ่านต้องมีตัวอักษรพิมพ์เล็กอย่างน้อย 1 ตัว");
  }

  if (!/[0-9]/.test(password)) {
    errors.push("รหัสผ่านต้องมีตัวเลขอย่างน้อย 1 ตัว");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}
