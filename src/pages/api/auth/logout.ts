import type { NextApiRequest, NextApiResponse } from "next";
import { removeAuthCookie } from "@/lib/auth/cookies";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "OPTIONS") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(200).end();
  }

  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST", "OPTIONS"]);
    return res.status(405).json({ error: "Method Not Allowed" });
  }

  try {
    // ลบ auth cookie
    removeAuthCookie(res);

    return res.status(200).json({
      success: true,
      message: "ออกจากระบบสำเร็จ"
    });
  } catch (error) {
    console.error("Logout Error:", error);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}
