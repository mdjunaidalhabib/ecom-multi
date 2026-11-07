# ECMS Lead Generation

The Bengali lead form is on a dedicated campaign page at `/contact`. Every pricing
card's former WhatsApp CTA is now a professional “বিস্তারিত জানুন” link that
opens `/contact?plan=Business` (or the corresponding plan). The additional third
button and the inline home-page form have been removed. Existing checkout,
general WhatsApp/contact links, authentication and trial links remain in place. Reseller Pro maps to
the requested Reseller lead category; unrecognized custom catalog plans map to
Custom.

## API

The existing Next.js catch-all proxies expose backend paths under `/api`.

| Backend endpoint | Access | Behavior |
| --- | --- | --- |
| `GET /leads/form-token` | Public | Issues a signed, non-cacheable anti-spam token |
| `POST /leads` | Public | Validates and saves a lead; returns `success` and `eventId` |
| `GET /admin/leads` | Super Admin | Paginated search and filters |
| `GET /admin/leads/summary` | Super Admin | Global total and counts for all six statuses |
| `PATCH /admin/leads/:id` | Super Admin | Updates status and/or appends an authored note |

Create payload: `name`, `phone`, `businessStatus` (`New Business` or
`Existing Business`), `interestedPlan` (`Starter`, `Business`, `Custom`,
`Reseller`), optional `message`, UUID v4 `eventId`, `formToken`, empty honeypot
`website`, and optional `attribution` object. Attribution stores `utm_source`,
`utm_medium`, `utm_campaign`, `utm_term`, `utm_content`, and `fbclid`.

The form remembers campaign attribution in sessionStorage for up to 24 hours.
The home page also captures attribution and carries it into pricing-to-lead
links, preserving UTM parameters and fbclid across the page navigation. Ads can
link directly to `/contact` or `/contact?plan=Business&utm_source=facebook&utm_medium=paid_social&utm_campaign=business_launch`.
Plan selection is optional in the URL, required in the submitted form, and
validated against the four supported categories. The campaign page reuses the
existing platform GTM container and the shared platform navbar, including the
“ফ্রি পরামর্শ” link on desktop and mobile with an active-page indicator. Home,
pricing and other navigation links remain available from this page.
The consultation link is the last navbar item. The contact page also reuses
the full shared home-page footer (`PlatformFooter`).
The form uses compact responsive typography and a separate card header.
Required markers are red. Client validation highlights empty/invalid fields,
focuses the first invalid control, and shows a Bengali error toast. Editing a
field clears its highlight; a later submit validates it again. Phone validation
accepts Bangla digits and the same Bangladesh mobile format as the backend.
Success and API failures also show scoped toasts without affecting Pixel timing.
Bangla and English Bangladesh mobile numbers normalize to `+8801…`.
Names/messages/attribution have length and type limits; submitted status and
notes are ignored. Public request bodies are limited to 16 KB.

The signed token requires a minimum two-second form age, expires after two
hours, and refreshes automatically while the form is open. A hidden honeypot
rejects automated submissions. MongoDB-backed counters allow five POST
attempts per IP per fixed 15-minute window, shared across backend workers.
The IP is stored only as an HMAC. Counter documents expire through a TTL index.
Rate limiting fails closed if MongoDB is unavailable. Existing `trust proxy`
configuration is reused; ingress must replace untrusted forwarding headers and
the backend should only be reachable through its trusted ingress.

The `eventId` unique index prevents duplicate records during concurrent retries.
Retries with the same ID and fields return the original success response;
reusing an ID with changed fields returns 409. No lead identifiers, contact data,
or notes are returned from public endpoints.

Admin list query parameters: `search` (literal name/phone search, max 100
characters), `status`, `plan`, `businessStatus`, `page` (20 results/page).
Update body: `{ "status": "Contacted", "note": "Call tomorrow" }`; either
field can be supplied independently. Notes append atomically with the acting
admin ID and timestamp. Statuses are New, Contacted, Interested, Follow-up,
Converted, and Not Interested. These routes use existing `protect` and
`superAdminOnly`, ahead of tenant middleware. Shop/institution admins and staff
cannot read or update leads even through a direct API call.

The Super Admin page is `/leads`, inside the existing `(panel)` layout and
navigation, protected by the existing session proxy. It includes search, status,
plan/business filters, pagination, notes, telephone and WhatsApp links, loading,
empty and error states, and existing dark-mode styles.
Dashboard stays first in the sidebar; Leads is near the bottom, before Profile.
The dashboard includes Total, New, Follow-up and Converted counts with links
to the corresponding filtered Leads page. Counts are obtained through the
Super-Admin-only summary endpoint and remain available independently of shop
dashboard requests. The Leads page uses compact rows with quick status updates
and WhatsApp/call links; messages, campaign data and note editing expand only
when requested. Summary cards also act as status filters. Failed saves retain
the user's draft note and show an error.

## Meta Pixel and GTM configuration

The repository already loads a platform GTM container configured through
Super Admin → ECMS Tracking. No direct Pixel initialization or CAPI sender was
found in the existing source. No new Pixel ID, token or external service is
introduced. The remote GTM container configuration has not been changed.

