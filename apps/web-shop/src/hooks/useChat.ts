"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { apiClient } from "@/lib/api/api-client";
import { supportApi } from "@/lib/api/support-api";
import { useChatSignalR } from "./useChatSignalR";
import type { ChatMessage, SupportTicketResponse, BotReplyResponse } from "@/types/chat";

export type BotPhase = "BOT_GREETING" | "BOT_THINKING" | "BOT_RESPONDED" | "ESCALATE_PROMPT" | "LIVE_AGENT";

interface UseChatOptions {
  onTicketStatusChanged?: (payload: { ticketId: string; status: string; assignedToId?: string | null }) => void;
}

export function useChat(initialTicketId?: string, options?: UseChatOptions, disabled?: boolean) {
  const { data: session, status } = useSession();
  const [isOpen, setIsOpen] = useState(false);
  const [ticketId, setTicketId] = useState<string | null>(initialTicketId || null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [isBotReplying, setIsBotReplying] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [botPhase, setBotPhase] = useState<BotPhase>(initialTicketId ? "LIVE_AGENT" : "BOT_GREETING");

  const token = (session as { accessToken?: string })?.accessToken;
  const isAuthenticated = status === "authenticated" && Boolean(session?.user) && Boolean(token);
  const userId = session?.user?.id;

  const handleReceiveMessage = useCallback((msg: ChatMessage) => {
    setMessages((prev) => (prev.some((m) => m.id === msg.id) ? prev : [...prev, msg]));
  }, []);

  const handleIncrementUnread = useCallback(() => setUnreadCount((prev) => prev + 1), []);

  const { isConnected, messagesError, sendSignalRMessage } = useChatSignalR({
    ticketId: disabled ? null : ticketId,
    isAuthenticated,
    userId,
    botPhase,
    isOpen,
    onReceiveMessage: handleReceiveMessage,
    onIncrementUnread: handleIncrementUnread,
    onSetBotPhase: setBotPhase,
    onSetMessages: setMessages,
    onTicketStatusChanged: options?.onTicketStatusChanged,
  });

  const [isRestoringSession, setIsRestoringSession] = useState(() => !initialTicketId);

  // Restore active ticket session for authenticated user on mount or session resolution
  useEffect(() => {
    if (initialTicketId) {
      return;
    }
    if (status === "loading") return;
    if (!userId || typeof window === "undefined") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsRestoringSession(false);
      return;
    }

    const storageKey = `br_chat_ticket_${userId}`;
    const storedTicketId = localStorage.getItem(storageKey);
    if (!storedTicketId) {
      setIsRestoringSession(false);
      return;
    }

    let isMounted = true;
    supportApi
      .getTicketDetails(storedTicketId)
      .then((details) => {
        if (!isMounted) return;
        if (details && details.status !== "Completed" && details.status !== "Canceled") {
          setTicketId(storedTicketId);
          setBotPhase("LIVE_AGENT");
        } else {
          localStorage.removeItem(storageKey);
        }
      })
      .catch(() => {
        // Fallback: keep stored ticketId if offline/error
        if (isMounted) {
          setTicketId(storedTicketId);
          setBotPhase("LIVE_AGENT");
        }
      })
      .finally(() => {
        if (isMounted) {
          setIsRestoringSession(false);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [userId, status, initialTicketId]);

  // Load bot chat history from sessionStorage on mount/session load
  useEffect(() => {
    if (typeof window === "undefined" || botPhase === "LIVE_AGENT" || initialTicketId || isRestoringSession) return;
    const botStorageKey = `br_chat_bot_messages_${userId || "guest"}`;
    const storedBotMessages = sessionStorage.getItem(botStorageKey);
    if (storedBotMessages) {
      try {
        const parsed = JSON.parse(storedBotMessages);
        if (Array.isArray(parsed) && parsed.length > 0) {
          // eslint-disable-next-line react-hooks/set-state-in-effect
          setMessages(parsed);
          const storedBotPhase = sessionStorage.getItem(`br_chat_bot_phase_${userId || "guest"}`);
          if (storedBotPhase) {
            setBotPhase(storedBotPhase as BotPhase);
          }
        }
      } catch (e) {
        console.error("Failed to parse stored bot messages:", e);
      }
    }
  }, [userId, botPhase, initialTicketId, isRestoringSession]);

  // Persist bot chat messages to sessionStorage
  useEffect(() => {
    if (typeof window === "undefined" || botPhase === "LIVE_AGENT" || initialTicketId || messages.length === 0 || isRestoringSession) return;
    const botStorageKey = `br_chat_bot_messages_${userId || "guest"}`;
    sessionStorage.setItem(botStorageKey, JSON.stringify(messages));
    sessionStorage.setItem(`br_chat_bot_phase_${userId || "guest"}`, botPhase);
  }, [messages, botPhase, userId, initialTicketId, isRestoringSession]);

  // If phase switches to LIVE_AGENT, clear the bot history
  useEffect(() => {
    if (botPhase === "LIVE_AGENT") {
      const key = `br_chat_bot_messages_${userId || "guest"}`;
      sessionStorage.removeItem(key);
      sessionStorage.removeItem(`br_chat_bot_phase_${userId || "guest"}`);
    }
  }, [botPhase, userId]);

  useEffect(() => {
    if (isRestoringSession) return;
    if (messages.length === 0 && !initialTicketId && !ticketId && botPhase === "BOT_GREETING") {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setMessages([{
        id: "bot-greeting",
        senderId: "bot",
        senderName: "SentraCX AI Assistant",
        senderType: "bot",
        content: "Hello! 👋 Welcome to Bren Raphael's Ube Jam & Halaya Shop support. How can I assist you today?",
        isRead: true,
        sentAt: new Date().toISOString(),
      }]);
    }
  }, [messages.length, initialTicketId, ticketId, botPhase, isRestoringSession]);

  // Initialize or retrieve ticketId
  const getOrCreateTicket = useCallback(async () => {
    if (!userId || !token) return null;
    if (ticketId) return ticketId;

    const storageKey = `br_chat_ticket_${userId}`;
    const existingTicket = localStorage.getItem(storageKey);
    if (existingTicket) {
      try {
        const details = await supportApi.getTicketDetails(existingTicket);
        if (details && details.status !== "Completed" && details.status !== "Canceled") {
          setTicketId(existingTicket);
          return existingTicket;
        } else {
          localStorage.removeItem(storageKey);
        }
      } catch {
        setTicketId(existingTicket);
        return existingTicket;
      }
    }

    try {
      setIsLoading(true);
      const res = await apiClient.post<SupportTicketResponse>(
        "/webhooks/support-ticket",
        {},
        { token }
      );
      if (res?.ticketId) {
        localStorage.setItem(storageKey, res.ticketId);
        setTicketId(res.ticketId);
        return res.ticketId;
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to initialize support chat session.");
    } finally {
      setIsLoading(false);
    }
    return null;
  }, [userId, token, ticketId]);

  const toggleOpen = useCallback(() => {
    setIsOpen((prev) => {
      const next = !prev;
      if (next) setUnreadCount(0);
      return next;
    });
  }, []);

  const escalateToLiveAgent = useCallback(async () => {
    if (!isAuthenticated) {
      setError("Please sign in to your account to connect to a live support representative.");
      return;
    }
    setIsLoading(true);
    setError(null);
    try {
      const activeTicketId = await getOrCreateTicket();
      if (activeTicketId) {
        setBotPhase("LIVE_AGENT");
        setMessages((prev) => [
          ...prev,
          {
            id: `system-${Date.now()}`,
            senderId: "system",
            senderName: "System",
            senderType: "agent",
            content: "You have requested a live support representative. Connecting to SentraCX agent queue...",
            isRead: true,
            sentAt: new Date().toISOString(),
          },
        ]);
      }
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, getOrCreateTicket]);

  const sendMessage = useCallback(
    async (content: string) => {
      const text = content.trim();
      if (!text) return;

      const currentUserId = userId || "guest";
      const currentUserName = session?.user?.name || "Guest";

      // 1. Live agent phase
      if (botPhase === "LIVE_AGENT") {
        await sendSignalRMessage(text);
        return;
      }

      // 2. Bot phase
      const userMsg: ChatMessage = {
        id: `user-${Date.now()}`,
        senderId: currentUserId,
        senderName: currentUserName,
        senderType: "user",
        content: text,
        isRead: true,
        sentAt: new Date().toISOString(),
      };

      setMessages((prev) => [...prev, userMsg]);
      setBotPhase("BOT_THINKING");
      setIsBotReplying(true);

      try {
        const reply: BotReplyResponse = isAuthenticated
          ? await supportApi.getBotReply(text, ticketId || undefined, token)
          : await supportApi.getPublicBotReply(text);

        const botMsg: ChatMessage = {
          id: `bot-${Date.now()}`,
          senderId: "bot",
          senderName: "SentraCX AI Assistant",
          senderType: "bot",
          content: reply.reply,
          isRead: true,
          sentAt: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, botMsg]);
        setBotPhase(reply.shouldEscalate ? "ESCALATE_PROMPT" : "BOT_RESPONDED");
      } catch (err) {
        console.error("Bot reply error:", err);
        setBotPhase("ESCALATE_PROMPT");
      } finally {
        setIsBotReplying(false);
      }
    },
    [botPhase, ticketId, userId, session?.user?.name, token, isAuthenticated, sendSignalRMessage]
  );

  return {
    isOpen,
    toggleOpen,
    setIsOpen,
    messages,
    unreadCount,
    isConnected,
    isLoading,
    isBotReplying,
    botPhase,
    error: error || messagesError,
    isAuthenticated,
    sendMessage,
    escalateToLiveAgent,
    ticketId,
  };
}
