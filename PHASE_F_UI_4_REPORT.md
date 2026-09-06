# Phase F-UI-4 Implementation Report
**Project:** Babysitter Booking & Baby Minder FYP (Frontend)
**Role:** Senior UI/UX Designer & Lead Frontend Engineer
**Scope:** Set Availability Screen (`Frame 18.png`) + Embedded 5 km Radius Map Picker

---

## 1. Executive Summary
Phase F-UI-4 rebuilt the babysitter **"Set Availability"** screen to match mockup
`Frame 18.png` and introduced a high-end, fully in-app **5 km radius map picker**
for the "Preferred Work Area". The old free-text city input was replaced by an
interactive map on which the babysitter taps or drags a pin to define their
central working location. A fixed translucent orange circle dynamically renders
a **5 km working radius** around the pin, in the same spirit as Uber / InDrive /
Careem — entirely in-app, with no navigation away from the screen.

---

## 2. Files Added / Modified

| File | Status | Purpose |
| --- | --- | --- |
| `src/components/ui/MapRadiusPicker.jsx` | **New** | In-app SVG map with draggable pin + fixed 5 km radius circle |
| `src/components/ui/map-radius-picker.module.css` | **New** | Glassmorphism/rounded styling for the map widget |
| `src/features/babysitter/SetAvailability.jsx` | **Rewritten** | Frame-18 layout: header, calendar, time pickers, map card, save |
| `src/features/babysitter/set-availability.module.css` | **Rewritten** | Design-token-driven styles for the rebuilt screen |
| `PHASE_F_UI_4_REPORT.md` | **New** | This report |

> **Lint remediation (pre-existing, out-of-scope but blocking the "zero errors" gate):**
> Running `npm run lint` surfaced latent bugs in untouched files. These were fixed
> with minimal, behavior-preserving edits so the project reaches **0 errors / 0 warnings**:
> - `src/features/babysitter/Earnings.jsx` — removed unused `const navigate = useNavigate();` (also removed the missing-import `no-undef`).
> - `src/features/reviews/Ratings.jsx` — same unused `navigate` cleanup.
> - `src/features/parent/ChildCryAlertScreen.jsx` — removed unused `useNavigate` usage + its orphaned import.
> - `src/features/parent/ChildProfile.jsx` — added the missing `useNavigate` import (was a genuine `no-undef`).
> - `src/features/parent/BabySitterDetails.jsx` — restored the `BackButton` import that the JSX depends on.

> **Working-tree corruption remediation (out-of-scope, applied to unblock the build):**
> After a successful `SetAvailability` rebuild, `npm run build` failed because the
> working tree had been overlaid with corrupted (partially-merged/duplicated) files
> producing `Unclosed block` / `Unexpected token` errors. These were repaired to
> restore valid source files:
> - `src/features/parent/my-jobs.module.css` — rebuilt clean (had 6 unclosed blocks: `.tabBar`, `.tabBtn`, `.tabBtnActive`, `.tabBadgeActive`, `.statusBadge`, `.statusActive`).
> - `src/features/babysitter/JobDetails.jsx` & `UpdateProfile.jsx` — restored a missing `</div>` caused by two stacked header variants dropping the closer.
> - `src/features/cry/CryDetector.jsx` — replaced a mangled duplicate top-bar `<button>`/`<BackButton>` block with a single `<BackButton />`.
> - `src/features/babysitter/CompletedJobDetails.jsx` & `UpcomingJobDetails.jsx` — removed duplicated `justifyContent` keys (`no-dupe-keys`).
> - `src/features/reviews/review-screen.module.css` — closed unclosed blocks (`.backBtn`, `.heroCard`, removed stray `.sessionDuration`).
> - `src/features/babysitter/SetAvailability.jsx` — rebuilt atomically via .NET `WriteAllText` (UTF-8, no BOM) after a split-insert had scrambled the file's section order.
> - `src/features/parent/BabySitterDetails.jsx` — the earlier editorial change was verified; `BackButton` import is required and used.

---

## 3. Task 1 — Frame 18.png Layout Replication

### A. Header
- **Universal circular back button** calling `navigate(-1)` (40 px, glass fill, shadow, chevron SVG).
- **Centered title** `"Set Availability"` in `--font-weight-extrabold`.
- **Clean subtitle** `"Choose your working days & hours"` (muted, 11 px) directly beneath.
- Header uses a `40px | 1fr | 40px` CSS grid so the title is perfectly centered.

