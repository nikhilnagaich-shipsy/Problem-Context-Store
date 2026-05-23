# Problem Context Store

The customer-problem memory layer for B2B software companies.

Sits over Slack, DevRev, GitHub, Gmail, and your call transcripts. Turns every customer problem into a living, cross-tool timeline — every ticket, conversation, decision, and fix, linked to one canonical **Problem**. First-class manual capture for the hallway conversations that never make it into a tool.

Built first for Shipsy. Architected from day one as a multi-tenant SaaS.

---

## Stack

| Layer | Choice |
|---|---|
| Language | TypeScript end-to-end |
| Web | Next.js 14 (App Router, RSC + Server Actions) |
| DB | Postgres 16 + `pgvector` |
| ORM | Prisma |
| Auth | Dev-cookie session for now → Auth.js v5 in real M2 |
| Queue | BullMQ + Redis (added in M5) |
| LLM | Anthropic Claude (added in M6) |
| Styling | Tailwind CSS |
| Monorepo | pnpm workspaces + Turborepo |

---

## Folder structure

```
.
├── apps/
│   └── web/                  Next.js app (UI + Server Actions)
│       ├── app/
│       │   ├── (workspace)/      Authed workspace routes (sidebar shell)
│       │   │   ├── dashboard/        Problem list + filters
│       │   │   ├── problems/[id]/    Hero screen — cross-source timeline
│       │   │   ├── problems/new/     Create-problem form
│       │   │   ├── clients/          Clients list + detail
│       │   │   ├── notes/            All manual notes
│       │   │   ├── connectors/       Connector inventory
│       │   │   ├── activity/         Audit log
│       │   │   └── settings/
│       │   └── actions/          Server Actions (mutations)
│       ├── components/
│       │   ├── ui/               Badge, Button, Card, FormField
│       │   ├── Sidebar.tsx
│       │   ├── Topbar.tsx
│       │   ├── Timeline.tsx
│       │   ├── ProblemHeader.tsx
│       │   ├── QuickLogSheet.tsx     ⌘K manual capture
│       │   └── …
│       └── lib/                  cn, format, auth (dev session)
├── packages/
│   ├── db/                   Prisma schema, client, seed
│   └── core/                 Shared types & business logic
├── docs/
│   └── ARCHITECTURE.md       Module-by-module deep dive
└── …root configs
```

---

## Quick start (testable)

### 1. Prerequisites

- Node.js 20+
- pnpm 9+ (`npm install -g pnpm`)
- Docker (for Postgres with `pgvector`)

### 2. Start Postgres

```bash
docker run -d \
  --name pcs-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=problem_context_store \
  -p 5432:5432 \
  pgvector/pgvector:pg16
```

### 3. Install, configure, migrate, seed

```bash
pnpm install
cp .env.example .env

pnpm db:generate     # generate Prisma client
pnpm db:push         # push schema to Postgres
pnpm db:seed         # load Shipsy + Acme + Globex demo state
```

### 4. Run

```bash
pnpm dev             # → http://localhost:3000
```

You'll be auto-signed-in as the seeded user (Nikhil Nagaich · `nikhil.nagaich@shipsy.io`) into the Shipsy workspace. Real auth comes in M2.

---

## What to test

The fastest way to walk the whole product:

1. **Problem list** — `/dashboard`. Try the status / severity / client filters. Click a row.
2. **Problem detail** — `/problems/seed-problem-acme-cod-mismatch`. The hero screen.
   - Look at the chronological timeline interleaving Slack messages, the DevRev ticket, the GitHub PR, and the phone-call manual note.
   - Change the **Status** dropdown in the header — it persists.
   - Change the **Severity** dropdown — it persists.
   - Click **Add manual note** to capture a new note pinned to this problem.
3. **Quick Log (⌘K / Ctrl+K)** — works from any page. Type a note, optionally attach to a problem, save. It appears in the Notes page and (if attached) on the Problem timeline.
4. **Create a new problem** — `/dashboard` → "New problem" or `/problems/new`. Required: client + title. After save you land on the detail page.
5. **Clients** — `/clients`. Click into one to see its problems.
6. **Notes** — `/notes`. Every manual note ever captured.
7. **Activity** — `/activity`. The audit log (your mutations show up here).
8. **Connectors** — `/connectors`. Lists seeded `PENDING` connectors; install button is disabled until M8.
9. **Settings** — `/settings`. Shows workspace + you.

### What to look for / give feedback on

- Does the **information density** feel right on the Problem detail page, or too sparse / too cramped?
- Is the Quick Log fast enough to feel like "just type and go"?
- Does the **Problem-as-noun** orientation feel intuitive when you scan the list?
- Anything you'd want surfaced on the right rail that isn't there?
- Naming: "Problem" / "Client" / "Manual note" — any of those feel wrong?

---

## Module status

See [`docs/ARCHITECTURE.md`](./docs/ARCHITECTURE.md) for the full breakdown.

- [x] **M1** — Foundation scaffolding
- [x] **M2-lite** — Dev-session auth (cookie-based). Real Auth.js in M2.
- [x] **M3** — Data model (Prisma schema, 13 models)
- [x] **M4** — Problem timeline UI + manual capture
- [ ] **M5** — Ingestion framework (webhooks, queue, normalizer)
- [ ] **M6** — Resolution layer (rules + vector + LLM judge)
- [ ] **M7** — Intelligence layer (embeddings, summary regen, Q&A)
- [ ] **M8** — Connectors (Slack, DevRev, GitHub, Gmail)
- [ ] **M9** — Surfaces (Slack bot, email-in, browser ext)
- [ ] **M10** — Admin, billing, audit UI, observability

---

## Troubleshooting

**"No users found. Run `pnpm db:seed`"** on the dashboard
→ The seed didn't run. `pnpm db:seed`.

**Prisma error: extension "vector" is not available**
→ You're on plain Postgres, not pgvector. Use the Docker command in step 2.

**Port 5432 already in use**
→ Stop your existing Postgres or change the port in `docker run` *and* in `DATABASE_URL`.

**Hot reload shows "PrismaClient is already in use"**
→ The singleton in `packages/db/src/index.ts` handles this; if you still see it, restart `pnpm dev`.

---

## License

Proprietary — Shipsy internal until further notice.
