import { WorkspaceColumn, WorkspaceInfo } from "@/types/workspace";

export const INITIAL_WORKSPACE_COLUMNS: WorkspaceColumn[] = [
  {
    id: "col-1",
    title: "To Do",
    color: "bg-gray-500",
    tasks: [
      {
        id: "t1",
        title: "Research competitors & Market Analysis",
        tag: "Research",
        tagColor: "bg-purple-50 text-purple-600",
        priority: "High",
        members: ["JD", "AL"],
        comments: 3,
        attachments: 2,
        date: "Nov 24",
      },
      {
        id: "t2",
        title: "Draft project proposal",
        tag: "Planning",
        tagColor: "bg-blue-50 text-blue-600",
        priority: "Medium",
        members: ["MK"],
        comments: 0,
        attachments: 0,
        date: "Nov 25",
      },
    ],
  },
  {
    id: "col-2",
    title: "In Progress",
    color: "bg-blue-500",
    tasks: [
      {
        id: "t3",
        title: "Design homepage wireframes",
        tag: "Design",
        tagColor: "bg-pink-50 text-pink-600",
        priority: "High",
        members: ["JD", "S", "M"],
        comments: 12,
        attachments: 4,
        date: "Nov 28",
      },
    ],
  },
  {
    id: "col-3",
    title: "Review",
    color: "bg-yellow-500",
    tasks: [],
  },
  {
    id: "col-4",
    title: "Done",
    color: "bg-green-500",
    tasks: [
      {
        id: "t5",
        title: "Setup project repo",
        tag: "DevOps",
        tagColor: "bg-gray-100 text-gray-600",
        priority: "Low",
        members: ["JD"],
        comments: 1,
        attachments: 1,
        date: "Nov 20",
      },
    ],
  },
];

export const WORKSPACE_INFO: WorkspaceInfo = {
  name: "Website Redesign",
  description:
    "Redesigning the corporate website for better UX/UI and mobile responsiveness.",
  progress: 45,
  dueDate: "Dec 31, 2025",
  members: [
    {
      name: "Alex L.",
      role: "PM",
      avatar: "AL",
      color: "bg-blue-100 text-blue-600",
    },
    {
      name: "Sarah J.",
      role: "Design",
      avatar: "SJ",
      color: "bg-pink-100 text-pink-600",
    },
    {
      name: "Mike K.",
      role: "Dev",
      avatar: "MK",
      color: "bg-green-100 text-green-600",
    },
    {
      name: "John D.",
      role: "Dev",
      avatar: "JD",
      color: "bg-purple-100 text-purple-600",
    },
  ],
  activities: [
    { user: "Alex", action: "moved task", target: "Homepage", time: "10m ago" },
    {
      user: "Sarah",
      action: "uploaded",
      target: "Wireframes v2",
      time: "2h ago",
    },
    { user: "Mike", action: "commented", target: "API Docs", time: "4h ago" },
  ],
};