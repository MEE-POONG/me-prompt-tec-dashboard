import type { NextApiRequest, NextApiResponse } from "next";
import { subscribe } from "@/lib/realtime";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  // SSE endpoint: /api/realtime/stream?channel=<channel>
  const { channel } = req.query as { channel?: string };
  if (!channel) return res.status(400).json({ message: "channel is required" });

  // Set headers for SSE
  res.setHeader("Content-Type", "text/event-stream");
  res.setHeader("Cache-Control", "no-cache, no-transform");
  res.setHeader("Connection", "keep-alive");
  res.flushHeaders?.();

  const send = (data: any) => {
    try {
      res.write(`data: ${JSON.stringify(data)}\n\n`);
    } catch (e) {
      // ignore
    }
  };

  const unsub = subscribe(channel, (ev) => {
    send(ev);
  });

  // ping to keep connection alive
  const ping = setInterval(() => res.write(`: ping\n\n`), 20000);

  req.on("close", () => {
    clearInterval(ping);
    unsub();
  });
}
