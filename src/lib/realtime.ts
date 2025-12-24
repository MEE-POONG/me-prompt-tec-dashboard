import { EventEmitter } from "events";

// ประกาศ Global Interface เพื่อไม่ให้ TypeScript ฟ้อง error ในโหมด Dev
declare global {
  var realtimeEmitter: EventEmitter | undefined;
}

// ใช้ Global Emitter เพื่อป้องกันการสร้าง Instance ใหม่ทุกครั้งที่ Hot Reload
const emitter = global.realtimeEmitter || new EventEmitter();

if (process.env.NODE_ENV !== "production") {
  global.realtimeEmitter = emitter;
}

// ฟังก์ชันสำหรับส่งข้อมูล (Publish) - เรียกใช้ตอน Create/Update/Delete ใน Backend
export const publish = (channel: string, data: any) => {
  // console.log(`📢 Realtime Publish to [${channel}]:`, data.type); // เปิดคอมเมนต์ถ้าอยาก Debug
  emitter.emit(channel, data);
};

// ฟังก์ชันสำหรับรับข้อมูล (Subscribe) - เรียกใช้โดย SSE API Endpoint
export const subscribe = (channel: string, callback: (data: any) => void) => {
  const handler = (data: any) => callback(data);
  emitter.on(channel, handler);

  // Return ฟังก์ชันสำหรับยกเลิกการฟัง (Unsubscribe)
  return () => {
    emitter.off(channel, handler);
  };
};