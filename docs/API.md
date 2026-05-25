# FenceFlow CRM REST API

Base path: `/api/v1`

Private endpoints require JWT access token and company scope.

## Auth

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/auth/register` | Create company and owner |
| POST | `/auth/login` | Login by email or phone |
| POST | `/auth/logout` | Revoke refresh token |
| POST | `/auth/refresh` | Rotate refresh token and return new access token |
| POST | `/auth/forgot-password` | Send reset link |
| POST | `/auth/reset-password` | Reset password by token |

## Users

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/users` | List users with role/status filters |
| POST | `/users` | Invite or create user |
| GET | `/users/:id` | Get user |
| PATCH | `/users/:id` | Update user |
| DELETE | `/users/:id` | Soft delete/deactivate user |

## Deals

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/deals` | Server-side filtered list or kanban buckets |
| POST | `/deals` | Create deal |
| GET | `/deals/:id` | Deal card data |
| PATCH | `/deals/:id` | Update deal |
| DELETE | `/deals/:id` | Soft delete |
| PATCH | `/deals/:id/stage` | Move deal to another stage |
| GET | `/deals/filters/options` | Dictionaries for advanced filters |

Common query filters:

```text
stageId, status, managerId, measurerId, crewLeadId, source, priority,
createdFrom, createdTo, lastContactFrom, measurementFrom, installationFrom,
amountFrom, amountTo, fenceType, lengthFrom, lengthTo, heightFrom, city,
paymentStatus, refusalReason, hasGates, gateType, needsAutomation
```

## Fence params

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/deals/:id/fence-params` | Get params |
| POST | `/deals/:id/fence-params` | Create params |
| PATCH | `/deals/:id/fence-params` | Update params |

## Contacts

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/contacts` | List/search contacts |
| POST | `/contacts` | Create contact |
| GET | `/contacts/:id` | Contact card |
| PATCH | `/contacts/:id` | Update contact |
| DELETE | `/contacts/:id` | Soft delete |

## Measurements

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/measurements` | List calendar items |
| POST | `/measurements` | Schedule measurement |
| PATCH | `/measurements/:id` | Update status/result |
| DELETE | `/measurements/:id` | Cancel measurement |

## Installations

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/installations` | List calendar items |
| POST | `/installations` | Schedule installation |
| PATCH | `/installations/:id` | Update status/readiness |
| DELETE | `/installations/:id` | Cancel installation |

## Estimates

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/estimates` | List estimates |
| POST | `/estimates` | Create estimate |
| GET | `/estimates/:id` | Get estimate |
| PATCH | `/estimates/:id` | Update estimate |
| POST | `/estimates/:id/send` | Send estimate to customer |
| POST | `/estimates/:id/convert-to-pdf` | Queue PDF generation |

## Tasks

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/tasks` | List tasks |
| POST | `/tasks` | Create task |
| PATCH | `/tasks/:id` | Update task |
| DELETE | `/tasks/:id` | Soft delete |

## Integrations

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/integrations` | List integrations |
| POST | `/integrations` | Create integration |
| PATCH | `/integrations/:id` | Update settings |
| DELETE | `/integrations/:id` | Disable integration |
| POST | `/integrations/webhook/:source` | Universal webhook endpoint |

## Gudok

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/integrations/gudok/webhook` | Receive call events |
| GET | `/integrations/gudok/calls` | List synchronized calls |
| POST | `/integrations/gudok/test` | Send test event |
| PATCH | `/integrations/gudok/settings` | Update API/webhook settings |

## SEO and public pages

| Method | Path | Purpose |
| --- | --- | --- |
| GET | `/public/pages` | Published public pages |
| GET | `/public/pages/:slug` | Published page by slug |
| POST | `/admin/seo-pages` | Create SEO page |
| PATCH | `/admin/seo-pages/:id` | Update SEO page |
| DELETE | `/admin/seo-pages/:id` | Unpublish/delete SEO page |
| GET | `/blog` | Published posts |
| GET | `/blog/:slug` | Post by slug |
| POST | `/admin/blog` | Create post |
| PATCH | `/admin/blog/:id` | Update post |
| DELETE | `/admin/blog/:id` | Delete post |

## Lead forms

| Method | Path | Purpose |
| --- | --- | --- |
| POST | `/lead-forms/submit` | Service page lead |
| POST | `/lead-forms/callback` | Callback request |
| POST | `/lead-forms/calculator` | Calculator lead |
| POST | `/lead-forms/quiz` | Quiz lead |

Example lead payload:

```json
{
  "name": "Анна Петрова",
  "phone": "+7 916 440-20-10",
  "email": "anna@example.com",
  "landingUrl": "https://example.ru/zabory-iz-profnastila?utm_source=yandex",
  "source": "seo",
  "fenceType": "PROFILED_SHEET",
  "fenceParams": {
    "lengthMeters": 72,
    "heightMeters": 2,
    "needsGates": true,
    "gateType": "SLIDING",
    "needsInstallation": true
  },
  "utm": {
    "utmSource": "yandex",
    "utmMedium": "cpc",
    "utmCampaign": "fences_moscow"
  }
}
```
