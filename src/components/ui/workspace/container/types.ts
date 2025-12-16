export interface ActivityItem {
  id: string;
  user: string;
  action: string;
  target?: string;
  timestamp: Date;
  type: "topci" | "comment" | "upload" | "move";
}

export interface AttachmentItem {
  id: string;
  type: "file" | "link";
  name: string;
  url?: string; // For links or file preview URLs
  dateAdded: Date;
}

export interface CommentItem {
  id: string;
  user: string;
  text: string;
  timestamp: Date;
  attachments?: AttachmentItem[];
}

export interface ChecklistItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface CardContentBlock {
  id: string;
  type: "checklist" | "tags" | "date" | "attachment";
  title?: string;
  items?: ChecklistItem[];
  selectedTags?: string[]; // Array of Tag IDs
  startDate?: Date;
  endDate?: Date;
  attachments?: AttachmentItem[];
}

export interface Tag {
  id: string;
  name: string;
  color: string;
}

export interface Member {
  id: string;
  name: string;
  role: string;
  color: string;
}

export interface ModalWorkflowProps {
  isOpen: boolean;
  onClose: () => void;
  task?: {
    id: string;
    title: string;
    description?: string;
    tag?: string;
    tagColor?: string;
    priority?: string;
    startDate?: Date;
    endDate?: Date;
    assignees?: any[];
    comments?: number;
    attachments?: number;
  };
}
