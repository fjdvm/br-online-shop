# Plan: Update Polling Interval for Conversation Sidebar

## Objective
Update the polling interval in [`TicketListSidebar.tsx`](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/chat/TicketListSidebar.tsx) from 10 seconds (10,000ms) to 5 seconds (5,000ms) for faster updates in the conversation sidebar.

## Implementation Details
1. Target file: [`apps/web-shop/src/components/features/chat/TicketListSidebar.tsx`](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/chat/TicketListSidebar.tsx)
2. In the `useEffect` polling customer tickets, update:
   - Comment: `// Poll every 5s`
   - Interval duration: `setInterval(() => loadTickets(true), 5000)`

## Validation
1. Verify with ESLint and TypeScript checking.
2. Confirm interval is correctly set to 5000ms.
