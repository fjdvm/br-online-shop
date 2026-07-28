# E-Commerce Website — Project Backlog

**Stack:** .NET Web API (backend) · Next.js + Tailwind + shadcn/ui (frontend)

Organized as Epics → User Stories → Tasks (Backend / Frontend split). Priority: P0 = MVP-critical, P1 = important, P2 = nice-to-have.

---

## EPIC 0: Monorepo Structure & Tooling (P0)

**0.1 Repository layout**

- [x] Create root repo with the following top-level structure:
  ```
  /repo-root
    /apps
      /api-oos          → .NET Web API solution
      /web-shop         → Next.js frontend app (online shop)
      /web-oos          → Next.js frontend app (order & operations system)
    /packages
      /shared-types → shared TypeScript types/interfaces (e.g., DTOs mirrored from backend)
      /ui           → (optional, P2) shared shadcn/ui component wrappers if ever split into multiple frontends
      /config       → shared eslint/prettier/tsconfig base configs
    /docs           → architecture docs, API contracts, ADRs
    /scripts        → dev/setup/deploy helper scripts
    /.github
      /workflows    → CI/CD pipeline definitions
    docker-compose.yml
    .editorconfig
    .gitignore
    README.md
    LICENSE.md
  ```
- [x] Decide and document naming convention for `apps/api` vs `apps/web` folders
- [x] Add root `README.md` with setup instructions for both apps (prereqs: .NET SDK version, Node version, package manager)

**0.2 Root-level tooling**

- [x] Add root `.gitignore` covering both .NET (`bin/`, `obj/`) and Node (`node_modules/`, `.next/`) artifacts
- [x] Add `.editorconfig` for consistent formatting across C# and TS/TSX files
- [x] Set up root `package.json` with workspaces (npm/pnpm/yarn workspaces) scoped to `apps/web` and `packages/*` only (the .NET API is not part of the JS workspace, just lives alongside it)
- [x] Evaluate and decide: plain npm/pnpm workspaces vs. Turborepo/Nx for the frontend side (Turborepo recommended if repo will grow — enables cached builds/lint/test across `apps/web` and `packages/*`)
- [x] If Turborepo chosen: add `turbo.json` with pipeline definitions (`build`, `lint`, `dev`, `test`)
- [x] Configure root scripts to run backend and frontend concurrently in dev (e.g., `concurrently` or a `Makefile`/shell script: `dev:api`, `dev:web`, `dev` = both)

**0.3 Local development environment**

- [x] Create `docker-compose.yml` for local dependencies (SQL Server/PostgreSQL, and optionally the API + web if containerized)
- [x] Add `.env.example` files for both `apps/api` and `apps/web` documenting required environment variables
- [x] Document local setup steps in README: clone → install deps → copy env files → run DB migrations → `npm run dev` / `dotnet run`

**0.4 Shared type/contract strategy**

- [x] Decide approach for keeping frontend types in sync with backend DTOs:
  - Option A: Manually maintained TypeScript interfaces in `packages/shared-types`
  - Option B: Auto-generate TS types from OpenAPI/Swagger spec (e.g., `openapi-typescript`) as part of build/CI
- [x] Set up chosen approach and document the workflow for updating types when backend DTOs change

**0.5 CI/CD pipeline structure**

- [x] Set up path-based CI triggers so backend changes only run backend pipeline and frontend changes only run frontend pipeline (avoids unnecessary builds)
- [x] `.github/workflows/api-ci.yml` — restore, build, test .NET solution
- [x] `.github/workflows/web-ci.yml` — install, lint, type-check, build Next.js app
- [x] Add branch protection rules requiring CI pass before merge to `main`

**0.6 Code ownership & contribution rules**

- [x] Add `CODEOWNERS` file mapping `/apps/api` and `/apps/web` to relevant reviewers
- [x] Add root `CONTRIBUTING.md` with branch naming convention, commit message convention (e.g., Conventional Commits), and PR template
- [x] Add PR template (`.github/PULL_REQUEST_TEMPLATE.md`)

---

## EPIC 1: Project Setup & Infrastructure (P0)

**1.1 Backend project scaffolding**

