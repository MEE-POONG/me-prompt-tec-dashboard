export interface Member {
  id: string;
  name: string;
  color: string;
  short: string;
  userId?: string;
  avatar?: string;
  userAvatar?: string;
}

export interface TagItem {
  id: string;
  name: string;
  color: string;
  bgColor: string;
  textColor: string;
}

export interface CheckItem {
  id: string;
  text: string;
  isChecked: boolean;
}

export interface AttachmentItem {
  id: string;
  type: "file" | "link";
  name: string;
  url?: string;
  date: string;
}

export interface ActivityLog {
  id: string;
  user: string | { id: string; name: string; avatar?: string };
  action: string;
  time: string;
}

export interface Comment {
  id: string;
  user: string | { id: string; name: string; avatar?: string };
  text: string;
  time: string;
  color: string;
  isEdited?: boolean;
}

export interface ContentBlock {
  id: string;
  type: "checklist" | "attachment";
  title?: string;
  items?: CheckItem[];
  attachments?: AttachmentItem[];
}
