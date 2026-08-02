"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { createSignalRConnection } from "@/lib/signalr";
import type { ChatMessage } from "@/types/chat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";
const MAX_FETCH_RETRIES = 3;
const RETRY_DELAY_MS = 2000;

interface TicketStatusChangedPayload {
  ticketId: string;
  status: string;
  assignedToId?: string | null;
}

interface UseChatSignalRProps {
  ticketId: string | null;
  isAuthenticated: boolean;
  userId?: string;
  botPhase: string;
  isOpen: boolean;
  onReceiveMessage: (msg: ChatMessage) => void;
  onIncrementUnread: () => void;
  onSetBotPhase: (phase: "LIVE_AGENT") => void;
  onSetMessages: (messages: ChatMessage[]) => void;
  onTicketStatusChanged?: (payload: TicketStatusChangedPayload) => void;
}

export function useChatSignalR({
  ticketId,
  isAuthenticated,
  userId,
  botPhase,
  isOpen,
  onReceiveMessage,
  onIncrementUnread,
  onSetBotPhase,
  onSetMessages,
  onTicketStatusChanged,
}: UseChatSignalRProps) {
  const [isConnected, setIsConnected] = useState(false);
  const [messagesError, setMessagesError] = useState<string | null>(null);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isOpenRef = useRef(isOpen);
  const retryTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Use refs for callback props to avoid re-triggering the connection effect
  const onReceiveMessageRef = useRef(onReceiveMessage);
  const onIncrementUnreadRef = useRef(onIncrementUnread);
  const onSetBotPhaseRef = useRef(onSetBotPhase);
  const onSetMessagesRef = useRef(onSetMessages);
  const onTicketStatusChangedRef = useRef(onTicketStatusChanged);

  useEffect(() => { isOpenRef.current = isOpen; }, [isOpen]);
  useEffect(() => { onReceiveMessageRef.current = onReceiveMessage; }, [onReceiveMessage]);
  useEffect(() => { onIncrementUnreadRef.current = onIncrementUnread; }, [onIncrementUnread]);
  useEffect(() => { onSetBotPhaseRef.current = onSetBotPhase; }, [onSetBotPhase]);
  useEffect(() => { onSetMessagesRef.current = onSetMessages; }, [onSetMessages]);
  useEffect(() => { onTicketStatusChangedRef.current = onTicketStatusChanged; }, [onTicketStatusChanged]);

  // Track whether auth was ever established to prevent flicker-induced disconnection
  const wasAuthenticatedRef = useRef(false);
  useEffect(() => {
    if (isAuthenticated) {
      wasAuthenticatedRef.current = true;
    }
  }, [isAuthenticated]);

  // Fetch initial message history from CRM via backend API proxy with retry logic
  const fetchMessages = useCallback(
    async function fetchMessagesFn(activeTicketId: string, attempt = 0) {
      if (attempt === 0) {
        setMessagesError(null);
      }
      try {
        const res = await fetch(`${API_BASE_URL}/tickets/${activeTicketId}/messages`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          if (Array.isArray(data)) {
            onSetMessagesRef.current(data);
            setMessagesError(null);
            if (data.length > 0) {
              onSetBotPhaseRef.current("LIVE_AGENT");
            }
          }
        } else {
          console.error(`Failed to load messages: ${res.status}`);
          if (attempt < MAX_FETCH_RETRIES) {
            retryTimerRef.current = setTimeout(() => fetchMessagesFn(activeTicketId, attempt + 1), RETRY_DELAY_MS);
          } else {
            setMessagesError("Failed to load message history. Please try refreshing the page.");
          }
        }
      } catch (err) {
        console.error("Failed to load message history:", err);
        if (attempt < MAX_FETCH_RETRIES) {
          retryTimerRef.current = setTimeout(() => fetchMessagesFn(activeTicketId, attempt + 1), RETRY_DELAY_MS);
        } else {
          setMessagesError("Failed to load message history. Please try refreshing the page.");
        }
      }
    },
    [] // No dependencies — uses refs for callbacks
  );

  // Cleanup retry timer on unmount
  useEffect(() => {
    return () => {
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
      }
    };
  }, []);

  // Connect SignalR hub ONLY when in LIVE_AGENT phase and ticketId exists
  useEffect(() => {
    if (!ticketId || !userId || botPhase !== "LIVE_AGENT") return;

    let cancelled = false;

    fetchMessages(ticketId);

    const connection = createSignalRConnection();
    connectionRef.current = connection;

    connection.on("ReceiveMessage", (msg: ChatMessage) => {
      onReceiveMessageRef.current(msg);
      if (!isOpenRef.current && msg.senderId !== userId) {
        onIncrementUnreadRef.current();
      }
    });

    connection.on("TicketStatusChanged", (payload: TicketStatusChangedPayload) => {
      onTicketStatusChangedRef.current?.(payload);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("ticket-status-changed", { detail: payload }));
      }
    });

    connection
      .start()
      .then(() => {
        if (cancelled) {
          connection.stop().catch(() => {});
          return;
        }
        setIsConnected(true);
        connection.invoke("JoinTicket", ticketId).catch(console.error);
      })
      .catch((err) => {
        // "Failed to start the HttpConnection before stop() was called" is expected
        // when the effect is cleaned up during connection startup (React Strict Mode / Fast Refresh).
        if (!cancelled) {
          console.error("SignalR connection error:", err);
        }
      });

    return () => {
      cancelled = true;
      const conn = connection;
      connectionRef.current = null;
      setIsConnected(false);

      // Clear any pending retry timers
      if (retryTimerRef.current) {
        clearTimeout(retryTimerRef.current);
        retryTimerRef.current = null;
      }

      // Only stop if the connection is fully connected.
      // If still in "Connecting" state, do NOT call stop() — the cancelled flag
      // will cause the .start().then() handler to stop it once it resolves.
      // Calling stop() during "Connecting" causes:
      // "Failed to start the HttpConnection before stop() was called"
      if (conn.state === signalR.HubConnectionState.Connected) {
        conn.invoke("LeaveTicket", ticketId)
          .catch(() => {})
          .finally(() => conn.stop().catch(() => {}));
      }
      // For Connecting state: the cancelled flag handles cleanup in .start().then()
    };
  }, [ticketId, botPhase, fetchMessages, userId]);

  const sendSignalRMessage = useCallback(
    async (text: string) => {
      if (!ticketId || !userId) return false;
      const connection = connectionRef.current;
      if (connection && connection.state === signalR.HubConnectionState.Connected) {
        try {
          await connection.invoke("SendMessage", ticketId, userId, text, "customer");
          return true;
        } catch (err) {
          console.error("Failed to send message via SignalR:", err);
        }
      }
      return false;
    },
    [ticketId, userId]
  );

  return {
    isConnected,
    messagesError,
    sendSignalRMessage,
  };
}
