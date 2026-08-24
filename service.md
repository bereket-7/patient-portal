# Patient Portal

## Overview

Patient-facing web application for managing research consent, viewing participation status, exercising individual access rights under HIPAA, and discovering clinical trial matches via HealthEx-connected health records.

## What This Portal Does

- Allows patients to register, verify identity (demo), and connect health records via HealthEx
- Grant, review, and revoke research consent (RESRCH purpose)
- View trial matches, enrollment progress, and coordinator updates
- Browse connected health records (observations, conditions, medications)
- View a patient-facing data access log (HIPAA accounting of disclosures)
- Supports digital consent capture with confirmation flow (demo; production wires to Consent Management Service)

## Key Screens

| Screen | Route | Status |
|--------|-------|--------|
| Landing | `/` | Delivered |
| Registration | `/register` → `/verify-email` → `/verify-phone` | Delivered (simulated verification) |
| Login | `/login` | Delivered (local credentials + gateway JWT) |
| Dashboard | `/dashboard` | Delivered |
| HealthEx connect | `/connect/healthex` | Delivered — sync live consent / retry HealthEx link |
| Consent authorization | `/connect/consent` | Delivered |
| **Consent Management** | `/consent` | **Delivered** — grant/revoke, history timeline |
| Trial Matches | `/trials` | Delivered |
| Trial detail / enrollment | `/trials/[matchId]` | Delivered — stepper, coordinator contact |
| **My Participation** | `/participation` | **Delivered** — enrollment progress overview |
| Observations | `/health/observations` | Delivered |
| Conditions | `/health/conditions` | Delivered |
| Medications | `/health/medications` | Delivered |
| **Data Access Log** | `/privacy/access-log` | **Delivered** — HIPAA transparency (mock audit events) |
| Profile | `/profile` | Delivered |
| **Digital Member ID** | `/profile/member-id` | **Delivered** — view/download/print + QR verify (`enterprisePatientId`) |
| **Digital Welcome Letter** | `/profile/welcome` | **Delivered** — post-enrollment letter, print/PDF |
| Share with provider | `/profile/share` | Delivered — OTP + QR (gateway dev API) |

## Live Mode Configuration

Set in `.env.local` (see `.env.example`):

| Variable | Staging/live | Local demo |
|----------|--------------|------------|
| `NEXT_PUBLIC_DEMO_MODE` | `false` | `true` |
| `NEXT_PUBLIC_API_URL` | Gateway URL | `http://localhost:3000` |
| `NEXT_PUBLIC_USE_DUMMY_HEALTH_DATA` | `false` | optional `true` |

When `NEXT_PUBLIC_DEMO_MODE=false`, health records, trial eligibility, audit log, and member ID verification call live gateway APIs. Demo banner is hidden.

## Production Identity Provider (Phase 6 path)

Replace dev patient accounts with production IdP:

1. Configure SMART on FHIR OAuth at API gateway (`OAUTH_JWKS_URI`, issuer, audience).
2. Map IdP `sub` → `enterprisePatientId` via patient-identity crosswalk.
3. Retire `/dev/patient-accounts/*` in production overlays; keep Member ID + Welcome Letter UI unchanged.
4. Move member verification from `/dev/member-verify` to patient-identity or dedicated verify service.

## Demo vs Production

| Area | Current (demo) | Production target |
|------|----------------|-------------------|
| Account & login | File-backed `/dev/patient-accounts` + shared-ui JWT mint | Identity provider / SMART on FHIR OAuth |
| Email & phone verification | Simulated | Email/SMS services |
| HealthEx connection | Register creates HealthEx project patient; Connect syncs live consent via `patient-flow-progress` | Real OAuth redirect to HealthEx wallet (optional when `NEXT_PUBLIC_HEALTHEX_AUTH_URL` set) |
| Consent grant/revoke | Platform capture + MPI link + FHIR fetch with real HealthEx IDs | Consent Management Service with durable audit |
| Health data | Live FHIR when CONSENTED; mock summaries otherwise | Live FHIR via API gateway / ingestion |
| Trial matches & enrollment | Mock data | Trial registry + coordinator workflow APIs |
| Data access log | Mock events aligned with audit schema | `GET /api/v1/audit?patient_id=` via API gateway |
| Notifications | Mock dropdown | Platform notification service |

A dismissible **demo mode banner** appears in the portal shell to make prototype status clear to stakeholders.

## Auth Integration

Patient Portal uses a two-layer auth model:

1. **Patient account (onboarding)** — gateway `/dev/patient-accounts/*` (file store under `backend/api-gateway/.data/patient-accounts.json`) plus local mirror in `trialcliniq.patient.auth.account`.
2. **API gateway session** — `AuthProvider` (`portal="patient"`) from `@trialcliniq/shared-ui` holds the bearer token in `trialcliniq.auth.session`.

### Registration → HealthEx

1. `POST /dev/patient-accounts/register` creates the account (scrypt password hash).
2. Gateway calls ingestion `POST /api/v1/healthex/patients` with demographics + `external_id = account.id`.
3. Stores `healthExReferenceId` / `healthExPatientId` on the account (or `healthex_link_error` if HealthEx fails — account still usable).
4. Verify email/phone (demo) → login → mint JWT.

