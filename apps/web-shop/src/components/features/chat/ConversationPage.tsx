"use client";

import { useEffect, useState, useRef, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ArrowLeft, Send, Loader2, Ban, ShieldCheck } from "lucide-react";
import { useChat } from "@/hooks/useChat";
import { ChatMessageBubble } from "./ChatMessageBubble";
import { ConversationHeader } from "./ConversationHeader";
import { CancelTicketModal } from "./CancelTicketModal";
import { supportApi } from "@/lib/api/support-api";
import type { TicketSummary } from "@/types/chat";

interface ConversationPageProps {
  ticketId: string;
}

export function ConversationPage({ ticketId }: ConversationPageProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const [ticket, setTicket] = useState<TicketSummary | null>(null);
  const [isLoadingTicket, setIsLoadingTicket] = useState(true);
  const [isCancelling, setIsCancelling] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [input, setInput] = useState("");
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const userId = session?.user?.id;

  const {
    messages,
    isConnected,
    error: chatError,
    sendMessage,
  } = useChat(ticketId);

  useEffect(() => {
    async function loadTicket() {
      setIsLoadingTicket(true);
      const data = await supportApi.getTicketDetails(ticketId);
      setTicket(data);
      setIsLoadingTicket(false);
    }
    loadTicket();
  }, [ticketId]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSendMessage = async (e: FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const text = input.trim();
    setInput("");
    setIsSending(true);
    try {
      await sendMessage(text);
    } finally {
      setIsSending(false);
    }
  };

  const handleCancelTicket = async () => {
    setIsCancelling(true);
    try {
      const success = await supportApi.cancelTicket(ticketId);
      if (success) {
        setTicket((prev) => (prev ? { ...prev, status: "Canceled" } : null));
        setShowCancelModal(false);
        router.push("/support");
      }
    } finally {
      setIsCancelling(false);
    }
  };

  if (isLoadingTicket) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <Loader2 className="w-8 h-8 animate-spin text-[#451077] mx-auto mb-3" />
        <p className="text-sm text-slate-500 font-medium">Loading conversation details...</p>
      </div>
    );
  }

  const isClosed = ticket?.status === "Completed" || ticket?.status === "Canceled";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Top Breadcrumb & Actions */}
      <div className="flex items-center justify-between gap-4 mb-6">
        <Link
          href="/support"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#451077] hover:text-[#340c5a] bg-purple-50 px-3.5 py-2 rounded-full border border-purple-100 shadow-2xs transition-all hover:bg-purple-100"
        >
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Support
        </Link>

        {!isClosed && (
          <button
            onClick={() => setShowCancelModal(true)}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 border border-red-200 rounded-lg transition-all cursor-pointer"
          >
            <Ban className="w-3.5 h-3.5" /> Cancel Ticket
          </button>
        )}
      </div>

      {/* Main Conversation Container */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden flex flex-col h-[650px]">
        {/* Ticket Header Sub-Component */}
        <ConversationHeader ticket={ticket} ticketId={ticketId} />

        {/* Live SignalR Connection Banner */}
        <div className="bg-purple-50 px-6 py-2 border-b border-purple-100 flex items-center justify-between text-xs text-purple-900 font-medium">
          <span className="flex items-center gap-2">
            <span
              className={`h-2 w-2 rounded-full ${
                isConnected ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
              }`}
            />
            {isConnected ? "Real-time SignalR chat active" : "Connecting to support stream..."}
          </span>
          <span className="text-[11px] text-purple-600">SentraCX Support Hub</span>
        </div>

        {/* Messages List Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3 bg-slate-50/50">
          {chatError && (
            <div className="p-3 text-xs text-red-600 bg-red-50 border border-red-200 rounded-lg">
              {chatError}
            </div>
          )}

          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-400 text-center">
              <ShieldCheck className="w-10 h-10 mb-2 text-purple-200" />
              <p className="text-sm font-semibold text-slate-600">No messages in this ticket yet</p>
              <p className="text-xs text-slate-400 mt-1 max-w-sm">
                Send a message below to start communicating directly with our support team.
              </p>
            </div>
          ) : (
            messages.map((msg) => (
              <ChatMessageBubble key={msg.id} message={msg} isSelf={msg.senderId === userId} />
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Footer Input */}
        {isClosed ? (
          <div className="p-4 bg-slate-100 text-center text-xs text-slate-500 border-t border-slate-200 font-medium">
            This support ticket is closed ({ticket?.status}). You cannot send further messages.
          </div>
        ) : (
          <form onSubmit={handleSendMessage} className="p-4 bg-white border-t border-slate-200">
            <div className="flex items-center gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message to support staff..."
                disabled={isSending}
                className="flex-1 px-4 py-2.5 text-xs sm:text-sm border border-slate-200 rounded-xl focus:outline-none focus:border-[#451077] focus:ring-1 focus:ring-[#451077] disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isSending}
                className="inline-flex items-center justify-center h-10 px-5 bg-[#451077] text-white text-xs font-semibold rounded-xl hover:bg-[#340c5a] transition-all disabled:opacity-50 cursor-pointer shadow-sm"
              >
                {isSending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <>
                    <span>Send</span>
                    <Send className="w-3.5 h-3.5 ml-1.5" />
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Cancel Confirmation Modal Sub-Component */}
      <CancelTicketModal
        isOpen={showCancelModal}
        isCancelling={isCancelling}
        onClose={() => setShowCancelModal(false)}
        onConfirm={handleCancelTicket}
      />
    </div>
  );
}
