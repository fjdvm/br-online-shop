# Implementation Plan: Fix useChatSignalR Hook Lint and TS Scope Errors

This plan outlines the steps to resolve:
1. The TypeScript error where `fetchMessages` is accessed within its own initializer before it is declared.
2. The ESLint warning regarding calling `setState` (i.e. `setMessagesError(null)`) synchronously within the body of a `useEffect`.

---

## 1. Objectives
- Ensure `fetchMessages` can recursively schedule retries without triggering temporal dead zone (TDZ) or initialization/declaration order errors in TypeScript.
- Eliminate the synchronous `setMessagesError` call within the SignalR connection `useEffect` to prevent cascading render lint errors.

---

## 2. Step-by-Step Implementation

### Step 1: Use Named Function Expression for Recursion in `useCallback`
- File: [useChatSignalR.ts](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/hooks/useChatSignalR.ts)
- Action:
  - Name the inner function within the `useCallback` block: `async function fetchMessagesFn(activeTicketId: string, attempt = 0)`.
  - Update the self-referencing `setTimeout` calls inside the function to call `fetchMessagesFn` instead of `fetchMessages`.
  - Add clearing of the error state (`setMessagesError(null)`) inside `fetchMessagesFn` when `attempt === 0`, shifting the responsibility of initializing the state out of the effect body.

### Step 2: Remove Synchronous State Setting from Connection Effect
- File: [useChatSignalR.ts](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/hooks/useChatSignalR.ts)
- Action:
  - Remove `setMessagesError(null)` from the synchronous body of the connection `useEffect`. It is now handled inside `fetchMessages` when the fetch starts.

---

## 3. Verification Plan
1. **Lint Check**: Run `pnpm --filter web-shop lint` to ensure that ESLint and TypeScript compilation pass without error.
2. **Build Check**: Verify that the project builds successfully by running `pnpm --filter web-shop build`.
