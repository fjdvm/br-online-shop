# Plan: Real-Time Ticket Sidebar and Page Update on Status Changes (Unclaimed, Completed, Cancelled)

## Objective
Ensure that when a support ticket's status becomes **Unclaimed**, **Completed**, or **Cancelled/Canceled**:
1. The ticket is immediately removed from the Conversations sidebar list (`TicketListSidebar`).
2. The page refreshes / navigates the user back to the support portal (`/support`) in real-time if they are currently viewing that ticket's conversation page (`/support/[ticketId]`).
3. Status changes update in real time via SignalR push events and window event broadcasting across components.

## Background & Current Behavior
- `TicketListSidebar.tsx` currently includes `t.id === activeTicketId` in its filter condition (`((t.status === "Claimed" || t.status === "Ongoing") && t.hasStaffReplied) || t.id === activeTicketId`). As a result, an inactive ticket (Unclaimed, Completed, or Cancelled) remains visible in the sidebar if it is the currently open ticket.
- `ConversationPage.tsx` updates local ticket state when SignalR fires `TicketStatusChanged`, but it stays on the conversation page instead of refreshing/redirecting back to `/support` when the ticket is no longer in an active chat state (Unclaimed, Completed, Cancelled).
- `useChatSignalR.ts` receives `TicketStatusChanged` over the WebSocket connection, but does not broadcast the event to other parts of the UI (such as the sidebar or profile tickets list).

## Proposed Changes

### 1. `apps/web-shop/src/hooks/useChatSignalR.ts`
- In `connection.on("TicketStatusChanged")`, dispatch a custom browser event `window.dispatchEvent(new CustomEvent("ticket-status-changed", { detail: payload }))` so that any mounted component (sidebar, tabs, pages) can react immediately to real-time status changes.

### 2. `apps/web-shop/src/components/features/chat/TicketListSidebar.tsx`
- Update filter logic to strictly exclude any ticket that is **Unclaimed**, **Completed**, or **Canceled/Cancelled**:
  - Only show tickets where `(status === "Claimed" || status === "Ongoing") && hasStaffReplied === true`.
  - Remove `t.id === activeTicketId` fallback that was keeping inactive tickets in the list.
- Add an event listener for `"ticket-status-changed"` and `"ticket-updated"` window events to immediately trigger `loadTickets(true)` without waiting for the 5-second polling tick.

### 3. `apps/web-shop/src/components/features/chat/ConversationPage.tsx`
- **Initial load check**: If the fetched ticket is in an inactive state (`Unclaimed`, `Completed`, or `Canceled/Cancelled`), redirect immediately to `/support` and trigger `router.refresh()`.
- **Real-time SignalR status change**: When `handleTicketStatusChanged` receives a status update for the current `ticketId` where status is `Unclaimed`, `Completed`, or `Canceled/Cancelled`:
  - Dispatch `"ticket-status-changed"` event to update sidebar.
  - Redirect the user to `/support` (via `router.push("/support")` and `router.refresh()`).
- **Ticket cancellation**: In `handleCancelTicket`, dispatch the status change / update event and navigate to `/support`.

### 4. `apps/web-shop/src/components/features/profile/ProfileTicketsTab.tsx`
- Add an event listener for `"ticket-status-changed"` to immediately refresh customer tickets in real-time when CRM staff modifies status.

## Verification & Testing
1. **Sidebar Filter Verification**: Ensure `TicketListSidebar` only displays `Claimed`/`Ongoing` tickets with staff replies. Verify that tickets in `Unclaimed`, `Completed`, or `Canceled` states do not appear in the sidebar under any circumstance.
2. **Real-time Status Change Flow**:
   - Open a claimed ticket conversation at `/support/[ticketId]`.
   - When the ticket is unclaimed, marked completed, or cancelled, verify that:
     a) SignalR receives the `TicketStatusChanged` event.
     b) The conversation page redirects / refreshes to `/support`.
     c) The ticket disappears from the sidebar list in real time.
3. **Customer Cancellation Flow**:
   - Click "Cancel Ticket" modal inside conversation header.
   - Confirm cancellation.
   - Verify modal closes, page redirects to `/support`, and ticket is removed from the sidebar.
4. **Code Quality & Lint**:
   - Run ESLint and TypeScript checks to ensure no errors or warnings are introduced.
