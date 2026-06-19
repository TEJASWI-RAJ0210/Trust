# TrustLayer

> **Proof-as-a-Service** — Tamper-evident, time-stamped records for every stage of a digital transaction.

TrustLayer is a web-based platform that automatically generates verifiable proof records during key stages of transactions — freelancing projects, rental agreements, peer-to-peer sales, and more. It bridges the gap between *having an agreement* and *having proof of what actually happened*.

**Status:** 🚧 Partially Functional — Frontend complete, backend integration in progress.

---

## Table of Contents

- [Overview](#overview)
- [The Problem](#the-problem)
- [How It Works](#how-it-works)
- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Environment Variables](#environment-variables)
- [Database](#database)
- [API Reference](#api-reference)
- [Roadmap](#roadmap)
- [Contributing](#contributing)

---

## Overview

In the modern digital ecosystem, millions of transactions happen daily — freelancing work, rentals, P2P sales — without any reliable, structured proof of execution. When disputes arise, people rely on screenshots, emails, and verbal confirmations: all of which are easily manipulated and hard to validate.

TrustLayer solves this by capturing critical transaction events in real time and converting them into **immutable, time-stamped proof records** that can be shared, exported, and presented during disputes.

---

## The Problem

| Current Reality | TrustLayer's Answer |
|---|---|
| Screenshots can be faked | Hashed, tamper-evident records |
| Email chains are subjective | Structured chronological timelines |
| No standard proof format | Verified, exportable proof documents |
| Disputes are slow and costly | Ready-to-present evidence bundles |

The core problem is not the absence of agreements — it's the **absence of verifiable records of actions taken after the agreement**.

---

## How It Works

```
User / Platform
      │
      ▼
  TrustLayer
      │
      ├── 1. Capture Event (agreement, submission, payment, approval)
      ├── 2. Hash & Timestamp the record
      ├── 3. Store immutably with activity log
      ├── 4. Generate shareable proof link / exportable document
      └── 5. Present structured proof in case of dispute
```

### Step-by-Step Flow

1. **User Access & Integration** — Users access via the web app; platforms integrate via REST APIs.
2. **Automated Proof Generation** — The system captures: agreement details, file submissions with version tracking, payment references, and user actions (approve / reject / update).
3. **Structured Proof Creation** — All captured data is converted into time-stamped activity logs and tamper-evident hashed records with a clear chronological timeline.
4. **Secure Storage & Sharing** — Records are securely stored; users can generate a shareable proof link or export as a verified document.
5. **Dispute Resolution Support** — Structured proof can be presented to resolve conflicts, reducing reliance on subjective claims.

---

## Features

### ✅ Complete (Frontend)
- User authentication UI (login / signup)
- Dashboard layout and navigation
- Agreement creation form with templates
- File / work submission interface
- Activity log and timeline view
- Proof export and shareable link UI
- Dispute resolution view

### 🚧 In Progress (Backend)
- Authentication (API routes, session management)
- Agreement CRUD operations
- File upload handling and version tracking
- Activity log persistence
- Proof record hashing and storage
- Shareable link generation
- Dispute submission API

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Forms | React Hook Form + Zod |
| ORM | Prisma |
| Database | PostgreSQL |
| Charts | Recharts |
| Notifications | Sonner |
| Theme | next-themes |

---

## Project Structure

```
trustlayer/
├── app/                    # Next.js App Router
│   ├── api/                # API routes (backend)
│   │   ├── auth/           # Authentication endpoints
│   │   ├── agreements/     # Agreement CRUD
│   │   ├── proofs/         # Proof generation & retrieval
│   │   └── disputes/       # Dispute submission
│   ├── (dashboard)/        # Protected dashboard pages
│   └── (auth)/             # Login / Signup pages
├── components/             # Reusable UI components
├── lib/                    # Utilities (db client, helpers, hashing)
├── prisma/
│   ├── schema.prisma       # Database schema
│   └── migrations/         # Migration history
├── styles/                 # Global styles
├── public/                 # Static assets
└── __tests__/              # Test files
```

---

## Environment Variables

Create a `.env.local` file in the root of the project with the following variables:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Authentication
NEXTAUTH_SECRET="your-secret-key"
NEXTAUTH_URL="http://localhost:3000"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> ⚠️ Never commit `.env.local` to version control. It is already listed in `.gitignore`.

---

## Database

TrustLayer uses **PostgreSQL** via **Prisma ORM**.

### Migrations

The `prisma/migrations/` directory contains two migrations:

| Migration | Description |
|---|---|
| `20260320104036_init` | Initial schema — users, agreements, proof records |
| `20260320195231_add_password_hash` | Adds `passwordHash` field to the User model |

To apply migrations to your database:

```bash
npx prisma migrate deploy
```

To explore your database visually:

```bash
npx prisma studio
```

To regenerate the Prisma client after schema changes:

```bash
npx prisma generate
```

---

## API Reference

> 🚧 Backend is partially implemented. Endpoints listed below are planned or in progress.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register a new user |
| `POST` | `/api/auth/login` | Login and receive session token |
| `POST` | `/api/auth/logout` | End session |

### Agreements

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/agreements` | List all agreements for current user |
| `POST` | `/api/agreements` | Create a new agreement |
| `GET` | `/api/agreements/:id` | Get a specific agreement |
| `PATCH` | `/api/agreements/:id` | Update agreement status |

### Proof Records

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/proofs/:id` | Retrieve a proof record |
| `POST` | `/api/proofs/generate` | Generate proof for a transaction event |
| `GET` | `/api/proofs/:id/export` | Export proof as a verified document |
| `GET` | `/api/proofs/:id/share` | Get a shareable proof link |

### Disputes

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/disputes` | Submit a dispute with linked proof |
| `GET` | `/api/disputes/:id` | Get dispute details and timeline |

---

## Roadmap

### MVP (Current Focus)
- [x] Frontend UI — all screens
- [ ] Authentication — registration, login, session
- [ ] Agreement creation and management
- [ ] Proof record generation with hashing
- [ ] Activity log persistence
- [ ] Shareable proof links
- [ ] Export as verified document

### Phase 2
- [ ] Platform API integration (for third-party freelancing sites)
- [ ] Email notifications on key events
- [ ] External timestamp anchoring (RFC 3161 or blockchain)
- [ ] Role-based access (admin, client, freelancer)

### Future Use Cases
- 🏠 Rental agreements
- 🛒 E-commerce transactions
- 🎓 Academic collaborations
- 🏪 Small business operations

---

## Contributing

Contributions are welcome! Here's how to get started:

1. Fork the repository.
2. Create a new branch: `git checkout -b feature/your-feature-name`
3. Make your changes and commit: `git commit -m "feat: add your feature"`
4. Push to your branch: `git push origin feature/your-feature-name`
5. Open a Pull Request.

Please follow the existing code style and write clear commit messages. For major changes, open an issue first to discuss what you'd like to change.

---