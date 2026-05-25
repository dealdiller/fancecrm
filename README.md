# FenceFlow CRM

FenceFlow CRM is an MVP prototype and technical blueprint for a CRM built for fence construction and installation companies.

The current artifact is intentionally dependency-light: it opens as static HTML/CSS/JS and can be deployed to Vercel without local `npm install`.

## What is included

- Premium SaaS-style CRM UI prototype: dashboard, kanban pipeline, filters, deal drawer, calculator, integrations, automations, SEO section.
- Public SEO pages for fence services and calculator.
- Architecture and MVP plan in `docs/ARCHITECTURE.md`.
- REST API contract in `docs/API.md`.
- Prisma/PostgreSQL schema draft in `prisma/schema.prisma`.
- Backend examples for lead forms and Gudok telephony webhooks in `backend/`.
- Frontend TSX examples in `frontend/`.
- Docker and Vercel configuration.

## Open locally

Open `index.html` in a browser, or run:

```bash
node server.js
```

Then open `http://localhost:4173`.

## Production direction

Recommended production stack:

- Next.js App Router, React, TypeScript, Tailwind CSS, shadcn/ui, dnd-kit, Zustand.
- NestJS, Prisma, PostgreSQL, Redis, BullMQ, WebSocket notifications.
- JWT access/refresh tokens, RBAC, company-level tenant isolation.
- SSG/SSR public SEO pages, `noindex` CRM workspace.