### Connect → Consent

1. `/connect/healthex` — **Sync from HealthEx** (`POST /dev/patient-accounts/sync-healthex`) loads live consent/retrieval; **Retry add** if unlinked.
2. Continue only when HealthEx status is `CONSENTED` (or patient id is known after sync).
3. `/connect/consent` **Allow** — requires real `healthExPatientId` (no `HX-*` mocks):
   - `POST /api/v1/patient-identity`
   - `POST /api/v1/consent/capture-from-healthex` (`healthex-portal:{referenceId}` when needed)
   - `POST /api/v1/ingest/HealthX/fetch`

On successful login, the portal validates email/password against the gateway, then:

- When the API gateway has `AUTH_DEV_MODE=true` and mint enabled → `POST /dev/auth/token` returns a real RS256 JWT (`patient/*.read`, purpose `RESRCH`).
- Otherwise → stub `dev-token` (same pattern as Site Portal).

Portal routes require both `account.isLoggedIn` and the patient authenticated flag plus a session token. Logout clears both layers.

## Backend API alignment

When `NEXT_PUBLIC_DEMO_MODE=false` and the API gateway is running, the portal calls:

| Portal action | Backend endpoint |
|---------------|------------------|
| Register | `POST /dev/patient-accounts/register` (+ server-side HealthEx add) |
| Login | `POST /dev/patient-accounts/login` then `POST /dev/auth/token` |
| Retry HealthEx link | `POST /dev/patient-accounts/retry-healthex-link` |
| Sync HealthEx status | `POST /dev/patient-accounts/sync-healthex` |
| HealthEx ingest | `POST /api/v1/ingest/HealthX/fetch` |
| Consent capture | `POST /api/v1/consent/capture-from-healthex` |
| Consent revoke | `DELETE /api/v1/consent/:consentId` |
| MPI link | `POST /api/v1/patient-identity` |
| MPI lookup | `GET /api/v1/patient-identity/:enterpriseId` |
| Member ID QR verify | `POST /dev/member-verify/token`, `GET /dev/member-verify/:token` |
| Access log | `GET /api/v1/audit?patient_id=` |

Local dev requirements for live ingest:

- API gateway: `AUTH_DEV_MODE=true` (optionally `AUTH_JWKS_ENABLED=true` for real JWT verification)
- Ingestion: `HEALTHEX_API_KEY` / `HEALTHEX_API_SECRET` / project + org IDs
- `PHI_PROCESSING_ENABLED=true`, `HEALTHEX_AUTO_CAPTURE_CONSENT=true` for clinical fetch
- Seed login: `jane.doe@patient.demo` / `DemoPatient1!`
- Ingestion service: `PHI_PROCESSING_ENABLED=true`

Patient role RBAC includes `patient:data:write` for self-initiated HealthEx fetch. Audit queries are restricted to the authenticated patient's ID at the gateway.

### Dev seed account (login / signup testing)

With API gateway `AUTH_DEV_MODE=true`, a seed patient is loaded automatically:

| Field | Value |
|-------|-------|
| Email | `jane.doe@patient.demo` |
| Password | `DemoPatient1!` |
| Patient ID | `patient-seed-demo-001` |
| Enterprise ID | `EP-DEMO-001` |

```bash
pnpm seed:patient-portal   # verify seed + link MPI/consent
```

Dev endpoints (gateway only):

- `GET /dev/patient-accounts/seed` — list seed credentials
- `POST /dev/patient-accounts/register` — signup (dev store)
- `POST /dev/patient-accounts/login` — sign-in validation
- `POST /dev/patient-accounts/verify-email` / `verify-phone` — verification steps

The portal syncs backend dev accounts to localStorage and mints a gateway JWT on login.

## Tech Stack

- **Framework:** Next.js 14 (React 18)
- **Language:** TypeScript
- **UI:** Tailwind CSS 4, shadcn-style components
- **Auth (current):** Local onboarding + shared-ui AuthProvider / gateway JWT mint
- **Auth (target):** SMART on FHIR OAuth 2.0 via API Gateway
- **API (target):** Consent Management Service, Event Processor audit API via API Gateway

## Runtime

| Property | Value |
|----------|-------|
| Local port | `3102` |
| Package | `@trialcliniq/patient-portal` |

## Users

Patients with active or pending research consent; authenticated via identity provider + SMART scopes (production).

## Local Development

```bash
cd frontend/patient-portal
npm install
npm run dev
```

Open [http://localhost:3102](http://localhost:3102).

## Related Documentation

- [Portal UI Progress Report](../../docs/implementation/Portal_UI_Progress_Report.md)
- [HealthEx / TrialClinIQ Boundary](../../docs/architecture/HealthEx_TrialClinIQ_Boundary.md)
- [Security Architecture — Patient-Facing Controls](../../docs/security/TrialClinIQ_Security_Architecture_and_Observability.md#patient-facing-transparency-controls)
