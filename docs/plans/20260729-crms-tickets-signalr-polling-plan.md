# Implementation Plan: Standalone Support Portal Polling, Filter Tabs, OOS Module Switcher & SignalR Real-Time CRM Tickets

This plan outlines the design and implementation details to:
1. Enable status filtering tabs/dropdown and 10-second polling on the `web-shop` support page.
2. Build an active system switcher inside the OOS (`web-oos`) sidebar to allow switching between the E-Commerce Storefront and CRM modules.
3. Configure a SignalR Hub in the backend (`api-oos`) to broadcast ticket creation events.
4. Build the CRM Tickets Module page in `web-oos` (`/tickets`) that listens to the SignalR Hub and appends new tickets in real-time.

---

## 1. Web-Shop: Support Portal Status Filters & Polling

### A. Polling every 10 seconds
- File: [ProfileTicketsTab.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-shop/src/components/features/profile/ProfileTicketsTab.tsx)
- Action:
  - Add an effect hook that establishes a 10-second `setInterval` interval calling `loadTickets()`.
  - Clean up the interval on unmount.
  - Implement a silent polling trigger (fetch without setting `isLoading(true)` to avoid screen flashing).

### B. Status Filter Tabs
- Action:
  - Add a state `statusFilter` (with values: `"All"`, `"Unclaimed"`, `"Ongoing"`, `"Completed"`, `"Canceled"`).
  - Render a horizontal button group/tab bar above the tickets list.
  - Filter the rendered `tickets` array based on `statusFilter`.

---

## 2. API-OOS: Backend SignalR Tickets Hub

### A. Define Hub Class
- File: Create `Hubs/TicketsHub.cs` in `apps/api-oos`
- Code:
  ```csharp
  using Microsoft.AspNetCore.SignalR;
  namespace ApiOos.Hubs
  {
      public class TicketsHub : Hub {}
  }
  ```

### B. Register and Map Hub
- File: [Program.cs](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/api-oos/Program.cs)
- Action:
  - Add `builder.Services.AddSignalR();`
  - Map hub: `app.MapHub<TicketsHub>("/hubs/tickets");`

### C. Broadcast on Ticket Creation
- File: [TicketsController.cs](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/api-oos/Controllers/TicketsController.cs)
- Action:
  - Inject `IHubContext<TicketsHub> _hubContext` via constructor.
  - In `CreateTicket` endpoint, after successful proxy creation, broadcast the newly created ticket JSON string to all clients:
    ```csharp
    await _hubContext.Clients.All.SendAsync("TicketCreated", json);
    ```

---

## 3. Web-OOS: Enterprise Module Switcher & CRM Tickets Page

### A. Sidebar Enterprise Switcher
- File: [Sidebar.tsx](file:///home/friedrich/workspace/monorepo/br-online-shop/apps/web-oos/src/components/shared/Sidebar.tsx)
- Action:
  - Add `activeSystem` state backed by `localStorage` (defaulting to `"E-Commerce Storefront"`).
  - Update dropdown options to call `setActiveSystem(sys.fullName)` when clicked.
  - Conditionally define navigation links:
    - If `Customer Relationship Management`, show navigation items: Dashboard (`/`), Tickets (`/tickets`), and Customers (`/customers`).
    - If `E-Commerce Storefront`, show default navigation list.
  - Update the module name badge to display `"CRM"` when CRM is selected.

### B. CRM Tickets Page
- File: Create `apps/web-oos/src/app/tickets/page.tsx`
- Action:
  - Fetch all tickets on load from backend endpoint: `GET http://localhost:5004/api/tickets`.
  - Connect to the backend SignalR hub at `http://localhost:5004/hubs/tickets`.
  - Listen for the `"TicketCreated"` event.
  - When a `"TicketCreated"` event is received:
    - Parse the payload.
    - Prepend the new ticket to the tickets list in state in real-time.
    - Show a real-time notification toast (using `sonner`).

---

## 4. Verification Plan
1. **Verification of compilation**: Run `pnpm build` across both web-shop, web-oos, and api-oos.
2. **CORS credentials validation**: Verify that SignalR connection can handshake and establish web socket connection without CORS issues.
3. **Tickets Page loading**: Verify `/tickets` in OOS lists existing tickets.
4. **Real-time test**:
   - Open OOS `/tickets` page.
   - Open Web-Shop `/support` page and submit a new ticket.
   - Verify that OOS `/tickets` page updates with the new ticket instantly in real-time via SignalR, accompanied by a toast.
   - Verify that Web-Shop `/support` page correctly polls every 10 seconds.
