export  interface ContactMessage {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  createdAt: Date;
}

export interface NewContactMessage {
  name: string;
  email: string;
  subject: string;
  message: string;
}

export interface ContactResponse {
  success: boolean;
  data?: ContactMessage;
  error?: string;
}

export interface ContactListResponse {
  success: boolean;
  data?: ContactMessage[];
  error?: string;
}


