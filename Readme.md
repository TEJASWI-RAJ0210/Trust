# TrustLayer 🔐

> **Proof-as-a-Service** — Tamper-evident, time-stamped records for every stage of a digital transaction.

TrustLayer is a web-based platform that automatically generates verifiable proof records during key stages of transactions — freelancing projects, rental agreements, peer-to-peer sales, and more. It bridges the gap between *having an agreement* and *having proof of what actually happened*.

**Status:** ✅ MVP Backend Complete — Auth, proofs, disputes, and parties fully wired. Frontend integrated with real data.

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
- [Security](#security)
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

1. **User Access** — Register, log in, and access your dashboard.
2. **Create Proof** — Define your agreement, add parties, upload files and links.
3. **Structured Proof Creation** — All data is converted into time-stamped, tamper-evident records.
4. **Secure Storage & Sharing** — Records stored securely; share via link or export.
5. **Dispute Resolution** — Raise a formal dispute with structured proof if needed.

---

## Features

### ✅ Complete
- User authentication (register, login, logout) with JWT cookie sessions
- Route protection via Next.js middleware
- Dashboard with real proof stats and records
- Full proof lifecycle — create, view, share, dispute
- Multi-step proof creation wizard (type → details → attachments → integrations → review)
- Disputes system — raise, track, and respond to disputes
- Party profiles linked to disputes
- User profile with real stats, editable fields, and account deletion
- Identity verification flow (Aadhaar, PAN, DSC, GST, Selfie)
- Integrations page (Stripe, Notion, Google, GitHub, Figma, Linear, DocuSign)
- Onboarding walkthrough
- Shared component library (PageShell, PageHeader, StatCard, StatusBadge, AppSidebar, EmptyState)
- Dark mode support

### 🚧 In Progress / Planned
- Real file upload storage (currently UI only)
- PDF export of proof records
- Email notifications on dispute events
- External timestamp anchoring (RFC 3161)
- Real KYC integration (UIDAI, DigiLocker)
- Activity log persistence
- API integrations (Stripe webhooks, Notion sync)

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | [Next.js](https://nextjs.org/) (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS |
| UI Components | shadcn/ui |
| Forms | React Hook Form + Zod |
| Auth | JWT (jsonwebtoken) + bcryptjs + httpOnly cookies |
| ORM | Prisma |
| Database | PostgreSQL |
| Charts | Recharts |
| Notifications | Sonner |
| Theme | next-themes |

---

## Project Structure

```
trustlayer/
├── app/
│   ├── api/
│   │   ├── auth/
│   │   │   ├── login/route.ts
│   │   │   ├── logout/route.ts
│   │   │   ├── me/route.ts
│   │   │   └── register/route.ts
│   │   ├── disputes/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   ├── parties/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   ├── proofs/
│   │   │   ├── [id]/route.ts
│   │   │   └── route.ts
│   │   └── users/
│   │       └── [id]/route.ts
│   ├── auth/                  # Login, register pages
│   ├── create/                # Multi-step proof creation
│   ├── dashboard/             # Main dashboard
│   ├── disputes/              # Disputes list, detail, new
│   ├── integrations/          # Integration management
│   ├── onboarding/            # First-time user walkthrough
│   ├── party/[id]/            # Party profile
│   ├── profile/               # User profile
│   ├── proof/[id]/            # Proof detail
│   ├── verification/          # Identity verification
│   └── layout.tsx
├── components/
│   ├── app-sidebar.tsx        # Shared sidebar + mobile header
│   ├── empty-state.tsx        # EmptyState, ErrorState, LoadingState
│   ├── page-header.tsx        # Consistent page headers
│   ├── page-shell.tsx         # Page wrapper with padding/max-width
│   ├── stat-card.tsx          # Reusable stat card
│   ├── status-badge.tsx       # Unified status badge for all statuses
│   ├── theme-provider.tsx
│   └── ui/                    # shadcn/ui primitives
├── lib/
│   ├── api-auth.ts            # Auth helper for API routes
│   ├── prisma.ts              # Prisma singleton
│   └── utils.ts
├── middleware.ts              # Route protection
├── prisma/
│   ├── schema.prisma
│   └── migrations/
└── __tests__/
```

---

## Environment Variables

Create a `.env.local` file in the root of the project:

```env
# Database
DATABASE_URL="postgresql://USER:PASSWORD@HOST:PORT/DATABASE"

# Authentication — must be a strong random string
JWT_SECRET="your-strong-random-secret-min-32-chars"

# App
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

> ⚠️ The app will throw at startup if `JWT_SECRET` or `DATABASE_URL` is missing. Never commit `.env.local`.

---

## Database

TrustLayer uses **PostgreSQL** via **Prisma ORM**.

### Schema Models

| Model | Key Fields |
|---|---|
| `User` | id, email, name, passwordHash, phone, country, role, emailVerified |
| `Proof` | id, title, description, data (Json), status, userId |
| `Dispute` | id, title, description, status, userId, partyId |
| `Party` | id, name |

### Migrations

| Migration | Description |
|---|---|
| `20260320104036_init` | Initial schema |
| `20260320195231_add_password_hash` | Adds passwordHash to User |

```bash
# Apply migrations
npx prisma migrate deploy

# After schema changes
npx prisma migrate dev --name your_change_name
npx prisma generate

# Explore data
npx prisma studio
```

---

## API Reference

All endpoints except `/api/auth/*` require a valid session cookie set by login.

### Authentication

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/auth/register` | Register — body: `{ email, password, name?, phone?, country?, role? }` |
| `POST` | `/api/auth/login` | Login — body: `{ email, password }` — sets httpOnly cookie |
| `POST` | `/api/auth/logout` | Clears session cookie |
| `GET` | `/api/auth/me` | Returns current user from cookie |

### Users

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/users/[id]` | Get own profile (own ID only) |
| `PATCH` | `/api/users/[id]` | Update name, email, phone, country (own only) |
| `DELETE` | `/api/users/[id]` | Delete account + all data (own only) |

### Proofs

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/proofs` | List own proofs |
| `POST` | `/api/proofs` | Create proof — body: `{ title, description?, data? }` |
| `GET` | `/api/proofs/[id]` | Get proof (owner only) |
| `PATCH` | `/api/proofs/[id]` | Update title, description, status (owner only) |
| `DELETE` | `/api/proofs/[id]` | Delete proof (owner only) |

### Disputes

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/disputes` | List own disputes |
| `POST` | `/api/disputes` | Create dispute — body: `{ title, partyId, description? }` |
| `GET` | `/api/disputes/[id]` | Get dispute (owner only) |
| `PATCH` | `/api/disputes/[id]` | Update title, description, status (owner only) |
| `DELETE` | `/api/disputes/[id]` | Delete dispute (owner only) |

### Parties

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/api/parties` | List parties linked to own disputes |
| `POST` | `/api/parties` | Create party — body: `{ name }` |
| `GET` | `/api/parties/[id]` | Get party (must have dispute with them) |
| `DELETE` | `/api/parties/[id]` | Delete party (if no other users reference them) |

---

## Security

- All routes protected by `middleware.ts` — unauthenticated users redirected to login
- JWT stored in `httpOnly` cookie — not accessible via JavaScript
- `userId` always read from cookie, never trusted from request body
- Passwords hashed with bcryptjs (cost factor 10)
- All API routes return 401/403 before touching the database if auth fails
- Users can only access their own data — ownership checked on every `[id]` route
- `passwordHash` never returned in any API response
- `JWT_SECRET` and `DATABASE_URL` validated at startup — app refuses to run without them
- Email normalized to lowercase before storage and lookup

---

## Roadmap

### MVP ✅
- [x] Auth — register, login, logout, session
- [x] Route protection via middleware
- [x] Proof CRUD with ownership checks
- [x] Dispute CRUD with party creation
- [x] Dashboard with real data
- [x] Profile page with editable fields
- [x] Shared component library
- [x] All pages wired to real API

### Phase 2
- [ ] File upload storage (S3 or Cloudflare R2)
- [ ] PDF export of proof records
- [ ] Email notifications (dispute raised, status changed)
- [ ] External timestamp anchoring (RFC 3161)
- [ ] Real KYC integration (UIDAI OTP, DigiLocker)
- [ ] Webhook support for integrations (Stripe, Notion)

### Future
- 🏠 Rental agreements use case
- 🛒 E-commerce transaction proofs
- 🎓 Academic collaboration records
- 🏪 Small business operations

---

## Contributing

1. Fork the repository
2. Create a branch: `git checkout -b feature/your-feature`
3. Commit: `git commit -m "feat: description"`
4. Push: `git push origin feature/your-feature`
5. Open a Pull Request

For major changes, open an issue first to discuss.

---

<div align="center">
  <p>Built with ❤️ to make digital trust verifiable.</p>
</div>