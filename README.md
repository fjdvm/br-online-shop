<div align="center">

# Bren Raphael's Ube Jam & Halaya Shop

> Premium Artisanal E-Commerce Platform & Order Management System built with .NET 10 & Next.js 16

[![.NET 10](https://img.shields.io/badge/.NET-10.0-512BD4?logo=dotnet&logoColor=white)](https://dotnet.microsoft.com/)
[![Next.js 16](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=black)](https://react.dev/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS v4](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![pnpm](https://img.shields.io/badge/pnpm-v9-F69220?logo=pnpm&logoColor=white)](https://pnpm.io/)
[![Turborepo](https://img.shields.io/badge/Turborepo-v2-EF4444?logo=turborepo&logoColor=white)](https://turbo.build/)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE.md)

</div>

---

## Table of Contents
- [Overview](#overview)
- [Repository Layout](#repository-layout)
- [Prerequisites](#prerequisites)
- [Installation Guide](#installation-guide)
- [Development Guide](#development-guide)
  - [1. Infrastructure Services](#1-infrastructure-services)
  - [2. Environment Configuration](#2-environment-configuration)
  - [3. Running Development Servers](#3-running-development-servers)
- [Verification & Tooling](#verification--tooling)
- [Architecture & Governance](#architecture--governance)
- [License](#license)

---

## Overview

The **`br-online-shop`** repository is structured as a high-performance monorepo supporting:
- **`apps/api-oos`**: ASP.NET Core Web API backend providing RESTful services, EF Core persistence, and SignalR real-time communications.
- **`apps/web-shop`**: Customer-facing online shop web app built with Next.js 16 (App Router), Tailwind CSS v4, and React 19.
- **`apps/web-oos`**: Internal Order & Operations Management dashboard.
- **`packages/`**: Shared TypeScript contracts, DTO types, and configuration rules across applications.

---

## Repository Layout

```
br-online-shop/
├── apps/
│   ├── api-oos/          → .NET Web API solution (enforces dotnet-structure skill)
│   ├── web-shop/         → Next.js 16 + React 19 + Tailwind v4 (online shop)
│   └── web-oos/          → Next.js 16 + React 19 + Tailwind v4 (order & ops system)
├── packages/
│   ├── shared-types/     → Shared TypeScript types / DTO contracts (@br-shop/shared-types)
│   └── config/           → Shared tsconfig & base configs (@br-shop/config)
├── docs/
│   ├── adr/              → Architecture Decision Records (ADR 0001: Shared Types)
│   ├── plans/            → Implementation plans
│   └── specs/            → Project backlogs & requirements (backlogs.md)
├── .github/
│   ├── workflows/        → GitHub Actions CI/CD (api-ci.yml, web-ci.yml)
│   └── PULL_REQUEST_TEMPLATE.md
├── docker-compose.yml    → Local PostgreSQL 16 & pgAdmin 4 services
├── pnpm-workspace.yaml   → pnpm monorepo workspace configuration
├── turbo.json            → Turborepo task pipeline configuration
├── CODEOWNERS            → Code ownership mapping
├── CONTRIBUTING.md       → Contribution & commit guidelines
└── README.md
```

---

## Prerequisites

Ensure your development environment meets the following software requirements before starting:

| Tool | Version Requirement | Purpose | Download Link |
|---|---|---|---|
| **Node.js** | `v20.0.0+` | JavaScript Runtime | [nodejs.org](https://nodejs.org/) |
| **pnpm** | `v9.0.0+` | Package Manager | [pnpm.io](https://pnpm.io/installation) |
| **.NET SDK** | `10.0+` / `8.0+` | C# / ASP.NET Backend Runtime | [dotnet.microsoft.com](https://dotnet.microsoft.com/download) |
| **Docker Desktop** | Latest | Database & Local Services | [docker.com](https://www.docker.com/) |

---

## Installation Guide

Follow these steps to set up the workspace locally:

### 1. Clone the Repository
```bash
git clone <repository-url>
cd br-online-shop
```

### 2. Install Dependencies
Install all Node workspace packages across `apps/` and `packages/` using pnpm:
```bash
pnpm install
```

---

## Development Guide

### 1. Infrastructure Services
Launch the PostgreSQL database and pgAdmin 4 web console via Docker Compose:
```bash
docker-compose up -d
```
- **PostgreSQL**: `localhost:5432` (`POSTGRES_USER=brshop`, `POSTGRES_DB=brshop`)
- **pgAdmin**: `http://localhost:5050` (`admin@brshop.local` / `admin`)

### 2. Environment Configuration
Copy `.env.example` templates to `.env.local` / `.env` files in their respective app directories:

- **Frontend (`apps/web-shop/.env.example` → `apps/web-shop/.env.local`)**:
  ```env
  NEXT_PUBLIC_API_URL=http://localhost:5004/api
  ```

- **Backend (`apps/api-oos/.env.example` → `apps/api-oos/.env`)**:
  ```env
  CONNECTION_STRING=Server=localhost,5432;Database=brshop;User Id=brshop;Password=brshopdev;
  JWT_SECRET=your-secret-key-here
  ```

### 3. Running Development Servers

You can launch apps individually or concurrently:

- **Frontend (Shop)**:
  ```bash
  pnpm dev:web
  ```
  *App runs at `http://localhost:3012` (or `https://localhost:3012`)*

- **Frontend (OOS Dashboard)**:
  ```bash
  pnpm dev:oos
  ```

- **Backend (.NET API)**:
  ```bash
  cd apps/api-oos
  dotnet run
  ```
  *Swagger UI accessible at `https://localhost:7004/swagger`*

- **All Workspace Tasks**:
  ```bash
  pnpm dev
  ```

---

## Verification & Tooling

Run the following commands to validate code quality and type safety:

```bash
# Run linting across all workspace apps & packages
pnpm run lint

# Run TypeScript type check across workspace
pnpm run type-check

# Build all applications via Turborepo
pnpm run build

# Run backend unit tests
cd apps/api-oos && dotnet test
```

---

## Architecture & Governance

- **Clean Architecture (.NET)**: Backend layering strictly follows `Controllers → Services → Repositories` as documented in [.agents/skills/dotnet-structure/SKILL.md](file://.agents/skills/dotnet-structure/SKILL.md).
- **Frontend Composition (Next.js)**: App Router routes are kept clean and logic-free as documented in [.agents/skills/web-nextjs-structure/SKILL.md](file://.agents/skills/web-nextjs-structure/SKILL.md).
- **Shared Contracts Strategy**: Auto-generated DTO typing from OpenAPI specs documented in [docs/adr/0001-shared-types-strategy.md](file://docs/adr/0001-shared-types-strategy.md).
- **Contribution Standards**: Conventional commit standards and branch naming defined in [CONTRIBUTING.md](file://CONTRIBUTING.md).

---

## License

This project is licensed under the MIT License — see the [LICENSE.md](LICENSE.md) file for details.
