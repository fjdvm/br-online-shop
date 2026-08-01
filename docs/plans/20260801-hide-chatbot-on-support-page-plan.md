# Plan: Hide SentraCX Floating Chat Bot on Support Pages

## Objective
Do not show the SentraCX support floating chat bot when the user is visiting the support pages (`/support` or `/support/[ticketId]`).

## Implementation Plan
1. **Identify the Chat Component**: The chatbot is rendered using the [`ChatBubble`](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/chat/ChatBubble.tsx) component.
2. **Retrieve Current Path**: Use `usePathname` from `next/navigation` within [`ChatBubble`](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/chat/ChatBubble.tsx).
3. **Conditional Rendering**:
   - Check if the pathname starts with `/support`.
   - If `pathname.startsWith("/support")` evaluates to `true`, return `null` from `ChatBubble` to prevent it from rendering.
4. **Validation**:
   - Ensure the Next.js development server builds successfully without errors.
   - Verify layout files and component imports are unaffected.
