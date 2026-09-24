# Access IT demonstration and .NET handover

This is a frontend proof of concept based on the Access IT guides and a read-only review of the existing demo. Its data model and business rules have not been validated against a backend contract. The intended first integration is staff sign-in and Access IT.

## Five-minute demonstration

1. Sign in with the public `Test` / `Leeds` account. Show the branded login and Remember me. The recovery and activation links are labelled previews and never change credentials.
2. On Overview, open Contractors, then People on site. Combine building and company filters; clear them. Open Attendance history and select a date range. On a phone, show the compact attendance cards and Details.
3. Open Visitors → Add visitor → Pre-book. Use fictional contact details, pick a building and host, and set arrival before departure. “Someone else” exposes an alternative host. Optional details hold location, vehicle and hospitality notes.
4. Edit the booking to show its saved details. Mark arrived, find the visitor in People on site, view their details and pass, then record departure. The visit moves into history. Settings → Email outbox shows prepared notifications; nothing is sent.
5. Open the separate kiosk. During configured working hours, use `contractor1` / `demo`, select a permitted reason and the Energy Centre, complete the required details and RAMS acknowledgement. Show the accepted arrival, its attendance record and the log-off journey. `contractor3` / `demo` demonstrates an insurance refusal. The other cases and working hours are in the collapsed Demo guide on Overview.

Untouched built-in samples refresh their dates on a new local day when the attendance store opens. Visits you create or edit keep their times. Old saved data is preserved; Settings has an explicit reset for a fresh demonstration. Permits/assets remain in-memory fixtures and reset on page reload, as before.

## What is real in this prototype

| Area | Current behaviour | .NET integration to agree |
| --- | --- | --- |
| Sign-in | Public client-side check and expiring browser session; no password stored | Existing identity provider, username rules, cookie/session handling, expiry, sign-out, recovery/activation policy and server token validation |
| Access | Staff route guard and configurable module visibility | Organisation/site context, subscriptions, roles and permissions; enforce every operation on the server |
| Attendance | Browser-local records, filters, arrival/departure and history | Record identifiers, paging/search/filter contract, site timezone, concurrency, validation and authoritative event times |
| Visitor details | Host lookup or alternative name/email; optional location, vehicle and hospitality text | Confirm legacy field meanings and lengths, especially whether hospitality is a flag, service choice or notes; map existing data without losing it |
| Visitor passes | Local pass preview and demonstration links | Server-generated opaque, scoped, expiring tokens; repeat-use behaviour, delivery and printing |
| Entry checks | Configured compliance, working windows, permits and acknowledgements simulated in the client | Existing .NET decisions stay authoritative; agree response reasons and audit records before wiring up the screens |
| Notifications | In-browser outbox only; no transport or timed reminder scheduler | Recipients, templates, trigger points, delivery status, retry/idempotency and scheduled reminders |
| Exports / refresh | Feedback stubs; no real files or server refresh | Supported formats, download endpoints, filter scope and refresh/error behaviour |

## Implementation boundaries

- Replace the mock composables (`useAuth`, `useSiteAttendance`, `useSiteDirectory`, `useAccessItConfig`) with agreed service adapters while keeping the page components and shared form models.
- `AttendanceRecord` currently combines presentation fields with demo data; it is not an asserted copy of the .NET schema. Keep a mapping layer rather than forcing the backend to adopt this type.
- Host and visit location are separate. Hospitality notes are visible in staff details and editing, but are not printed on a pass or inserted into notification templates.
- Preserve existing configuration, permit and access decisions. A clearer screen must not silently change who can enter or which acknowledgement is required.
- Add server loading, unavailable, expired-session, validation and conflict states against the actual contract. Do not connect public demo credentials or browser-local authorisation to production data.

## Verification

Run `npm run lint`, `npm run typecheck`, `npm test` and `npm run generate`. Pull requests run these checks automatically, including generation under the GitHub Pages base path. Automated tests cover session expiry, combined attendance filters/date boundaries, sample refresh preservation, visitor field round-trips and timing validation.

Browser checks should cover desktop and 390px phone layouts, login errors/recovery previews, combined attendance filters, a visitor pre-book → edit → arrive → depart → reload sequence, plus accepted/refused contractor journeys. UI screenshots and a review report are held locally rather than publishing screenshots of the existing system.
