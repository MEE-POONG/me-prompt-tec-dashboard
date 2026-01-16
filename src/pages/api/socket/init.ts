import { NextApiRequest } from "next";
import { Server as ServerIO } from "socket.io";
import { Server as NetServer } from "http";

export const config = {
    api: {
        bodyParser: false,
    },
};

const socketInitHandler = (req: NextApiRequest, res: any) => {
    if (!res.socket.server.io) {
        console.log("🚀 Initializing Socket.io server...");
        const path = "/api/socket/io";
        const httpServer: NetServer = res.socket.server as any;

        const io = new ServerIO(httpServer, {
            path: path,
            addTrailingSlash: false,
        });

        io.on("connection", (socket) => {
            console.log("✅ Client connected:", socket.id);

            // เมื่อมีคนเข้าหน้าบอร์ด ให้พาเข้าห้อง (Room) ตาม ID โปรเจกต์
            socket.on("join-room", (workspaceId) => {
                socket.join(workspaceId);
                console.log(`👤 User joined room: ${workspaceId}`);
            });

            // รับแจ้งเตือนจาก User A แล้วส่งต่อให้ User B, C, D...
            socket.on("send-notification", (data) => {
                console.log("📢 Broadcasting notification:", data);
                // ส่งให้ทุกคนในห้อง workspaceId (รวมถึงคนส่งด้วย เพื่อความชัวร์ หรือใช้ socket.to(...).emit ถ้าไม่รวมคนส่ง)
                socket.to(data.workspaceId).emit("receive-notification", data);
            });

            // รับคำสั่งให้รีเฟรชหน้าจอ
            socket.on("board-updated", (workspaceId) => {
                socket.to(workspaceId).emit("refresh-board");
            });

            socket.on("disconnect", () => {
                console.log("❌ Client disconnected");
            });
        });

        res.socket.server.io = io;
    } else {
        console.log("socket.io already running");
    }
    res.end();
};

export default socketInitHandler;