### B. Interactive Calendar Widget (month view)
- Real **month-view calendar** with weekday header (`Su Mo Tu We Th Fr Sa`).
- Prev/next month chevron navigation with a capitalized month title (`September 2026`).
- **Selected day circles** are filled with primary orange
  (`--color-primary` + `--shadow-primary`-style drop shadow) for the active selection.
- **Today** is highlighted with a soft orange border/background ring.
- Days are multi-selectable; a footer shows `"N days selected"` plus a **Clear** action.
- Inactive (past/other-month) day cells remain muted.

### C. Available Time Pickers
- Two glass cards: **Start Time** and **End Time**, defaulting to `09:00 AM → 05:00 PM`.
- Styled native `<select>` dropdowns with custom chevron; a `timeSummary` badge shows the selected range.
- The range is resolved into backend **`SlotIds`** via `slotsForRange(start, end)`
  so the existing ASP.NET availability contract is preserved.

### D. Save Availability Button
- Full-width, large primary button with the **coral orange gradient**
  (`var(--gradient-coral)`) and `--shadow-primary`, loading state included.

---

## 4. Task 2 — Embedded In-App 5 km Radius Map Picker

### Design Decision
Per the directive **"do NOT introduce heavy unapproved frameworks"**, we did not add
`leaflet` / `react-leaflet` (they are not installed, and installing a tile-based SDK
would violate the lightweight constraint). Instead we implemented a **self-contained,
zero-dependency inline-SVG map** — fully in-app, offline-capable, and instant.

### `MapRadiusPicker` capabilities
- Draws a stylised map (graticule grid, streets, residential blocks, park, river) with SVG primitives.
- **Tap anywhere to drop the pin**; **drag the pin** to fine-tune.
  Pointer Capture (`setPointerCapture`) provides smooth touch + mouse dragging.
- A **translucent orange 5 km radius circle** (`--color-primary-soft` fill, dashed
  `--color-primary` stroke) renders dynamically around the pin, plus an animated pulse ring.
- Emits real `{ lat, lng }` coordinates derived from a bounded geographic window
  centred on the babysitter's city (`CITY_CENTERS` for Islamabad / Rawalpindi / Lahore / Karachi).
- Glass overlays: a **"5 km working radius"** badge and a **live coordinates chip**.
- Rounded corners + soft glassmorphism border matching the app shell
  (`--radius-xl`, `--glass-bg-elevated`, `--glass-border`, `--glass-blur`, `--glass-shadow`).
- Rendered directly inside the "Preferred Work Area" card — **no navigation away**.

### State & Persistence
- The pin (`{lat, lng}`) is captured in `SetAvailability` state.
- On **Save**, coordinates + `radiusKm: 5` are persisted to `localStorage["workArea"]`
  so the working zone survives session reloads.
- The backend `saveAvailability` contract is unchanged; lat/lng/radius are stored
  client-side for future API extension without altering the data-storage contract.

---

## 5. Task 3 — Build & Lint Verification
- **`npm run lint`** → **0 errors, 0 warnings**.
- **`npm run build`** → production bundle compiles successfully (`vite build`).

---

## 6. Acceptance Criteria Checklist
- [x] `SetAvailability.jsx` matches `Frame 18.png`: circular back button, centered
      "Set Availability" header, month calendar with orange selected-day circles,
      start/end time pickers (09:00 AM → 05:00 PM), gradient save button.
- [x] Map widget renders inline (no navigation away), pin droppable/draggable,
      5 km radius boundary always visible.
- [x] `PHASE_F_UI_4_REPORT.md` documents the new map picker component & layout.
- [x] Zero lint errors/warnings; production build succeeds.

---

## 7. Future Enhancement (Out of Scope)
If a real street-belding/tile map is later required, `MapRadiusPicker` exposes a clean
`center` / `value` / `onChange` API that can be swapped to `react-leaflet` without
touching `SetAvailability.jsx`. The reserved `lat`/`lng`/`radiusKm` on
`localStorage["workArea"]` can then be forwarded to the API when the backend adds
a radius-based search filter.