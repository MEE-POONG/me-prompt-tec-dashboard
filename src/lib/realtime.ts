import { EventEmitter } from "events";

// Simple in-memory event bus for server-side publishing
const bus = new EventEmitter();

export type RealtimeEvent = {
  type: string;
  payload?: any;
};

export const publish = (channel: string, event: RealtimeEvent) => {
  // channel can be boardId or taskId etc.
  bus.emit(channel, event);
};

export const subscribe = (channel: string, handler: (ev: RealtimeEvent) => void) => {
  bus.on(channel, handler);
  return () => bus.off(channel, handler);
};

export default {
  publish,
  subscribe,
};
