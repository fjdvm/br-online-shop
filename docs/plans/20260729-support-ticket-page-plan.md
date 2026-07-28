# Implementation Plan: Standalone Support Portal & Header Support Icon

This plan outlines the updated steps for replacing the header search icon with a contact support icon, building a dedicated `/support` page for authenticated users, and removing the support tab from the profile page.

---

## 1. Design Decisions & User Preferences

1. **Authentication Requirement**: Only authenticated users are allowed to submit tickets. Guests attempting to access `/support` will be redirected to the sign-in page (`/signin?callbackUrl=/support`).
2. **Dedicated Support Page**: We will create a standalone Support portal page at `/support` that lists the user's tickets and allows opening a new one. This will be completely independent of the `/profile` page.
3. **Profile Page Cleanup**: The "Support Tickets" tab will be completely removed from the profile page and the profile sidebar.
4. **Header Icon**: We will change the non-functional `Search` icon to a `Headphones` (contact support) icon that links to `/support`.

---

## 2. Step-by-Step Implementation

### Step 1: Update the Header
- File: [Header.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/shared/Header.tsx)
- Action:
  - Replace the non-functional search button with a `Link` containing the `Headphones` icon.
  - In the mobile sidebar drawer navigation, add a clear "Contact Support" button/link.

### Step 2: Remove Support Tickets Tab from Profile
- File: [ProfileSidebar.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/profile/ProfileSidebar.tsx)
  - Remove the "Support Tickets" item from the `tabs` array.
- File: [ProfilePage.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/profile/ProfilePage.tsx)
  - Remove the `activeTab === "tickets"` rendering block.
- File: [useProfilePage.ts](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/hooks/useProfilePage.ts)
  - Remove `"tickets"` from the `TabType` union definition.

### Step 3: Refactor Ticket Submission to Redirect
- File: [TicketSubmitDialog.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/profile/TicketSubmitDialog.tsx)
  - Update `TicketSubmitDialogProps` onSuccess callback to receive the newly created ticket ID: `onSuccess: (ticketId: string) => void`.
  - Pass the returned ticket ID (`res.id`) when calling `onSuccess`.
- File: [ProfileTicketsTab.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/profile/ProfileTicketsTab.tsx)
  - Update the `onSuccess` handler of `TicketSubmitDialog` in the dashboard component to redirect the user directly to `/support/${newTicketId}` on successful ticket submission.

### Step 4: Create the Dedicated `/support` Route
- File: Create `apps/web-shop/src/app/support/page.tsx`
- Action:
  - Use `useSession` from `next-auth/react`.
  - If the user is not logged in/authenticating, perform a client-side redirect using `router.push("/signin?callbackUrl=/support")`.
  - If authenticated, render a gorgeous standalone Support Hub dashboard:
    - Welcome header with brand colors and styling.
    - Render the tickets listing dashboard and the "Open New Ticket" button/dialog.

### Step 5: Update Ticket Conversation Navigation
- File: [ConversationPage.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/chat/ConversationPage.tsx)
  - Update the breadcrumb back button:
    ```diff
    - <Link href="/profile">Back to Profile</Link>
    + <Link href="/support">Back to Support</Link>
    ```

### Step 6: Update Backlog
- File: [backlogs.md](file:///home/friedrich/workspace/monorepo/br-online-shop/docs/specs/backlogs.md)
  - Mark corresponding items under Epic 5 as complete or updated.

---

## 3. Verification & Testing Plan
1. **Unauthenticated access check**: Try visiting `/support` as a guest; verify it redirects to `/signin?callbackUrl=/support`.
2. **Header icon check**: Verify the Headphones icon is present in the header, links to `/support`, and works.
3. **Mobile menu check**: Verify "Contact Support" is present in the mobile drawer.
4. **Profile page cleanup check**: Verify that "Support Tickets" tab no longer appears in the profile sidebar or the profile page content.
5. **Create Ticket Flow**: Create a support ticket, verify that it successfully creates the ticket, and immediately redirects the user to `/support/[ticketId]`.
6. **Chat and Back navigation**: On the conversation page, verify that the "Back to Support" link correctly takes the user back to the new `/support` page.
