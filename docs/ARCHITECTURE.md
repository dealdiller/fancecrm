# FenceFlow CRM: architecture and MVP plan

## 1. Architecture

FenceFlow CRM is a multi-tenant SaaS for companies that sell, measure and install fences, gates and wickets.

Recommended production layout:

```text
apps/
  web/        # Next.js App Router: CRM workspace and public SEO pages
  api/        # NestJS REST API, auth, webhooks, automations
packages/
  database/   # Prisma schema, migrations, seed
  ui/         # design system and shared components
  contracts/  # zod DTOs and OpenAPI generation
```

Runtime:

- Public pages use SSR/SSG and are indexable.
- CRM workspace is private and `noindex`.
- API enforces `companyId` on every business entity.
- PostgreSQL is the source of truth.
- Redis stores sessions, queues, rate limits and dictionaries.
- BullMQ handles automations, webhook retries and estimate PDFs.
- WebSocket/SSE delivers notifications and call events.

## 2. MVP plan

MVP scope:

- Auth: register company, login, refresh, logout, forgot/reset password.
- Companies, users, roles, permissions and tenant isolation.
- Deals, contacts, tasks, measurements, installations.
- Fence-specific fields and filters.
- Kanban pipeline for fence sales.
- Deal card with timeline, calls, tasks and calculator.
- Basic estimate calculator and saved estimate.
- Lead webhook: site forms, calculator, quiz and callback.
- Gudok webhook: incoming, outgoing and missed calls.
- Automation rules: new deal, missed call, stage changed, stale deal.
- Public SEO page for services plus reusable SEO-page model.
- UTM capture and source attribution.

Launch phases:

1. Auth, database, roles, UI shell, deals and contacts.
2. Kanban, filters, deal card, tasks, measurements, installations.
3. Calculator, estimates, public lead form, UTM, SEO page.
4. Gudok webhook, automation engine, notifications, audit log, deployment hardening.

## 3. Frontend

Stack:

- Next.js App Router, React, TypeScript.
- Tailwind CSS and shadcn/ui primitives.
- dnd-kit for kanban drag-and-drop.
- Zustand for UI state.
- TanStack Query or SWR for server state.
- React Hook Form and Zod for forms.
- Framer Motion for small transitions.

Structure:

```text
apps/web/src/app/(public)
apps/web/src/app/(crm)
apps/web/src/components/deals
apps/web/src/components/calculator
apps/web/src/components/seo
apps/web/src/lib
apps/web/src/store
```

## 4. Backend

Stack:

- NestJS, TypeScript, REST API.
- Prisma ORM and PostgreSQL.
- Redis, BullMQ, WebSocket gateway.
- JWT access tokens plus refresh token rotation.
- RBAC guard and company tenant guard.
- OpenAPI/Swagger generated from DTOs.

Modules:

```text
auth, users, companies, roles, deals, contacts, tasks, measurements,
installations, estimates, calls, integrations, automations, seo, lead-forms,
files, notifications
```

## 5. Database

Core tables:

- users, companies, roles, permissions
- pipelines, pipeline_stages
- deals, deal_fence_params
- contacts, organizations
- tasks, measurements, installations
- estimates, estimate_items
- call_logs, integrations, webhooks
- automation_rules, automation_events
- activity_logs, files, notifications
- payment_records
- landing_pages, seo_pages, blog_posts, lead_forms, utm_sources

Rules:

- Every business table has `companyId`.
- Common filters have indexes: stage, manager, status, date, phone, source, UTM.
- Customer-facing deletes are soft deletes.
- Audit and payment records are retained.
- Integration secrets are encrypted.

## 6. Auth

- Register creates company, owner role, owner user and default pipeline.
- Passwords are hashed with Argon2id or bcrypt.
- Login accepts email or phone.
- Failed attempts trigger rate limit and lockout.
- Access token lifetime: 10-15 minutes.
- Refresh token lifetime: 14-30 days with rotation.
- Session expiry shows a clear UI notice.

## 7. Roles

- Owner: all resources and billing.
- Admin: users, settings and integrations.
- Sales lead: department deals and reports.
- Manager: own deals, contacts and tasks.
- Measurer: assigned measurements.
- Installer: assigned installations.
- Observer: read-only.

Permission shape:

```text
resource: deals, contacts, tasks, measurements, installations, estimates, users, integrations, automations, seo
action: create, read, update, delete, assign, export, manage
scope: own, department, company
```

## 8. Sales pipeline

Default stages:

1. New lead
2. First contact
3. Fence parameters clarification
4. Measurement scheduled
5. Measurement done
6. Cost calculation
7. Estimate sent
8. Customer approval
9. Prepayment pending
10. Contract signed
11. Installation scheduled
12. Fence in progress
13. Installation completed
14. Payment received
15. Won
16. Lost

Stage movement validates required data and triggers automations.

## 9. Fence filters

Server-side filters cover:

- Client: name, phone, email, city, district, address, client type.
- Deal: manager, measurer, crew, stage, source, dates, amount, probability, priority.
- Fence type: profiled sheet, euro picket, chain-link, 3D mesh, wood, metal, forged, concrete, brick, combined.
- Fence params: length, height, color, coating, metal thickness, posts, rails, foundation, concrete work, delivery, installation, slope, soil, urgency.
- Gates and wickets: required, type, width, automation, intercom, electric lock.
- Budget and payment: budget, estimate total, prepayment, remainder, method, contract, invoice.
- Production: measurement status, installation status, crew, materials, delivery, act, warranty.
- Refusal reasons: expensive, competitor, no answer, postponed, timing, no budget, changed mind, duplicate, irrelevant, other region.

