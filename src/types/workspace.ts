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
    members: string[];
    comments: number;
    attachments: number;
    date: string;
    // Optional fields added for dashboard/status mapping
    status?: string;
    rawDueDate?: string;
    assignees?: any[];
    memberIds?: string[];
};

export type WorkspaceMember = {
    name: string;
    role: string;
    avatar: string;
    color: string;
};

export type WorkspaceActivity = {
    user: string;
    action: string;
    target: string;
    time: string;
};

export type WorkspaceInfo = {
    name: string;
    description: string;
    progress: number;
    dueDate: string;
    members: WorkspaceMember[];
    activities: WorkspaceActivity[];
};

export interface WorkspaceBoardProps {
    workspaceId: string;
}