- [x] Create .NET Web API solution (ASP.NET Core)
- [x] Set up project structure (Controllers, Services, Repositories, DTOs, Models, Middleware)
- [x] Configure Entity Framework Core + connection to SQL Server/PostgreSQL
- [x] Set up dependency injection container
- [x] Configure CORS policy for Next.js frontend origin
- [x] Set up Serilog or built-in logging
- [x] Configure environment-based appsettings (Development/Staging/Production)
- [x] Set up global exception handling middleware
- [x] Set up API versioning
- [x] Configure Swagger/OpenAPI documentation

**1.2 Frontend project scaffolding**

- [x] Create Next.js 14+ project (App Router)
- [x] Install and configure Tailwind CSS
- [x] Install and configure shadcn/ui (init, components.json, theme tokens)
- [x] Set up folder structure (app/, components/, lib/, hooks/, types/, services/)
- [x] Configure ESLint + Prettier
- [x] Set up environment variables (.env.local, API base URL)
- [x] Configure Axios or fetch wrapper for API calls
- [x] Set up global layout (header, footer, providers)
- [x] Configure brand color palette in tailwind.config + shadcn theme (from logo)
- [x] Add logo asset and favicon

**1.3 DevOps / shared setup**

- [x] Set up Git repo + branching strategy (main/dev/feature branches)
- [x] Set up CI pipeline (build + lint checks) for both projects
- [x] Set up database migrations workflow
- [x] Decide hosting (e.g., Azure App Service / backend, Vercel / frontend)
- [x] Set up basic error monitoring (e.g., Sentry) for both apps

---

## EPIC 2: Authentication & User Accounts (P0)

**2.1 User registration (Signup)**

- [x] Backend: `POST /api/auth/register` — validate email uniqueness, hash password (BCrypt/Identity)
- [x] Backend: Email format & password strength validation
- [ ] Backend: Send verification email (optional P1)
- [x] Frontend: Signup page UI (shadcn Form, Input, Button, Checkbox for ToS)
- [x] Backend: Client-side validation (Zod + react-hook-form)
- [x] Frontend: Handle API errors (email taken, weak password)

**2.2 User login**

- [x] Backend: `POST /api/auth/login` — validate credentials, issue JWT (access + refresh token)
- [x] Backend: Implement refresh token endpoint `POST /api/auth/refresh`
- [x] Backend: Implement ASP.NET Core Identity or custom auth service
- [x] Frontend: Login page UI
- [x] Frontend: Store tokens securely (httpOnly cookie preferred over localStorage)
- [x] Frontend: Auth context/provider + protected route middleware

**2.3 Forgot / reset password**

- [x] Backend: `POST /api/auth/forgot-password` — generate reset token, send email
- [x] Backend: `POST /api/auth/reset-password` — validate token, update password
- [x] Frontend: Forgot password page (email input)
- [x] Frontend: Reset password page (new password + confirm)

**2.4 Profile settings**

- [x] Backend: `GET /api/users/me`, `PUT /api/users/me` — update name, email, phone, avatar
- [x] Backend: `PUT /api/users/me/password` — change password (requires current password)
- [x] Backend: Manage saved addresses (`GET/POST/PUT/DELETE /api/users/me/addresses`)
- [ ] Backend: Manage saved payment methods (tokenized, via payment provider vault) (Deferred)
- [x] Frontend: Profile page with tabbed sections (shadcn Tabs): Personal Info, Addresses, Payment Methods, Order History
- [x] Frontend: Avatar upload component
- [x] Frontend: Address form (add/edit/delete, set default)

**2.5 Logout & session handling**

- [x] Backend: Token invalidation / refresh token revocation endpoint
- [x] Frontend: Logout action clears auth state + redirects

---

## EPIC 3: Product Catalog (P0)

**3.1 Product data model**

- [x] Backend: Product entity (id, name, description, price, images[], stock, category, SKU, active status)
- [x] Backend: Database seed script for 4–10 initial products
- [x] Backend: `GET /api/products` — list all products (with pagination-ready structure even if small)
- [x] Backend: `GET /api/products/{id}` — single product detail
- [x] Backend: (P1) `GET /api/products?category=&sort=&search=` — filter/sort/search support

**3.2 Landing page**

- [x] Frontend: Hero section component
- [x] Frontend: Featured products section (shadcn Card grid)
- [x] Frontend: Testimonials/trust badges section
- [x] Frontend: Newsletter signup form (P1 — connect to backend or 3rd party like Mailchimp)

