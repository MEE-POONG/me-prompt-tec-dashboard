// lib/api/workspace.ts
// API helper functions for workspace operations

// ==================== ProjectBoard APIs ====================
export const getBoards = async () => {
  const res = await fetch("/api/workspace/board");
  if (!res.ok) throw new Error("Failed to fetch boards");
  return res.json();
};

export const getBoard = async (id: string) => {
  const res = await fetch(`/api/workspace/board/${id}`);
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to fetch board: ${res.status} ${res.statusText} - ${text}`);
  }
  return res.json();
};

export const createBoard = async (data: {
  name: string;
  description?: string;
  color?: string;
}) => {
  const res = await fetch("/api/workspace/board", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create board");
  return res.json();
};

export const updateBoard = async (
  id: string,
  data: { name?: string; description?: string; color?: string }
) => {
  const res = await fetch(`/api/workspace/board/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update board");
  return res.json();
};

export const deleteBoard = async (id: string) => {
  const res = await fetch(`/api/workspace/board/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete board");
  return res.ok;
};

// ==================== BoardColumn APIs ====================
export const getColumns = async (boardId: string) => {
  const res = await fetch(`/api/workspace/column?boardId=${boardId}`);
  if (!res.ok) throw new Error("Failed to fetch columns");
  return res.json();
};

export const getColumn = async (id: string) => {
  const res = await fetch(`/api/workspace/column/${id}`);
  if (!res.ok) throw new Error("Failed to fetch column");
  return res.json();
};

export const createColumn = async (data: {
  boardId: string;
  title: string;
  order?: number;
  color?: string;
  user?: string; // ✅ เพิ่ม user
}) => {
  const res = await fetch("/api/workspace/column", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create column");
  return res.json();
};

export const updateColumn = async (
  id: string,
  data: { title?: string; order?: number; color?: string; user?: string } // ✅ เพิ่ม user
) => {
  const res = await fetch(`/api/workspace/column/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update column");
  return res.json();
};

export const deleteColumn = async (id: string) => {
  const res = await fetch(`/api/workspace/column/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete column");
  return res.ok;
};

// ==================== BoardTask APIs ====================
export const getTasks = async (params?: {
  columnId?: string;
  boardId?: string;
}) => {
  const query = new URLSearchParams();
  if (params?.columnId) query.append("columnId", params.columnId);
  if (params?.boardId) query.append("boardId", params.boardId);

  const res = await fetch(`/api/workspace/task?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch tasks");
  return res.json();
};

export const getTask = async (id: string) => {
  const res = await fetch(`/api/workspace/task/${id}`);
  if (!res.ok) throw new Error("Failed to fetch task");
  return res.json();
};

export const createTask = async (data: {
  columnId: string;
  title: string;
  description?: string;
  tag?: string;
  tagColor?: string;
  priority?: "High" | "Medium" | "Low";
  order?: number;
  dueDate?: string;
  startDate?: string;
  endDate?: string;
  assigneeIds?: string[];
  user?: string; // ✅ เพิ่ม user
}) => {
  const res = await fetch("/api/workspace/task", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create task");
  return res.json();
};

export const updateTask = async (
  id: string,
  data: {
    title?: string;
    description?: string;
    tag?: string;
    tagColor?: string;
    priority?: "High" | "Medium" | "Low";
    order?: number;
    dueDate?: string | null;
    startDate?: string | null;
    endDate?: string | null;
    columnId?: string;
    comments?: number;
    attachments?: number;
    checklist?: number;
    assigneeIds?: string[];
    user?: string;
    isArchived?: boolean; // ✅ เพิ่ม isArchived
  }
) => {
  const res = await fetch(`/api/workspace/task/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update task");
  return res.json();
};

export const deleteTask = async (id: string) => {
  const res = await fetch(`/api/workspace/task/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete task");
  return res.ok;
};

// ==================== BoardMember APIs ====================
export const getMembers = async (boardId: string) => {
  const res = await fetch(`/api/workspace/member?boardId=${boardId}`);
  if (!res.ok) throw new Error("Failed to fetch members");
  return res.json();
};

export const getMember = async (id: string) => {
  const res = await fetch(`/api/workspace/member/${id}`);
  if (!res.ok) throw new Error("Failed to fetch member");
  return res.json();
};

export const createMember = async (data: {
  boardId: string;
  name: string;
  role: string;
  avatar?: string;
  color?: string;
}) => {
  const res = await fetch("/api/workspace/member", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create member");
  return res.json();
};

export const updateMember = async (
  id: string,
  data: { name?: string; role?: string; avatar?: string; color?: string }
) => {
  const res = await fetch(`/api/workspace/member/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update member");
  return res.json();
};

export const deleteMember = async (id: string) => {
  const res = await fetch(`/api/workspace/member/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete member");
  return res.ok;
};

// ==================== BoardActivity APIs ====================
export const getActivities = async (boardId: string, limit?: number, taskId?: string) => {
  const query = new URLSearchParams({ boardId });
  if (limit) query.append("limit", limit.toString());
  if (taskId) query.append("taskId", taskId);

  const res = await fetch(`/api/workspace/activity?${query.toString()}`);
  if (!res.ok) throw new Error("Failed to fetch activities");
  return res.json();
};

export const createActivity = async (data: {
  boardId: string;
  user: string;
  action: string;
  target: string;
  projectId?: string;
  taskId?: string;
}) => {
  const res = await fetch("/api/workspace/activity", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create activity");
  return res.json();
};

export const deleteActivity = async (id: string) => {
  const res = await fetch(`/api/workspace/activity/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete activity");
  return res.ok;
};

// ==================== Checklist APIs ====================
export const getChecklistItems = async (taskId: string) => {
  const res = await fetch(`/api/workspace/checklist?taskId=${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch checklist items");
  return res.json();
};

export const getChecklistItem = async (id: string) => {
  const res = await fetch(`/api/workspace/checklist/${id}`);
  if (!res.ok) throw new Error("Failed to fetch checklist item");
  return res.json();
};

export const createChecklistItem = async (data: {
  taskId: string;
  text: string;
  isChecked?: boolean;
  order?: number;
}) => {
  const res = await fetch("/api/workspace/checklist", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create checklist item");
  return res.json();
};

export const updateChecklistItem = async (
  id: string,
  data: { text?: string; isChecked?: boolean; order?: number }
) => {
  const res = await fetch(`/api/workspace/checklist/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update checklist item");
  return res.json();
};

export const deleteChecklistItem = async (id: string) => {
  const res = await fetch(`/api/workspace/checklist/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete checklist item");
  return res.ok;
};

// ==================== Comments APIs ====================
export const getComments = async (taskId: string) => {
  const res = await fetch(`/api/workspace/comment?taskId=${taskId}`);
  if (!res.ok) throw new Error("Failed to fetch comments");
  return res.json();
};

export const createComment = async (data: { taskId: string; content: string; author?: string }) => {
  const res = await fetch(`/api/workspace/comment`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create comment");
  return res.json();
};

export const updateComment = async (id: string, data: { content?: string }) => {
  const res = await fetch(`/api/workspace/comment/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update comment");
  return res.json();
};

export const deleteComment = async (id: string) => {
  const res = await fetch(`/api/workspace/comment/${id}`, { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delete comment");
  return res.ok;
};
// ==================== BoardLabel NEW APIs ====================
export const getLabels = async (boardId: string) => {
  const res = await fetch(`/api/workspace/label?boardId=${boardId}`);
  if (!res.ok) throw new Error("Failed to fetch labels");
  return res.json();
};

export const createLabel = async (data: {
  boardId: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
}) => {
  const res = await fetch("/api/workspace/label", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create label");
  return res.json();
};

export const updateLabel = async (
  id: string,
  data: {
    name?: string;
    color?: string;
    bgColor?: string;
    textColor?: string;
  }
) => {
  const res = await fetch(`/api/workspace/label/${id}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update label");
  return res.json();
};

export const deleteLabel = async (id: string) => {
  const res = await fetch(`/api/workspace/label/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete label");
  return res.ok;
};

