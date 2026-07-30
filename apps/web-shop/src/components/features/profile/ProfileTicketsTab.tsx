"use client";

import { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { Headphones, MessageSquare, Plus, Clock, User, ShieldCheck, Loader2 } from "lucide-react";
import { supportApi } from "@/lib/api/support-api";
import { TicketSubmitDialog } from "./TicketSubmitDialog";
import type { TicketSummary } from "@/types/chat";

interface ProfileTicketsTabProps {
  userId?: string;
  onOpenLiveChat?: () => void;
}

export function ProfileTicketsTab({ userId, onOpenLiveChat }: ProfileTicketsTabProps) {
  const [tickets, setTickets] = useState<TicketSummary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitDialogOpen, setIsSubmitDialogOpen] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>("All");

  const loadTickets = useCallback(async (silent = false) => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    if (!silent) setIsLoading(true);
    const data = await supportApi.getCustomerTickets(userId);
    setTickets(data);
    if (!silent) setIsLoading(false);
  }, [userId]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    loadTickets();
  }, [loadTickets]);

  // Poll for ticket updates every 10 seconds
  useEffect(() => {
    if (!userId) return;

    const interval = setInterval(() => {
      loadTickets(true);
    }, 10000);

    return () => clearInterval(interval);
  }, [loadTickets, userId]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "Unclaimed":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "Claimed":
      case "Ongoing":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "Completed":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "Canceled":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-slate-100 text-slate-700 border-slate-200";
    }
  };

  const getCount = (status: string) => {
    if (status === "All") return tickets.length;
    if (status === "Ongoing") {
      return tickets.filter((t) => t.status === "Ongoing" || t.status === "Claimed").length;
    }
    return tickets.filter((t) => t.status === status).length;
  };

  const filteredTickets = tickets.filter((ticket) => {
    if (statusFilter === "All") return true;
    if (statusFilter === "Ongoing") {
      return ticket.status === "Ongoing" || ticket.status === "Claimed";
    }
    return ticket.status === statusFilter;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-border pb-5">
        <div>
          <h2 className="text-xl font-extrabold text-foreground flex items-center gap-2">
            <Headphones className="w-5 h-5 text-primary" /> Customer Support Tickets
          </h2>
          <p className="text-xs text-muted-foreground mt-1 font-medium">
            Submit inquiry, request, or complaint tickets and talk to SentraCX support staff
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setIsSubmitDialogOpen(true)}
            className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary text-white text-xs font-semibold rounded-xl hover:bg-primary/90 shadow-sm transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Open New Ticket
          </button>

          {onOpenLiveChat && (
            <button
              onClick={onOpenLiveChat}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-surface-card text-foreground border border-border text-xs font-semibold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
            >
              <MessageSquare className="w-3.5 h-3.5 text-primary" /> Live AI Chat
            </button>
          )}
        </div>
      </div>

      {/* Status Filters */}
      {tickets.length > 0 && (
        <div className="flex flex-wrap gap-1.5 p-1 bg-surface-low border border-border rounded-xl w-fit">
          {["All", "Unclaimed", "Ongoing", "Completed", "Canceled"].map((status) => (
            <button
              key={status}
              type="button"
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                statusFilter === status
                  ? "bg-primary text-white shadow-xs"
                  : "text-muted-foreground hover:text-foreground hover:bg-slate-100/50"
              }`}
            >
              {status} <span className="opacity-70 ml-0.5 text-[10px]">({getCount(status)})</span>
            </button>
          ))}
        </div>
      )}

      {/* Tickets List */}
      {isLoading ? (
        <div className="py-12 text-center text-xs text-muted-foreground font-medium">
          <Loader2 className="w-6 h-6 animate-spin mx-auto mb-2 text-primary" />
          Loading your support tickets...
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-8 text-center bg-surface-low border border-border rounded-2xl">
          <ShieldCheck className="w-10 h-10 text-primary/40 mx-auto mb-2" />
          <h3 className="text-sm font-bold text-foreground">No support tickets found</h3>
          <p className="text-xs text-muted-foreground mt-1 max-w-sm mx-auto">
            Need help with an order, product, or account inquiry? Submit a ticket above or start a live support session.
          </p>
          <div className="mt-4 flex items-center justify-center gap-3">
            <button
              onClick={() => setIsSubmitDialogOpen(true)}
              className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl hover:bg-primary/90 transition-all cursor-pointer"
            >
              Submit a Ticket
            </button>
            {onOpenLiveChat && (
              <button
                onClick={onOpenLiveChat}
                className="px-4 py-2 bg-surface-card border border-border text-foreground text-xs font-bold rounded-xl hover:bg-slate-50 transition-all cursor-pointer"
              >
                Chat with Assistant
              </button>
            )}
          </div>
        </div>
      ) : filteredTickets.length === 0 ? (
        <div className="p-12 text-center border border-dashed border-border rounded-2xl bg-surface-low text-xs text-muted-foreground font-medium">
          No tickets found matching the &quot;{statusFilter}&quot; status filter.
        </div>
      ) : (
        <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
          {filteredTickets.map((ticket) => (
            <div
              key={ticket.id}
              className="bg-surface-card border border-border rounded-2xl p-5 shadow-2xs hover:shadow-md transition-all flex flex-row items-center justify-between gap-4 h-[140px] overflow-hidden"
            >
              <div className="space-y-1.5 flex-grow flex-1 min-w-0 max-w-lg">
                <div className="flex items-center gap-2">
                  <span
                    className={`px-2.5 py-0.5 text-[11px] font-bold rounded-full border ${getStatusStyle(
                      ticket.status
                    )}`}
                  >
                    {ticket.status}
                  </span>
                  <span className="text-[11px] text-muted-foreground font-mono">
                    ID: #{ticket.id.slice(0, 8)}
                  </span>
                </div>

                <h4 className="text-sm font-extrabold text-foreground leading-tight truncate">
                  {ticket.title}
                </h4>

                {ticket.description && (
                  <p className="text-xs text-muted-foreground line-clamp-2 whitespace-pre-line">
                    {ticket.description}
                  </p>
                )}

                <div className="flex items-center gap-4 text-[11px] text-muted-foreground font-medium pt-1">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-primary" />
                    {new Date(ticket.createdAt).toLocaleDateString(undefined, {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                    })}
                  </span>
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3 text-primary" />
                    Agent: {ticket.assignedToName || "Unassigned"}
                  </span>
                </div>
              </div>

              {/* Action Button - only show when ticket is claimed by an agent */}
              {ticket.status === "Claimed" && (
                <Link
                  href={`/support/${ticket.id}`}
                  className="inline-flex items-center gap-1.5 px-4 py-2 bg-primary/10 text-primary hover:bg-primary hover:text-white border border-primary/20 text-xs font-bold rounded-xl transition-all shadow-2xs cursor-pointer shrink-0"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  Message Staff
                </Link>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Ticket Submit Dialog */}
      <TicketSubmitDialog
        isOpen={isSubmitDialogOpen}
        onClose={() => setIsSubmitDialogOpen(false)}
        userId={userId}
        onSuccess={() => {
          loadTickets();
        }}
      />
    </div>
  );
}
