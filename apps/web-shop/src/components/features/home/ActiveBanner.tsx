"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { ActiveContent } from "@/types/marketing";

/**
 * A persistent, full-width promotional strip pinned above the homepage content.
 * Optionally dismissible.
 */
export function ActiveBanner({ content }: { content: ActiveContent }) {
  const [dismissed, setDismissed] = useState(false);
  if (dismissed) return null;

  return (
    <div className="w-full relative">
      <div dangerouslySetInnerHTML={{ __html: content.html }} />
      {content.dismissible && (
        <button
          type="button"
          aria-label="Dismiss banner"
          onClick={() => setDismissed(true)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1 z-10"
        >
          <X className="w-4 h-4" />
        </button>
      )}
    </div>
  );
}
