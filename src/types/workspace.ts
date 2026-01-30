export type WorkspaceId = string | number;

export type WorkspaceColumn = {
  id: WorkspaceId;
  title: string;
  color?: string;
  tasks?: WorkspaceTask[];
};

export type WorkspaceTask = {
  id: WorkspaceId;
  title: string;
  tag: string;
  tagColor: string;
  priority: "High" | "Medium" | "Low";
  members: Partial<WorkspaceMember>[];
  comments: number;
  attachments: number;
  date: string;
  // Optional fields added for dashboard/status mapping
  status?: string;
  rawDueDate?: string;
  assignees?: any[];
  memberIds?: string[];
  checklist?: number;
};

export type WorkspaceMember = {
  id: string; // [added]
  userId?: string;
  name: string;
  avatar: string;
  userAvatar?: string; // URL of user's profile picture from User model
  role?: "Viewer" | "Editor" | "Admin" | "Owner" | string;
  color: string;
  email?: string; // [added]
};

export type WorkspaceActivity = {
  id: string;
  user: string;
  action: string;
  target: string;
  createdAt: string; // ISO Date string
};

export type WorkspaceInfo = {
  name: string;
  description: string;
  progress: number;
  dueDate: string;
  createdAt?: string;
  updatedAt?: string;
  visibility?: "PRIVATE" | "PUBLIC";
  members: WorkspaceMember[];
  activities: WorkspaceActivity[];
  avatar?: string | null;
};

export interface WorkspaceBoardProps {
  workspaceId: string;
}

export interface Project {
  id: string;
  name: string;
  description: string;
  color: string;
  createdAt: string;
  updatedAt?: string;
  visibility?: "PRIVATE" | "PUBLIC";
  members?: any[];
  columns?: {
    tasks: { isDone: boolean }[];
  }[];
}

export interface WorkListProps {
  viewType?: "grid" | "list";
  searchItem?: string;
}



