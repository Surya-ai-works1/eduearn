// src/features/communication/services/communicationService.ts

export interface Notification {
  id: string;
  title: string;
  content: string;
  category:
    | "enrollment"
    | "assignment"
    | "quiz"
    | "live-class"
    | "certificate"
    | "payment"
    | "refund"
    | "wallet"
    | "announcement"
    | "security";
  read: boolean;
  archived: boolean;
  createdAt: string;
}

export interface Conversation {
  id: string;
  participantName: string;
  participantAvatar: string;
  participantRole: "Student" | "Tutor" | "Admin";
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  online: boolean;
}

export interface Message {
  id: string;
  senderId: string; // "me" or "them"
  content: string;
  status: "sent" | "delivered" | "read";
  createdAt: string;
}

export interface NotificationPreferences {
  emailEnabled: boolean;
  pushEnabled: boolean;
  assignmentAlerts: boolean;
  courseUpdates: boolean;
  marketingEmails: boolean;
  certificateAlerts: boolean;
  liveSessionReminders: boolean;
  paymentAlerts: boolean;
}

const isClient = typeof window !== "undefined";

export const communicationService = {
  // ─── NOTIFICATIONS METHODS ──────────────────────────────────────────
  getNotifications(): Notification[] {
    const defaults: Notification[] = [
      { id: "noti-1", title: "Certificate Ready for Claim", content: "Congratulations! Your certificate for 'Next.js 16 Masterclass' is generated and verified.", category: "certificate", read: false, archived: false, createdAt: "2026-06-28 10:00" },
      { id: "noti-2", title: "Upcoming Live Batch Reminder", content: "Your morning cohort session starts in 15 minutes. Click the Google Meet tab in your classroom.", category: "live-class", read: false, archived: false, createdAt: "2026-06-28 08:45" },
      { id: "noti-3", title: "New Assignment Out", content: "Tutor Amit Verma posted 'Figma Variant Autolayouts Task'. Due in 3 days.", category: "assignment", read: true, archived: false, createdAt: "2026-06-25 14:00" },
      { id: "noti-4", title: "Payment Successful", content: "Your receipt of ₹4,999 has been processed. Transaction ID: TX-EE-90812.", category: "payment", read: true, archived: false, createdAt: "2026-06-24 16:30" }
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_notifications_list");
    if (!saved) {
      localStorage.setItem("eduearn_notifications_list", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  updateNotifications(list: Notification[]) {
    if (isClient) {
      localStorage.setItem("eduearn_notifications_list", JSON.stringify(list));
    }
  },

  addNotification(title: string, content: string, category: Notification["category"]) {
    const list = this.getNotifications();
    const newNoti: Notification = {
      id: `noti-${Date.now()}`,
      title,
      content,
      category,
      read: false,
      archived: false,
      createdAt: new Date().toISOString().replace("T", " ").substring(0, 16),
    };
    list.unshift(newNoti);
    this.updateNotifications(list);
    return newNoti;
  },

  // ─── CONVERSATIONS METHODS ──────────────────────────────────────────
  getConversations(): Conversation[] {
    const defaults: Conversation[] = [
      { id: "conv-1", participantName: "Amit Verma", participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Amit", participantRole: "Tutor", lastMessage: "Let's sync up on the React Hooks doubt tomorrow morning.", lastMessageTime: "10:30 AM", unreadCount: 2, online: true },
      { id: "conv-2", participantName: "Rahul Sharma", participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Rahul", participantRole: "Student", lastMessage: "I uploaded my assignment sheet. Please review.", lastMessageTime: "Yesterday", unreadCount: 0, online: false },
      { id: "conv-3", participantName: "EduEarn Finance", participantAvatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=Finance", participantRole: "Admin", lastMessage: "Your withdrawal request of ₹3,000 has been verified.", lastMessageTime: "2 days ago", unreadCount: 0, online: true }
    ];
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_conversations");
    if (!saved) {
      localStorage.setItem("eduearn_conversations", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  saveConversations(list: Conversation[]) {
    if (isClient) {
      localStorage.setItem("eduearn_conversations", JSON.stringify(list));
    }
  },

  // ─── MESSAGE THREADS ──────────────────────────────────────────────
  getMessages(conversationId: string): Message[] {
    const defaults: Record<string, Message[]> = {
      "conv-1": [
        { id: "m-1", senderId: "them", content: "Hey, did you look at the Figma homework files?", status: "read", createdAt: "10:15 AM" },
        { id: "m-2", senderId: "me", content: "Yes! The autolayout components work perfectly.", status: "read", createdAt: "10:20 AM" },
        { id: "m-3", senderId: "them", content: "Let's sync up on the React Hooks doubt tomorrow morning.", status: "delivered", createdAt: "10:30 AM" }
      ],
      "conv-2": [
        { id: "m-4", senderId: "them", content: "Could you check my project?", status: "read", createdAt: "Yesterday" }
      ],
      "conv-3": [
        { id: "m-5", senderId: "them", content: "Your payout release request is approved.", status: "read", createdAt: "2 days ago" }
      ]
    };
    if (!isClient) return defaults[conversationId] || [];
    const saved = localStorage.getItem(`eduearn_messages_${conversationId}`);
    if (!saved) {
      const initial = defaults[conversationId] || [];
      localStorage.setItem(`eduearn_messages_${conversationId}`, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(saved);
  },

  sendMessage(conversationId: string, content: string): Message {
    const messages = this.getMessages(conversationId);
    const newMsg: Message = {
      id: `m-${Date.now()}`,
      senderId: "me",
      content,
      status: "sent",
      createdAt: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };
    messages.push(newMsg);
    if (isClient) {
      localStorage.setItem(`eduearn_messages_${conversationId}`, JSON.stringify(messages));
    }

    // Update last message in conversation
    const conversations = this.getConversations();
    const convIdx = conversations.findIndex((c) => c.id === conversationId);
    if (convIdx !== -1) {
      conversations[convIdx].lastMessage = content;
      conversations[convIdx].lastMessageTime = newMsg.createdAt;
      this.saveConversations(conversations);
    }

    return newMsg;
  },

  // ─── USER PREFERENCES ─────────────────────────────────────────────
  getPreferences(): NotificationPreferences {
    const defaults: NotificationPreferences = {
      emailEnabled: true,
      pushEnabled: true,
      assignmentAlerts: true,
      courseUpdates: true,
      marketingEmails: false,
      certificateAlerts: true,
      liveSessionReminders: true,
      paymentAlerts: true,
    };
    if (!isClient) return defaults;
    const saved = localStorage.getItem("eduearn_notification_preferences");
    if (!saved) {
      localStorage.setItem("eduearn_notification_preferences", JSON.stringify(defaults));
      return defaults;
    }
    return JSON.parse(saved);
  },

  savePreferences(prefs: NotificationPreferences) {
    if (isClient) {
      localStorage.setItem("eduearn_notification_preferences", JSON.stringify(prefs));
    }
  }
};