Only after a successful save response, the form:

1. Reuses `window.fbq` when present:
   `fbq('track', 'Lead', { content_name: plan }, { eventID: eventId })`.
2. Pushes a GTM dataLayer event:
   `{ event: 'ecms_lead', event_name: 'Lead', event_id: eventId,
   interested_plan: plan, browser_pixel_sent: true/false }`.

To deliver the browser event through the existing GTM container when no `fbq`
is available yet, configure a Custom Event trigger for `ecms_lead`, restricted
to `browser_pixel_sent` equal to boolean `false`. Map the dataLayer `event_id`
to the Meta tag's Event ID and use event name `Lead`. The Meta base tag must
initialize before that event tag. Do not also fire a Lead on button clicks or
generic form-submit triggers. When `browser_pixel_sent` is true, GTM must skip
its browser Lead tag to avoid a second delivery.

If the container also forwards events through server-side GTM / CAPI, use
`event_name: Lead` and exactly the same `event_id` for that server event and
the same Pixel/dataset ID as the browser. This is the deduplication contract;
do not generate a second ID on the server. No CAPI sender or credentials have
been added because none exists in this checkout. Existing remote tags must be
configured to follow this mapping before claiming live Meta/CAPI delivery.
Contact details and messages are never pushed into dataLayer.

Failed validation, spam, rate limits, storage failures, ordinary page loads and
CTA clicks do not invoke this Lead tracking code. Analytics blockers/errors
cannot change the form's saved success state.

## Files

Changed:

- `backend/server.js` — scoped public body limit and JSON errors.
- `backend/src/routes/public/index.js` — platform-level lead route mount.
- `backend/src/routes/admin/index.js` — protected global lead management mount.
- `frontend/components/platform/PlatformLanding.jsx` — form and plan CTAs.
- `frontend/components/platform/PlatformHeader.jsx` — shared consultation navigation.
- `super-admin/components/menuConfig.jsx` — Leads navigation.
- `super-admin/src/app/(panel)/dashboard/page.jsx` — lead summary and management links.

Added:

- `backend/src/models/Lead.js`
- `backend/src/models/LeadRateLimit.js`
- `backend/src/services/leadValidation.js`
- `backend/controllers/lead.controller.js`
- `backend/src/routes/public/leads.routes.js`
- `backend/src/routes/admin/leads.superadmin.routes.js`
- `backend/tests/leads.test.js`
- `backend/tests/leads.browser.mjs`
- `frontend/components/platform/LeadForm.jsx`
- `frontend/lib/leadGeneration.js`
- `frontend/src/app/contact/page.jsx`
- `super-admin/components/Leads.jsx`
- `super-admin/components/LeadOverview.jsx`
- `super-admin/src/app/(panel)/leads/page.jsx`
- `LEAD_GENERATION.md`

## Verification

From `backend`: `node --test tests/leads.test.js`.
From `frontend` and `super-admin`: `npm run build` (`npm.cmd` on PowerShell
systems that block npm.ps1).
After both builds, from `backend`: `node tests/leads.browser.mjs`.
Browser verification requires the already-installed Playwright Chromium.
The browser harness temporarily uses loopback ports 33101 and 33102 and cleans
up its own processes. It blocks external browser requests and uses an isolated
in-memory API with the real lead routes/controllers/auth middleware.

Tests do not load the backend `.env`, start `backend/server.js`, connect to
MongoDB or alter production data. The API tests substitute model methods and
cover validation, authorization, attribution, atomic note updates, filtering,
retry/race behavior, rate limiting and failure responses. Actual MongoDB index
creation and live Meta receipt require verification in a separate staging
environment. The new collections are `leads` and `leadratelimits`; normal
Mongoose model initialization creates their indexes when the backend is run
with index creation enabled. Environments that disable `autoIndex` must create
the declared unique, TTL and query indexes through their normal release process.

No deployment, push, migration or production data write is part of this work.

Verification completed locally: all 14 Node tests passed; frontend and
Super Admin production builds passed; the browser harness passed mobile and
desktop layout, all four plan selections, UTM/fbclid capture, save failure and
retry, successful Pixel event ID, GTM fallback, auth redirects, search, status
and notes. `node --check` passed for changed backend entry/controller/validation
files, and `git diff --check` passed. Existing warnings about the frontend
middleware convention, baseline-browser-mapping data, and duplicate Shop
schema indexes were observed; they did not fail these checks.

After moving the form to `/contact`, the frontend production build and updated
browser harness passed again. The browser check additionally confirmed that
the home page has no form or extra third pricing CTA, checkout links remain,
all four plan links preselect correctly, invalid plan URLs leave the selection
empty, and both home-to-lead navigation and direct ad links retain attribution.

The compact Super Admin update passed its production build and browser checks
for collapsed rows, expanded note editing, status updates, dashboard lead totals
and dashboard-to-filtered-list navigation. The summary endpoint also passed
authorization and aggregation contract tests using isolated model substitutes.
