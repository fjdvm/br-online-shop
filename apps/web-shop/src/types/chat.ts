export type SenderType = "user" | "bot" | "agent";

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName?: string;
  senderType?: SenderType;
  content: string;
  isRead: boolean;
  sentAt: string;
}

export interface SupportTicketResponse {
  ticketId: string;
}

export interface BotReplyResponse {
  reply: string;
  category: string;
  shouldEscalate: boolean;
}

export interface TicketSummary {
  id: string;
  title: string;
  description: string;
  status: string; // Unclaimed, Claimed, Ongoing, Completed, Canceled
  customerId: string;
  assignedToId?: string;
  assignedToName?: string;
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  createdUtc?: string;
  updatedUtc?: string;
  lastUpdatedAt?: string;
  hasStaffReplied?: boolean;
}