## 10. Deal card

The deal card is the main operating screen:

- Header: title, amount, status, stage, priority, probability.
- People: manager, measurer, crew, client and organization.
- Fence params: type, length, height, color, coating, gates, wickets, foundation, dismantling, delivery, installation, terrain, soil, warranty.
- Timeline: calls, messages, changes, comments, tasks and automation events.
- Files: photos, contract, estimate, act.
- Actions: call, message, task, measurement, installation, calculate, send estimate, change stage, close won, close lost.

## 11. Cost calculator

Formula MVP:

```text
materials = length * height * basePriceByFenceType
posts = ceil(length / postStep) * postPrice
rails = length * railCount * railMeterPrice
foundation = length * foundationMeterPrice
gates = gateCount * gatePrice
wickets = wicketCount * wicketPrice
extras = dismantling + delivery + installation + remoteFee + complexityFee
subtotal = materials + posts + rails + foundation + gates + wickets + extras
total = subtotal + markup - discount
```

The saved estimate stores versioned items, totals, discount, margin and PDF status.

## 12. Measurements and installations

Measurements:

- Assigned to a measurer.
- Store date, arrival window, status, result, photos and measured params.
- Completion updates fence params and triggers estimate task.

Installations:

- Assigned to crew lead or team.
- Track readiness: contract, prepayment, materials, delivery, object readiness.
- Statuses: planned, confirmed, in progress, paused, done, act signed, warranty issued.

## 13. Integrations and Gudok

Universal lead flow:

1. Normalize phone and email.
2. Find or create contact inside company.
3. Find active deal or create a new one.
4. Save source, URL, UTM and raw payload.
5. Assign manager by rule or round-robin.
6. Create task "Contact customer".
7. Write activity log and automation event.

Gudok flow:

1. Validate webhook signature.
2. Normalize direction, status, phone, recording URL and source.
3. Upsert contact by phone.
4. Create or attach active deal.
5. Save call log.
6. If missed, create callback task and notify manager.

## 14. UI/UX concept

FenceFlow should feel like a quiet operating console:

- Dense, readable and fast CRM workspace.
- Dashboard answers who needs action now.
- Kanban makes bottlenecks visible.
- Deal drawer opens fast.
- Call, task, stage change and estimate are one or two clicks.
- Advanced filters are saved and reusable.
- Light and dark themes.
- Accessible labels, focus states and clear validation.

## 15. SEO architecture

Public routes:

- `/`
- `/zabory-iz-profnastila`
- `/zabory-iz-evroshtaketnika`
- `/zabory-iz-rabitsy`
- `/3d-zabory`
- `/vorota-i-kalitki`
- `/kalkulyator-zabora`
- `/ceny`
- `/nashi-raboty`
- `/otzyvy`
- `/kontakty`
- `/zabory-v-[city]`
- `/blog/[slug]`

SEO rules:

- SSG for stable service/city pages.
- SSR for frequently changing prices.
- CRM workspace has `noindex`.
- Canonical URLs and clean slugs.
- Sitemap and robots generated from published pages.
- Images in WebP/AVIF, lazy loading and explicit sizes.
- Internal linking between services, cities, prices, works and blog.

## 16. Meta examples

`/zabory-iz-profnastila`

- Title: `Заборы из профнастила под ключ - цена за метр и монтаж`
- Description: `Установка заборов из профнастила с замером, доставкой, воротами и гарантией. Рассчитайте стоимость за 1 день.`

`/vorota-i-kalitki`

- Title: `Ворота и калитки для забора - откатные, распашные, с автоматикой`
- Description: `Изготовление и монтаж ворот и калиток: автоматика, домофон, электрозамок, гарантия и смета.`

## 17. Schema.org examples

```json
{
  "@context": "https://schema.org",
  "@type": "Service",
  "name": "Заборы из профнастила под ключ",
  "provider": { "@type": "Organization", "name": "FenceFlow" },
  "areaServed": "Москва и Московская область",
  "serviceType": "Монтаж заборов",
  "offers": { "@type": "Offer", "priceCurrency": "RUB", "price": "2600" }
}
```

## 18. Performance plan

- Cursor pagination for deals, contacts, calls and logs.
- Server-side filters and sorting.
- PostgreSQL indexes for stage, manager, status, dates, phone and UTM.
- Trigram or full-text global search.
- Virtualized tables and lists.
- Lazy load calculator, files, timeline and charts.
- Cache dictionaries.
- Debounce filters and search.
- Optimistic UI for stage moves.
- Queue estimate PDFs, webhook retries and automation actions.

## 19. Roadmap

1. Estimate PDF designer and templates.
2. WhatsApp, Telegram and email messaging.
3. Reports by manager, source, service, city and margin.
4. Crew mobile workspace.
5. Customer portal for estimate approval and payment.
6. Inventory and purchasing.
7. AI call summaries and next-step suggestions.
8. Multi-pipeline support.
9. Marketplace integrations.
10. Advanced automation builder with branching and delays.
