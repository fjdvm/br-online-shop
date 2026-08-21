# OOS recent-orders sync contract

## Goal
Unblock SentraCX issues #44 and #45 by exposing a service-authorized OOS endpoint that returns recent orders for every customer, including the customer identifier needed for CRM analytics ingestion.

## Contract
`GET /api/orders/sync?since=<UTC ISO-8601>` is restricted to the CRM service. It returns orders created or updated on/after `since`, newest first. Every record includes the existing order snapshot fields plus `customerId` (the OOS user ID) and `updatedAt`.

The existing authenticated customer endpoints remain unchanged and continue to scope results to the caller.

## Implementation slices
1. Add a red service-level test proving recent orders are filtered by the watermark and retain their customer IDs.
2. Add repository/service methods and a dedicated sync DTO, then make the focused OOS test pass.
3. Add an authorization policy for the configured CRM service token and expose the sync route through the controller.
4. Update CRM's client request/DTO and ingestion tests to use the dedicated sync endpoint and watermark.
5. Repoint web-crm's unchanged `aiClient` API surface to api-crm, test its base URL behavior, remove the Python service, and clean scripts/config/CI/docs/agent guidance.
6. Run focused tests after each slice, then type/build and full relevant suites; review and commit the focused changes.

## Validation seams
- OOS `IOrderService.GetOrdersForAnalyticsSyncAsync` verifies filtering and customer attribution.
- CRM `IOosOrdersClient.GetOrdersAsync` verifies the exact HTTP route/query and the decoded contract.
- CRM `IOrderIngestionService.SyncAsync` verifies that the returned snapshots are persisted.
- web-crm `aiClient` verifies its stable public calls target api-crm's configured base URL.
