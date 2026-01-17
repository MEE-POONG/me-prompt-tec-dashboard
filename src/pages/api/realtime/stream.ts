import type { NextApiRequest, NextApiResponse } from "next";
import { subscribe } from "@/lib/realtime";

// ⚠️ CRITICAL: Disable body parsing for SSE to work properly
export const config = {
  api: {
    bodyParser: false,
    responseLimit: false,
    externalResolver: true,
  },
};

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // SSE endpoint: /api/realtime/stream?channel=<boardId>
  const { channel } = req.query as { channel?: string };

  if (!channel) {
    return res.status(400).json({ message: "channel is required" });
  }

  // 1. ตั้งค่า Headers สำหรับ Server-Sent Events (SSE)
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.setHeader("Content-Encoding", "none");

  // flushHeaders จำเป็นสำหรับบาง Hosting (เช่น Vercel) เพื่อให้ส่งข้อมูลทันที
  if (res.flushHeaders) {
    res.flushHeaders();
  }

  // 2. ฟังก์ชันส่งข้อมูลไปยัง Frontend
  const send = (data: any) => {
    try {
      // Check if response is still writable
      if (!res.writableEnded) {
        res.write(`data: ${JSON.stringify(data)}\n\n`);
        // บังคับส่งทันที (ถ้าทำได้)
        if ((res as any).flush) (res as any).flush();
      }
    } catch (e) {
      console.error("Error writing stream", e);
    }
  };

  // 3. เริ่มดักฟังข้อมูลจาก channel ที่ระบุ
  const unsub = subscribe(channel, (ev) => {
    send(ev);
  });

  // 4. ส่ง Ping ทุก 20 วินาที เพื่อเลี้ยง Connection ไม่ให้หลุด
  const ping = setInterval(() => {
    try {
      if (!res.writableEnded) {
        res.write(`: ping\n\n`);
      }
    } catch (e) {
      clearInterval(ping);
    }
  }, 20000);

  // 5. Cleanup เมื่อ Client ปิดหน้าเว็บ
  req.on("close", () => {
    clearInterval(ping);
    unsub();
    res.end();
  });
}