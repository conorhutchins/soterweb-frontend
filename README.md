# SoterWeb frontend

A modern frontend proof of concept for SoterWeb, an Integrated Workplace Management System. It rebuilds the login flow and Organisations screen with Nuxt 4, TypeScript, Tailwind CSS, shadcn-vue patterns, Reka UI primitives, and TanStack Table.

This first version is intentionally frontend-only. Authentication, organisations, exports, and refresh are mocked to demonstrate the interaction design before connecting the .NET API.

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
