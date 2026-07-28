# Implementation Plan: Profile Layout Update from Design Reference (Clarified)

This plan outlines the changes to align the `ProfilePage.tsx` component with the layout design from `.design-ref/profile_settings/code.html`, keeping the existing web-shop site header/footer intact.

---

## 1. Objectives

1. **Remove Upper Card Container**: Remove the header card that displays the user avatar fallback, name, status, and stats counters (Addresses, Support, Status).
2. **Implement Profile Page Content Layout**:
   - Keep the existing Next.js global layout header and footer (no site nav or footer changes).
   - In the profile page body, add a simple Page Title Header at the top:
     ```tsx
     <div className="flex flex-col gap-2 border-b border-border/40 pb-6">
       <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-foreground">
         Account Settings
       </h1>
       <p className="text-xs md:text-sm text-muted-foreground font-medium">
         Manage your profile, addresses, and track your artisan ube halaya orders.
       </p>
     </div>
     ```
   - Retain the layout grid: Sidebar Navigation on the left (`md:col-span-3`) and active tab panels on the right (`md:col-span-9`).
   - Preserve all hooks, user context, functions, and modals in `ProfilePage.tsx`.

---

## 2. Step-by-Step Implementation

### Step 1: Update `ProfilePage.tsx`
- File: [ProfilePage.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/profile/ProfilePage.tsx)
- Action:
  - Remove imports of `Card`, `Badge`, `Avatar`, `AvatarFallback`, `ShieldCheck`, `MapPin`, `Sparkles`, and `useChat` if no longer used.
  - Remove the minimal header Card component layout (lines 43-89).
  - Insert the clean text-based Page Title Header instead.
  - Ensure the grid layout container uses the classes from the design: `grid grid-cols-1 md:grid-cols-12 gap-6`.

---

## 3. Verification Plan
1. **Visual inspection**: Confirm the site's default navigation header and footer remain unmodified, and only the profile page content changes.
2. **Grid layout alignment**: Check that the sidebar and main tab panel stack correctly on mobile and align side-by-side on desktop.
3. **Build check**: Run workspace builds to ensure no typescript errors are introduced.
