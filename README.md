# SoterWeb frontend

A modern frontend proof of concept for SoterWeb, an Integrated Workplace Management System. It rebuilds the login flow, the Organisations screen and the Access IT module with Nuxt 4, TypeScript, Tailwind CSS, shadcn-vue patterns, Reka UI primitives, and TanStack Table.

This version is intentionally frontend-only. Authentication, organisations, attendance, configuration, exports and emails are mocked to demonstrate the interaction design before connecting the .NET API.

## Run locally

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Use the public demo account: `Test` / `Leeds`.

The demo uses client-side mock authentication only. These credentials are public and must not be reused outside this visual proof of concept.

## Checks

```bash
npm run lint
npm run typecheck
```

## Included demo flow

- Login with persistent mock authentication
- Organisations table with global search, sortable columns, active-only filtering, pagination, and labelled row actions
- Add and edit organisation dialog backed by a mock store
- Stubbed XLSX export, PDF export, and refresh feedback ready to connect to the future API

## Access IT module

Access IT records who is on site, where they are working and what they are doing. Two groups use it differently, so it has two entry points.

### Public kiosk (`/site-access`)

Contractors and visitors reach these screens through a dedicated address and never see the wider system. No sign-in is needed.

- `/site-access` holding screen
- `/site-access/login` contractor log on: credentials or anonymous access, reason for attendance, acceptance message, work details, the five compliance checks (induction, insurance, accreditation, operative certification, RAMS), the core-hours and flex-period working window, asbestos and RAMS acknowledgements, and potential permit conflicts
- `/site-access/logout` contractor log off: log off options, permit suspend or close, and asset register updates for designated PPM contractors
- `/site-access/visitors` visitor self-service log on and log off, plus the one-click links carried in emailed passes

Demo contractor accounts all use the password `demo`:

| Username | Demonstrates |
| --- | --- |
| `contractor1` | Passes every check; RAMS acknowledgement; asset register update at log off (Energy Centre) |
| `contractor2` | Asbestos acknowledgement in flagged buildings; permit conflicts at Priory House |
| `contractor3` | Denied: organisation insurance expired |
| `contractor4` | Denied: induction expired |
| `contractor5` | Organisation approved for out-of-hours work |
| `contractor6` | Denied: operative certificate expired |
| `contractor7` | Holds an out-of-hours permit at the Library |
| `contractor8` | Denied: organisation RAMS expired |

Anonymous log on uses company codes such as `AQUA` or `ASM` and the verification code held in the system parameters (default `34ABCD`). The module home at `/access-it` lists these demo details for whoever is running a demonstration; the public kiosk does not show them.

### Staff screens (`/access-it`)

Signed-in staff manage the module from inside the application.

- `/access-it` module home with RAG dashboard tiles
- `/access-it/people-on-site` everyone currently on site, with history and the Send List emergency function
- `/access-it/visitors` reception screen to pre-book, register, edit, log off and print passes for visitors
- `/access-it/settings` the 32 system parameters, 26 eNotes and 12 email automations that govern the module, plus a log of emails the module would have sent

### How it fits together

- `app/types/access-it.ts` mirrors the legacy data shapes so the mock stores can be swapped for the API.
- `app/lib/access-it/compliance.ts` holds the pure decision rules (compliance checks, working window, acknowledgements, conflicts).
- `app/composables/useAccessItConfig.ts`, `useSiteDirectory.ts` and `useSiteAttendance.ts` are the mock stores. Configuration and attendance persist to localStorage so a kiosk tab and a staff tab stay in step; Module settings has a reset. Permits and assets are rebuilt from fixtures on every load so their dates stay relative to today.
- Emails are written to an on-screen outbox rather than sent. The four timed reminders (still on site after core hours, expected log off warnings) need a scheduler, so they never fire in the demo.
