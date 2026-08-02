# Plan: Fix Invalid Date in Ticket Sidebar List and Ticket Components

**File:** `docs/plans/20260803052200-fix-ticket-sidebar-invalid-date-plan.md`  
**Date:** 2026-08-03  
**Status:** In Progress

---

## 1. Problem Statement & Root Cause
In `TicketListSidebar.tsx`, tickets are showing `"Invalid Date"` in the meta row for timestamps.

### Root Causes:
1. **Unset or Null `updatedAt`**: When tickets are newly created in CRM / SentraCX, `updatedAt` may be `null`, `undefined`, or empty string.
2. **Alternative Field Naming**: CRM or backend DTOs may provide timestamps under `createdAt`, `updated_at`, `created_at`, `updatedUtc`, `createdUtc`, or `lastUpdatedAt`.
3. **Unchecked `Date` Construction**: Passing `undefined` or `null` or invalid string into `new Date(...)` results in an Invalid Date (`isNaN(date.getTime()) === true`). When `diffMins` evaluates to `NaN`, comparison guards fail and `date.toLocaleDateString(...)` produces the string `"Invalid Date"`.

---

## 2. Implementation Steps

### Step 1: Update `types/chat.ts`
- Ensure `TicketSummary` includes optional date fields:
  ```ts
  createdAt?: string;
  updatedAt?: string;
  created_at?: string;
  updated_at?: string;
  createdUtc?: string;
  updatedUtc?: string;
  ```

### Step 2: Implement Robust Date Resolution & Formatting in `TicketListSidebar.tsx`
- Implement a helper to extract the most relevant timestamp with full fallback precedence:
  ```ts
  const getTicketDate = (ticket: TicketSummary): string | undefined => {
    const anyTicket = ticket as Record<string, any>;
    return (
      ticket.updatedAt ||
      ticket.createdAt ||
      anyTicket.updated_at ||
      anyTicket.created_at ||
      anyTicket.updatedUtc ||
      anyTicket.createdUtc ||
      anyTicket.lastUpdatedAt
    );
  };
  ```
- Make `formatDate` resilient against empty, null, and malformed date strings:
  - Check for falsy input or `isNaN(date.getTime())` -> return `"Just now"` / `"Recently"`.
  - Handle valid dates gracefully for relative (`Just now`, `5m ago`, `2h ago`, `3d ago`) or absolute date (`Oct 12`).

### Step 3: Audit & Harden Related Ticket Components
- **`ConversationDetailsPanel.tsx`**: Ensure both "Created" and "Last Updated" display safe dates or `"N/A"` without returning `"Invalid Date"`.
- **`ProfileTicketsTab.tsx`**: Ensure date display checks `createdAt || created_at || createdUtc || updatedAt || updated_at` and falls back safely to `"Recently"`.

---

## 3. Verification & Validation Plan
1. **Static Analysis**:
   - Run `npm run lint` in `apps/web-shop`.
   - Run `npx tsc --noEmit` in `apps/web-shop`.
2. **Production Build**:
   - Run `npm run build` in `apps/web-shop` to verify full compilation.
