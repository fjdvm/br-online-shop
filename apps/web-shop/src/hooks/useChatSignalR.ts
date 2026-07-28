"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { createSignalRConnection } from "@/lib/signalr";
import type { ChatMessage } from "@/types/chat";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5004/api";

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
}: UseChatSignalRProps) {
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);
  const isOpenRef = useRef(isOpen);

  useEffect(() => {
    isOpenRef.current = isOpen;
  }, [isOpen]);

  // Fetch initial message history from CRM via backend API proxy
  const fetchMessages = useCallback(
    async (activeTicketId: string) => {
      try {
        const res = await fetch(`${API_BASE_URL}/tickets/${activeTicketId}/messages`);
        if (res.ok) {
          const data: ChatMessage[] = await res.json();
          if (Array.isArray(data) && data.length > 0) {
            onSetMessages(data);
            onSetBotPhase("LIVE_AGENT");
          }
        }
      } catch (err) {
        console.error("Failed to load message history:", err);
      }
    },
    [onSetMessages, onSetBotPhase]
  );

  // Connect SignalR hub ONLY when in LIVE_AGENT phase and ticketId exists
  useEffect(() => {
    if (!ticketId || !isAuthenticated || botPhase !== "LIVE_AGENT") return;

    fetchMessages(ticketId);

    const connection = createSignalRConnection();
    connectionRef.current = connection;

    connection.on("ReceiveMessage", (msg: ChatMessage) => {
      onReceiveMessage(msg);
      if (!isOpenRef.current && msg.senderId !== userId) {
        onIncrementUnread();
      }
    });

    connection
      .start()
      .then(() => {
        setIsConnected(true);
        connection.invoke("JoinTicket", ticketId).catch(console.error);
      })
      .catch((err) => {
        console.error("SignalR connection error:", err);
      });

    return () => {
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveTicket", ticketId).catch(console.error);
      }
      connection.stop().catch(console.error);
      connectionRef.current = null;
      setIsConnected(false);
    };
  }, [ticketId, isAuthenticated, userId, botPhase, fetchMessages, onReceiveMessage, onIncrementUnread]);

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
    sendSignalRMessage,
  };
}