**3.3 Product catalog page**

- [x] Frontend: Product grid page using shadcn Card components
- [x] Frontend: (P1) Sort/filter UI bar
- [x] Frontend: Loading skeletons (shadcn Skeleton) while fetching

**3.4 Product detail page**

- [x] Frontend: Image gallery component (carousel or thumbnail switcher)
- [x] Frontend: Quantity selector
- [x] Frontend: Add to Cart button with stock validation
- [x] Frontend: Related products section
- [x] Backend: Stock/inventory check endpoint before add-to-cart confirmation

---

## EPIC 4: Cart & Checkout (P0)

**4.1 Shopping cart**

- [x] Backend: Decide cart strategy — server-persisted cart (`Cart`, `CartItem` tables tied to user or session/guest ID) vs. client-only cart with server validation at checkout. Recommend server-persisted for logged-in users, local state for guests.
- [x] Backend: `GET /api/cart`, `POST /api/cart/items`, `PUT /api/cart/items/{id}`, `DELETE /api/cart/items/{id}`
- [x] Frontend: Cart state management (Zustand/Context) synced with backend when logged in
- [x] Frontend: Cart drawer/sheet (shadcn Sheet component) accessible from header
- [x] Frontend: Cart page — item list, qty controls, remove, subtotal
- [x] Frontend: Empty cart state design
- [x] Frontend: Cart item count badge on header icon

**4.2 Checkout flow**

- [x] Backend: `POST /api/orders/checkout` — validate cart, calculate totals (subtotal, tax, shipping)
- [x] Backend: Address validation logic
- [x] Frontend: Step 1 — Shipping info form (or select saved address)
- [x] Frontend: Step 2 — Order review screen
- [x] Frontend: Multi-step checkout UI with progress indicator (shadcn Tabs or custom stepper)

**4.3 Payment integration**

- [x] Backend: Integrate payment provider (Cash on Delivery & Mock Payment) — create payment record & transaction
- [x] Backend: Confirm payment status on order creation
- [x] Backend: Store transaction records (`Payment` entity: order id, status, provider ref)
- [x] Frontend: Payment form UI (Cash on Delivery & Mock Credit Card options styled to match inputs)
- [x] Frontend: Handle payment errors & confirmation
- [x] Frontend: Trust/security badges near payment form

**4.4 Order confirmation & history**

