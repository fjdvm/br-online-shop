"use client";

import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { ProfileTicketsTab } from "@/components/features/profile/ProfileTicketsTab";
import { Card } from "@/components/ui/card";
import { Headphones, Loader2 } from "lucide-react";
import { useChat } from "@/hooks/useChat";

export function SupportClientPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toggleOpen: toggleLiveChat } = useChat();

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/signin?callbackUrl=/support");
    }
  }, [status, router]);

  if (status === "loading" || status === "unauthenticated") {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 animate-spin text-primary mb-2" />
        <p className="text-xs text-muted-foreground font-medium">
          Verifying your session, please wait...
        </p>
      </div>
    );
  }

  const userId = session?.user?.id;

  return (
    <div className="max-w-[1000px] mx-auto px-4 sm:px-6 py-10 space-y-8 animate-fade-in">
      {/* Support Header Banner */}
      <Card className="p-6 md:p-8 bg-gradient-to-r from-primary/10 via-purple-50 to-primary/5 border-border/80 rounded-3xl shadow-sm relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-8 -translate-y-8 w-48 h-48 bg-primary/5 rounded-full blur-2xl" />
        <div className="relative z-10 space-y-2">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-xs font-bold">
            <Headphones className="w-3.5 h-3.5" /> Support Portal
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
            How can we help you today?
          </h1>
          <p className="text-xs md:text-sm text-muted-foreground max-w-xl font-medium">
            Submit a support ticket or track your existing requests. Our customer care team and virtual assistant are here to resolve any issues.
          </p>
        </div>
      </Card>

      {/* Standalone Support Tickets Hub */}
      <div className="bg-surface-card border border-border rounded-3xl p-6 md:p-8 shadow-xs">
        <ProfileTicketsTab userId={userId} onOpenLiveChat={toggleLiveChat} />
      </div>
    </div>
  );
}
