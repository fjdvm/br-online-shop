"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ActiveContent } from "@/types/marketing";

/**
 * A centered, dismissible modal overlay shown over the homepage when a Popup
 * campaign is active.
 */
export function ActivePopup({ content }: { content: ActiveContent }) {
  const [open, setOpen] = useState(true);
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4"
      role="dialog"
      aria-modal="true"
    >
      <div className="relative max-w-md w-full">
        <button
          type="button"
          aria-label="Close popup"
          onClick={() => setOpen(false)}
          className="absolute top-3 right-3 z-10 text-muted-foreground hover:text-foreground p-1 bg-background/80 rounded-full"
        >
          <X className="w-5 h-5" />
        </button>
        <div dangerouslySetInnerHTML={{ __html: content.html }} />
      </div>
    </div>
  );
}
