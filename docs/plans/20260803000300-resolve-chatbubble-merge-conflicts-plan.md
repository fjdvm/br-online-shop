# Implementation Plan: Resolve ChatBubble Merge Conflict

This plan outlines the steps to resolve the merge conflict in `ChatBubble.tsx` after merging `origin/main`.

---

## 1. Objectives
- Keep the `isOnConversationPage` logic from our local branch `fix/conversation-messages-persistence` to prevent duplicate SignalR connections on support ticket detail pages (`/support/:ticketId`).
- Resolve git merge conflict markers in `ChatBubble.tsx`.

---

## 2. Step-by-Step Implementation

### Step 1: Update ChatBubble.tsx
- File: [ChatBubble.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/chat/ChatBubble.tsx)
- Action:
  - Keep the declaration of `isOnConversationPage` and its usage as the third parameter in `useChat`.
  - Remove all conflict markers.

---

## 3. Verification Plan
1. **Lint Check**: Run `pnpm --filter web-shop lint` to ensure that ESLint/TypeScript compilation still pass.
2. **Build Check**: Verify that the project builds successfully.
