# Implementation Plan: Profile Icons, Side-by-Side Orders & Auth-Hidden Support Icon

This plan outlines the changes to update the profile page navigation layout, sidebar icons, and restrict the visibility of the "Contact Support" icons/navigation links to logged-in users only.

---

## 1. Objectives
1. **Header Support Visibility**:
   - Wrap the `Headphones` support button in the desktop header `Header.tsx` with `{isAuthenticated && (...)` so it is not visible to public (guest) users.
   - Wrap the "Contact Support" link in the mobile drawer in `Header.tsx` with `{isAuthenticated && (...)` as well.
2. **Left Sidebar Card (Sleek corners)**:
   - Create a unified vertical card (`rounded-md` corners) on the left for profile information summary, navigation links (using Lucide `History` icon), and Log Out.
3. **Right Content Card (Scrollable & Sleek corners)**:
   - A wide card on the right (`rounded-md` corners) with vertical scrollability enabled (`max-h-[750px] overflow-y-auto`).
4. **Default Tab**:
   - Automatically display the "Order History" tab contents by default on page load.

---

## 2. Step-by-Step Implementation

### Step 1: Restrict Header Visibility
- File: [Header.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/shared/Header.tsx)
- Action:
  - Add `{isAuthenticated && (...)}` around the Headphones desktop button.
  - Add `{isAuthenticated && (...)}` around the "Contact Support" link inside the mobile drawer menu.

---

## 3. Verification Plan
1. **Compilation Check**: Verify build compiles successfully.
2. **Unauthenticated Header Check**: Verify that when signed out, the Headphones icon does not appear in the desktop header, and "Contact Support" does not appear in the mobile drawer.
3. **Authenticated Header Check**: Verify that when signed in, the Headphones icon is visible and functions properly.