- [x] Backend: `POST /api/orders` — create order record after successful checkout
- [x] Backend: `GET /api/orders` (user's orders), `GET /api/orders/{id}`
- [x] Backend: Order status enum (Pending, Processing, Shipped, Delivered, Cancelled)
- [x] Backend: Send order confirmation logging
- [x] Frontend: Order confirmation page (order number, summary, estimated delivery)
- [x] Frontend: Order history list in profile (status badges)
- [x] Frontend: Order detail view page


---

## EPIC 5: Customer Support (P1)

**5.1 Standalone support portal**
- [x] Frontend: Dedicated standalone support portal page (`/support`) with ticket creation and dashboard — P1

**5.2 Live chat widget**

- [x] Decide approach: (a) build custom chat with SignalR (.NET) for real-time messaging, integrated with SentraCX CRM.
- [x] Backend (if custom): SignalR hub for chat (in SentraCX api-crm) + support webhook ticket relay in api-oos
- [x] Backend (if custom): Basic auto-responder / FAQ bot logic (integrated with SentraCX AI Analytics)
- [x] Frontend: Floating chat bubble component (fixed position)
- [x] Frontend: Chat panel UI — message bubbles, input, status
- [x] Frontend: Unread message indicator

**5.2 Contact page**

- [x] Backend: `POST /api/contact` — store/forward message via Brevo SMTP
- [x] Frontend: Contact form — name, email, subject, message
- [x] Frontend: Company details + map embed

**5.3 FAQ page**

- [x] Backend: (P2) FAQ entity if content needs to be dynamic/CMS-editable; otherwise hardcode in frontend
- [x] Frontend: Accordion-based FAQ UI, grouped by category

**5.4 Product reviews & ratings**

- [x] Backend: `GET /api/reviews?productId=` — fetch all reviews for a product
- [x] Backend: `POST /api/reviews` — submit a review (auth required, 1–5 stars, max 500 chars, one review per user per product)
- [x] Frontend: Average star rating display on product detail page
- [x] Frontend: Reviews list — star rating, comment, date
- [x] Frontend: Submit review form (star selector + textarea + validation)

---

## EPIC 6: Careers / Application Page (P1)

**6.1 Job application system**

- [x] Backend: `JobPosting` entity (title, description, active status) — optional if positions are static
- [x] Backend: `POST /api/applications` — submit application (name, email, phone, position, resume file, cover letter)
- [x] Backend: File upload handling for resume (store in Azure Blob/S3, validate file type/size)
- [x] Backend: Notification email to HR/company on new application
- [x] Frontend: Careers page listing open positions
- [x] Frontend: Application form with resume upload (shadcn Input type=file + progress indicator)
- [x] Frontend: Submission success confirmation

---

## EPIC 7: Static & Legal Pages (P1)

- [x] Frontend: About Us page (static content)
- [x] Frontend: Terms of Service page
- [x] Frontend: Privacy Policy page
- [x] Frontend: Return & Refund Policy page
- [x] Frontend: 404 Not Found page
- [ ] Backend: (Optional) CMS-lite endpoint if legal content should be editable without redeploy

---

## EPIC 8: Global UI/UX & Cross-Cutting Concerns (P0–P1)

- [x] Frontend: Sticky header (logo, nav, support icon, cart icon w/ badge, account icon) — P0
- [x] Frontend: Footer (links, social icons, newsletter, copyright) — P0
- [x] Frontend: Toast notification system (shadcn Toast/Sonner) for cart/order/form actions — P0
- [x] Frontend: Global loading states (skeletons) and error boundaries — P0
- [x] Frontend: Responsive breakpoints audit across all pages (mobile/tablet/desktop) — P0
- [x] Frontend: Hamburger nav menu for mobile — P0
- [x] Backend: Rate limiting on auth/contact/application endpoints — P1
- [x] Backend: Input validation (FluentValidation) across all endpoints — P0
- [x] Backend: API response standardization (consistent envelope, error format) — P0
- [x] Both: Accessibility pass (WCAG AA contrast, keyboard nav, alt text) — P1
- [x] Both: SEO basics (meta tags, sitemap, robots.txt, Open Graph tags) — P1

---

## EPIC 9: Testing & QA (P1)

- [ ] Backend: Unit tests for services (xUnit/NUnit)
- [ ] Backend: Integration tests for critical endpoints (auth, checkout, orders)
- [ ] Frontend: Component tests (Jest/React Testing Library) for cart, forms
- [ ] Frontend: E2E tests for critical flows (Playwright/Cypress) — signup → browse → cart → checkout
- [ ] Manual QA pass on mobile devices/browsers

---

## EPIC 10: Deployment & Launch (P0)

- [ ] Set up production database + run migrations
- [ ] Configure production environment variables/secrets (API keys, JWT secret, payment keys)
- [ ] Deploy backend (Azure App Service / AWS / etc.)
- [ ] Deploy frontend (Vercel or similar)
- [ ] Configure custom domain + SSL
- [ ] Set up backups for database
- [ ] Final cross-browser/device smoke test
- [ ] Soft launch / go live

---

## Suggested Sprint Grouping (if working in 2-week sprints)

| Sprint | Focus                                                                      |
| ------ | -------------------------------------------------------------------------- |
| 1      | Epic 0 (monorepo structure), Epic 1 (setup), Epic 2.1–2.2 (register/login) |
| 2      | Epic 2.3–2.5 (profile, password), Epic 3.1–3.2 (product data, landing)     |
| 3      | Epic 3.3–3.4 (catalog, product detail), Epic 4.1 (cart)                    |
| 4      | Epic 4.2–4.3 (checkout, payment)                                           |
| 5      | Epic 4.4 (orders), Epic 8 (global UI polish)                               |
| 6      | Epic 5 (support/FAQ/contact), Epic 6 (careers)                             |
| 7      | Epic 7 (legal pages), Epic 9 (testing)                                     |
| 8      | Epic 10 (deployment), bug fixes, buffer                                    |

_(Adjust based on team size — this assumes 1–2 full-stack devs.)_
