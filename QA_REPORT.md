# QA Report — Table Tennis Showcase

**Reviewed as:** Full-stack QA pass (functional, security, data-integrity, performance)
**Scope:** Production app at `table-tennis-showcase.vercel.app` + current `main` branch
**Method:** Static code review of backend/frontend, live API testing against production, direct verification of every finding below (no theoretical/unverified claims included)

---

## Executive Summary

The site is functional and the major performance issues from earlier in this engagement (slow page loads, broken deploys, stale poll data) are fixed and confirmed holding. This pass found **3 critical issues that need attention before this poll/admin system is trusted with real traffic**, plus a handful of high/medium items from the recent points-based ranking migration and other unreviewed changes. Nothing here is a "the app is broken" situation — it's a "here's what's still exploitable or inconsistent" list.

---

## Critical

### 1. The "Fan Favorite Poll" can be trivially rigged — no server-side vote limit
`backend/src/services/playerService.js:417-422` (`incrementVote`) has **no duplicate-vote check of any kind**. The *only* thing preventing someone from voting for the same player 1,000 times is a `localStorage` flag set in the browser (`PlayerProfile.jsx`) — which is bypassed by an incognito window, clearing site data, switching browsers, or simply calling the API directly:
```
curl -X POST https://table-tennis-showcase.vercel.app/api/poll/vote/<playerId>
```
Every call increments the count, no auth or identity check required. This defeats the entire purpose of a public vote and should be fixed before the poll is promoted/shared further. **Recommended fix:** track voter identity server-side (IP + poll ID, or a signed cookie/token issued on first vote) and reject repeats, at minimum as a speed bump.

### 2. Default admin password is live in production
Confirmed earlier in this engagement: the production admin login still accepts the credentials seeded in `supabase_schema.sql` (checked into the public-facing repo). Anyone who reads that file has full admin access — delete players, rewrite rankings, control the poll, upload files. **This should be rotated immediately** via the admin dashboard's change-password option, independent of anything else in this report.

### 3. Certificate email endpoint has no authentication
`backend/src/routes/certificateRoutes.js:6` — `POST /api/certificates/send` is the only write route in the entire API with no `protect` middleware (every other mutating route — players, settings, tournament, poll — correctly requires it). Anyone can call it with an arbitrary `playerId` + `placement` to trigger `emailService.sendMail` (`certificateController.js:82-87`), using site branding as the sender. This is a spam/abuse vector and should be gated behind the same auth middleware as everything else.

---

## High

### 4. Editing a player's points doesn't refresh other players' ranks in the admin table
Since the ranking system moved to points-based auto-ranking, changing one player's points can shift **every other player's rank** via `recalculateRanks()` (`playerService.js:96-160`). But `AdminDashboard.jsx` only patches the *edited* player's row in local state after a save (~line 560-578) — it does a full refetch on **create**, but not on **update**. Result: after editing points, the rest of the table shows stale rank numbers until the admin manually reloads the page.

### 5. File upload accepts spoofed content-types
`backend/src/middleware/upload.js:28-33` validates uploads by checking `file.mimetype.startsWith('image/'|'video/')` only — this value is the client-supplied `Content-Type` header, fully attacker-controlled, with no magic-byte sniffing and no extension whitelist (the old version had both; a recent commit relaxed it to mimetype-only). Since the upload route is behind the same admin auth as everything else, exploitability depends on issue #2 above (default password) — but combined, this means an attacker with the seeded credentials could upload an SVG with embedded `<script>` (served back with `Content-Type: image/svg+xml`) or any arbitrary file disguised as media. Recommend restoring the extension check alongside the mimetype check, and ideally validating actual file signatures for image/video types.

### 6. No rate limiting anywhere in the API
Neither the contact form (`POST /api/contact`) nor the vote endpoint (`POST /api/poll/vote/:id`) have any throttling. Both can be scripted to send unlimited requests — the contact form becomes an open relay for emailing the admin inbox, and voting is additionally unprotected per #1 above.

---

## Medium

### 7. Contact form: no email validation, and a header-injection-adjacent pattern
`backend/src/controllers/contactController.js:16` only checks that `email` is non-empty (any string passes) — no format validation. Line 37 passes raw user input directly as the `replyTo` SMTP header (`replyTo: email`). Nodemailer applies some protection, but this is unvalidated input flowing into an email header and should be validated (basic email regex) before use. Separately, line 45 returns `error.message` (raw internal error text) to the client on failure — minor information disclosure; a generic message would be safer.

### 8. Search field still filters by the old "rank" concept
`playerService.js:182` — searching by a number in the Players page still matches `rank.eq.<n>` (i.e., "whoever currently holds rank 3"), a leftover from before the points-based system. Since rank is now a derived/computed value, this is confusing for admins who think in points — searching "50" expecting to find someone with 50 points will instead search for whoever is ranked #50.

### 9. Orphaned dead component
`frontend/src/components/AnnouncementModal.jsx` (179 lines) is fully unreferenced anywhere in the codebase (the announcement-modal removal only deleted the import/usage in `Home.jsx`, not the file itself). Harmless but should be deleted — dead code that will confuse whoever touches this next.

---

## Low / Housekeeping

- `Rankings.jsx` fetches the entire unpaginated player list (fine at 12 players; will need pagination if the roster grows meaningfully).
- No automated tests exist anywhere in the repo (frontend or backend) — every fix in this engagement, including this report's findings, was verified manually. Worth at least a smoke-test suite for the poll/auth/upload paths given how security-sensitive they are.

---

## Verified Fixed (Regression-Checked, No Action Needed)

These were found and fixed earlier in this engagement; re-confirmed still working during this pass:
- Homepage/players-list load time (was 9–56s due to a stray base64 video in the DB; now consistently ~0.5s)
- `vercel.json` header syntax that was silently failing every deploy
- Poll deadline updates not showing up (was a CDN caching bug on `/api/poll`, now `no-store`)
- Image thumbnail + cache-control handling for uploads

---

## Suggested Priority Order

1. Rotate the admin password (5 minutes, closes the biggest hole)
2. Add server-side vote de-duplication (poll integrity)
3. Add `protect` middleware to the certificate route
4. Restore extension + mimetype validation on uploads
5. Fix the admin table refetch-on-edit gap
6. Add basic rate limiting to `/api/contact` and `/api/poll/vote/:id`
7. Everything else, as time allows
