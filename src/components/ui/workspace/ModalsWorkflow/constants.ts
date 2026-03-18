import { Member, TagItem } from "./types";

export const ALL_MEMBERS: Member[] = [
  { id: "1", name: "Poom", color: "bg-blue-600", short: "P" },
  { id: "2", name: "Jame", color: "bg-emerald-600", short: "J" },
];

export const TAG_COLORS = [
  {
    name: "green",
    bg: "bg-green-500",
    text: "text-white",
    labelBg: "bg-green-100",
    labelText: "text-green-700",
  },
  {
    name: "yellow",
    bg: "bg-yellow-500",
    text: "text-white",
    labelBg: "bg-yellow-100",
    labelText: "text-yellow-700",
  },
  {
    name: "orange",
    bg: "bg-orange-500",
    text: "text-white",
    labelBg: "bg-orange-100",
    labelText: "text-orange-700",
  },
  {
    name: "red",
    bg: "bg-red-500",
    text: "text-white",
    labelBg: "bg-red-100",
    labelText: "text-red-700",
  },
  {
    name: "purple",
    bg: "bg-purple-500",
    text: "text-white",
    labelBg: "bg-purple-100",
    labelText: "text-purple-700",
  },
  {
    name: "blue",
    bg: "bg-blue-500",
    text: "text-white",
    labelBg: "bg-blue-100",
    labelText: "text-blue-700",
  },
];

export const INITIAL_TAGS: TagItem[] = [
  {
    id: "1",
    name: "High Priority",
    color: "red",
    bgColor: "bg-red-100",
    textColor: "text-red-700",
  },
  {
    id: "2",
    name: "Design",
    color: "purple",
    bgColor: "bg-purple-100",
    textColor: "text-purple-700",
  },
  {
    id: "3",
    name: "Dev",
    color: "blue",
    bgColor: "bg-blue-100",
    textColor: "text-blue-700",
  },
];

export const EMOJI_LIST = [
  "👍",
  "👎",
  "😀",
  "😂",
  "🥰",
  "😎",
  "🎉",
  "🚀",
  "👀",
  "✅",
  "❌",
  "🔥",
  "❤️",
  "✨",
  "💡",
  "🙏",
  "🤔",
  "😭",
  "😡",
  "😴",
];
