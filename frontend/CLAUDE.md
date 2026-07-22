# FitPoly

Fitness tracking + sports equipment booking site for polytechnic students, built in collaboration with the Sports Affair (sports club). This file is a brief for picking the project back up — the frontend is fully built (mocked data throughout); the backend doesn't exist yet.

## Stack

- **Frontend**: React 18 + Vite, Bootstrap 5.3, plus a Tailwind-color CSS variable extension (`src/tailwind-colors.css`) for brand colors Bootstrap's own palette doesn't cover (teal/orange/amber).
- **Backend**: Django Ninja — not built yet. Every call the frontend needs is marked with a `// TODO:` comment in the relevant file, with the intended method/path/payload already sketched.
- **No shared frontend state yet** — see "Known limitation" below before changing anything data-related.

## Design system

- **Fonts**: Teko (display/headings), Inter (body), Space Mono (labels, stats, monospace bits) — loaded via Google Fonts in `index.html`.
- **Brand colors**: CSS vars from `tailwind-colors.css` — `--tw-teal-700` (primary/court), `--tw-orange-500` (accent/whistle), `--tw-amber-400` (highlight/gold).
- **Shared tokens**: `src/theme.js` exports `fontDisplay`, `fontMono`, `orangeBtnVars`, `tealCheckVars` — reused on every page instead of a custom stylesheet.
- **Styling approach**: fully inline Bootstrap utility classes + Tailwind color vars. No per-component CSS files — only `src/index.css` for a minimal global reset (Bootstrap's Reboot already does most of the work).
- Buttons are recolored per-instance via Bootstrap 5.3's `--bs-btn-*` CSS variable API rather than bespoke classes.
- Modals are plain React-state-controlled overlays (not Bootstrap's JS bundle) — only Bootstrap's CSS is imported, not its JS, so keep doing it this way rather than adding `bootstrap.bundle.js` for one dialog.

## Pages

**Student/staff-facing** (`src/pages/`):
- `Onboarding` (`/`) — 4-slide intro carousel
- `Register` (`/register`) — student/staff toggle; includes gender/height/weight (feeds BMI) + ID card photo upload
- `Login` (`/login`) — single form, username field doubles as Matrix No. or Staff ID
- `ForgotPassword` (`/forgot-password`)
- `Equipment` (`/equipment`) — booking grid + slot modal (see lifecycle below)
- `StepTracker` (`/steps`) — live mock tracking session, weekly chart
- `BookingHistory` (`/bookings`) — the current user's own bookings
- `Guide` (`/guide`) — BMI & Diet Guide + Exercise Guide, two-section toggle
- `ChatRewards` (`/chat`) — AI chat (currently canned keyword replies), announcements, journal, daily rewards/streak

**Admin-facing** (`src/pages/Admin/`, all wrapped in the `AdminShell` sidebar):
- `AdminSetup` (`/setup`) — one-time first-run admin account creation, with auto-generated company abbreviation
- `AdminLogin` (`/admin/login`)
- `AdminDashboard` (`/admin/dashboard`) — KPIs, pending ID verifications, today's bookings
- `AdminEquipment` (`/admin/equipment`) — catalogue CRUD only (name/icon/listed) — **not** booking status, see below
- `AdminBookings` (`/admin/bookings`) — approve/cancel/complete bookings; this is where the ID-card process actually happens
- `AdminUsers` (`/admin/users`) — view and verify registered users
- `AdminContent` (`/admin/content`) — edit BMI/Diet guidance posts + Exercise tutorials CRUD

## Equipment booking lifecycle (the important business logic)

Two fixed bookable slots per equipment item, plus a disabled weekend slot:
- Monday & Thursday, 5:00–6:30 PM
- Tuesday/Wednesday/Friday, 5:00–7:00 PM
- Saturday & Sunday — shown but disabled ("not ready yet")

**Availability is tracked per slot, not per equipment item** — booking one slot leaves the other bookable on the same item.

Every booking goes through a 4-status lifecycle tied to a real physical process: the borrower must hand their Matrix/Staff ID card to the Sports Affair counter before the item is released.

1. **pending** — booked on the system; card not yet surrendered; item **not** released
2. **active** — admin collected the card and released the item (`AdminBookings` → "Approve")
3. **completed** — item and card both returned (`AdminBookings` → "Complete")
4. **cancelled** — card never surrendered, or called off (only allowed from `pending`)

This logic lives in `EquipmentBooking.jsx` (student), `BookingHistory.jsx` (student), and `AdminBookings.jsx` (admin). The backend's `Booking` model should have: equipment FK, slot enum (`mon-thu` / `tue-wed-fri`), borrower FK, status enum (as above), timestamps.

## Known limitation — no shared state yet

Every page seeds its **own local mock array** via `useState` (bookings, equipment, users, etc.) — there is no shared store or context. Booking something on the student `Equipment` page will **not** show up in `AdminBookings` in this demo; they're independent datasets. This is intentional for a frontend-only prototype, and is exactly what wiring up the real API calls (all marked `TODO`) is meant to fix. Don't paper over it with a frontend-only global store unless specifically asked — the plan is a real backend.

## Backend TODOs

Search the codebase for `// TODO:` — each one marks a specific endpoint, e.g.:

- `POST /api/setup/admin`, `GET /api/setup/status`
- `POST /api/register` (multipart/form-data — includes the ID photo file), `POST /api/login`, `POST /api/admin/login`
- `POST /api/password-reset`
- `GET /api/equipment`, `POST` / `PATCH` / `DELETE /api/admin/equipment/:id`
- `POST /api/bookings`, `PATCH /api/admin/bookings/:id` (approve / cancel / complete), `PATCH /api/bookings/:id` (student self-cancel while pending)
- `GET /api/admin/users`, `POST /api/admin/users/:id/{approve,reject}`
- `PATCH /api/admin/content/bmi/:category/:postKey`, CRUD `/api/admin/content/exercises`
- `POST /api/steps/sessions`
- `POST /api/journal`, `POST /api/rewards/daily-claim`
- `POST /api/chat` (currently keyword-matched canned replies in `ChatRewards.jsx`)

## Suggested next steps

1. Scaffold the Django Ninja backend with models matching the shapes implied above (especially `Booking`, since its lifecycle is the trickiest part).
2. Wire up real endpoints, replacing the `TODO`s one page at a time.
3. Add real auth/session handling — right now "the logged-in user" is a hardcoded mock (`CURRENT_USER` in `EquipmentBooking.jsx`, etc.).
4. Once real endpoints exist, consider a shared data-fetching layer (e.g. TanStack Query) to replace the per-page local mock state described above.
