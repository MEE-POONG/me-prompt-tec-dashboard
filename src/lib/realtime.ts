import { EventEmitter } from "events";

// 1. ใช้ Global Variable เพื่อกัน Event หายตอน Next.js Compile ใหม่ (สำคัญมาก)
declare global {
  var activeBus: EventEmitter | undefined;
}

const bus = global.activeBus || new EventEmitter();

// ป้องกันการสร้าง instance ใหม่ซ้ำๆ ในโหมด Development
if (process.env.NODE_ENV !== "production") {
  global.activeBus = bus;
}

// 2. ขยาย Type ให้รองรับ fields ของระบบแจ้งเตือน (user, action, target)
// ใส่ [key: string]: any เพื่อให้ยืดหยุ่น ไม่กระทบโค้ดเก่า
export type RealtimeEvent = {
  type: string;
  payload?: any;
  user?: string;    // เพิ่ม
  action?: string;  // เพิ่ม
  target?: string;  // เพิ่ม
  [key: string]: any; // รับค่าอื่นๆ ได้หมด
};

export const publish = (channel: string, event: RealtimeEvent) => {
  bus.emit(channel, event);
};

export const subscribe = (channel: string, handler: (ev: RealtimeEvent) => void) => {
  const wrapper = (event: RealtimeEvent) => handler(event);
  bus.on(channel, wrapper);
  return () => bus.off(channel, wrapper);
};

export default {
  publish,
  subscribe,
};