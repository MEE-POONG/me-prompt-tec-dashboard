import { useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

export const useSocket = () => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    // 1. เรียก API เพื่อ "ปลุก" Socket Server (จำเป็นสำหรับ Next.js API Route)
    const socketInitializer = async () => {
      try {
        await fetch("/api/socket/io");
      } catch (error) {
        console.error("Failed to init socket server", error);
      }
    };

    socketInitializer();

    // 2. สร้างการเชื่อมต่อ
    // ถ้ามี ENV NEXT_PUBLIC_SITE_URL ให้ใช้ ถ้าไม่มีให้ใช้ relative path (ทำงานได้ดีใน localhost)
    const socketInstance = io(process.env.NEXT_PUBLIC_SITE_URL || "", {
      path: "/api/socket/io",
      addTrailingSlash: false,
    });

    socketInstance.on("connect", () => {
      console.log("✅ Socket Connected:", socketInstance.id);
      setIsConnected(true);
    });

    socketInstance.on("disconnect", () => {
      console.log("❌ Socket Disconnected");
      setIsConnected(false);
    });

    socketInstance.on("connect_error", (err) => {
      console.error("⚠️ Socket Connection Error:", err.message);
    });

    setSocket(socketInstance);

    // Cleanup: ตัดการเชื่อมต่อเมื่อ Component ถูก Unmount
    return () => {
      socketInstance.disconnect();
    };
  }, []);

  return { socket, isConnected };
};