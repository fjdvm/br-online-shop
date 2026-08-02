# Plan: Remove Assigned/Unassigned Agent Display for Support Tickets (Frontend)

## Objective
Remove the assigned/unassigned agent indicator/badge from customer-facing support ticket components in the frontend (`apps/web-shop`).

## Context & Rationale
Customers do not need to see internal agent assignment details ("Agent: Unassigned", "Agent: <Name>", or "Assigned Agent") on their ticket list, conversation header, sidebar, or details panel. Removing this streamlines customer-facing ticket views.

## Proposed Changes

### 1. `apps/web-shop/src/components/features/profile/ProfileTicketsTab.tsx`
- Remove the `Agent: {ticket.assignedToName || "Unassigned"}` badge element.
- Remove the unused `User` icon import from `lucide-react`.

### 2. `apps/web-shop/src/components/features/chat/ConversationHeader.tsx`
- Remove the `User` icon and `{ticket?.assignedToName || "Unassigned"}` block in the header right section.
- Remove the unused `User` icon import from `lucide-react`.

### 3. `apps/web-shop/src/components/features/chat/ConversationDetailsPanel.tsx`
- Remove the "Assigned Agent" metadata section (`<User /> Assigned Agent` and `{ticket.assignedToName || "Unassigned"}`).
- Remove the unused `User` icon import from `lucide-react`.

### 4. `apps/web-shop/src/components/features/chat/TicketListSidebar.tsx`
- Remove the agent display `ticket.assignedToName` in the conversation item metadata row.
- Remove the unused `User` icon import from `lucide-react`.

## Verification & Testing
1. Verify TypeScript type-checking and ESLint passes across `apps/web-shop`.
2. Ensure UI layouts in `/support`, `/support/[ticketId]`, and customer profile tickets tab look clean and aligned after removing the agent badges.

