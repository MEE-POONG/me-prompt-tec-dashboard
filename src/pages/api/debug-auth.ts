import type { NextApiRequest, NextApiResponse } from "next";
import { getAuthToken } from "@/lib/auth/cookies";
import { verifyToken, decodeToken } from "@/lib/auth/jwt";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
    const token = getAuthToken(req.headers.cookie || "");
    const verified = token ? verifyToken(token) : null;
    const decodedUntrusted = token ? decodeToken(token) : null;

    res.status(200).json({
        message: "Auth Debug Info",
        cookies: req.headers.cookie || "No cookies found",
        tokenFound: !!token,
        tokenVerified: !!verified,
        decodedUntrusted,
        headers: req.headers,
        env: {
            NODE_ENV: process.env.NODE_ENV,
            NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL,
            secureCookieShouldBe: process.env.NODE_ENV === "production" && process.env.NEXT_PUBLIC_SITE_URL?.startsWith("https") || false
        }
    });
}
