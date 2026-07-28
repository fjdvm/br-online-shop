"use client";

import { User, MapPin, History, LogOut } from "lucide-react";
import { signOut } from "next-auth/react";
import type { TabType } from "@/hooks/useProfilePage";
import type { UserDto } from "@/types/auth";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

interface ProfileSidebarProps {
  activeTab: TabType;
  onTabChange: (tab: TabType) => void;
  user: UserDto | null;
}

export function ProfileSidebar({ activeTab, onTabChange, user }: ProfileSidebarProps) {
  const tabs = [
    { id: "personal" as TabType, label: "Personal Info", icon: User },
    { id: "addresses" as TabType, label: "Saved Addresses", icon: MapPin },
    { id: "orders" as TabType, label: "Order History", icon: History },
  ];

  const userInitial = user?.fullName ? user.fullName.charAt(0).toUpperCase() : "U";

  return (
    <div className="w-full">
      <nav className="flex flex-col gap-1 bg-surface-card p-4 rounded-md border border-border shadow-sm">
        {/* User Summary Block */}
        <div className="flex flex-col items-center text-center pb-5 mb-4 border-b border-border/70">
          <Avatar className="w-16 h-16 border-2 border-primary/20 text-xl font-bold bg-primary/10 text-primary mb-3">
            <AvatarFallback>{userInitial}</AvatarFallback>
          </Avatar>
          <h3 className="font-extrabold text-sm text-foreground leading-tight">
            {user?.fullName || "Valued Customer"}
          </h3>
          <p className="text-xs text-muted-foreground mt-1 break-all font-medium">
            {user?.email}
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="space-y-1.5">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange(tab.id)}
                className={`w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md text-xs font-bold transition-all cursor-pointer ${
                  isActive
                    ? "bg-primary text-white shadow-xs"
                    : "text-muted-foreground hover:text-foreground hover:bg-surface-low"
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sign Out Section */}
        <div className="pt-4 mt-4 border-t border-border w-full">
          <button
            onClick={() => signOut({ callbackUrl: "/signin" })}
            className="w-full flex items-center gap-2.5 px-4 py-2.5 rounded-md text-xs font-bold text-destructive hover:bg-destructive/10 transition-all cursor-pointer"
          >
            <LogOut className="w-4 h-4 shrink-0" />
            <span>Sign Out</span>
          </button>
        </div>
      </nav>
    </div>
  );
}
