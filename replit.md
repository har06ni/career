# CareerAI

An AI-powered career platform connecting students, mentors, and companies — with role-based dashboards, job matching, mentor booking, courses, and AI career analysis.

## Run & Operate

- `pnpm --filter @workspace/api-server run dev` — run the API server (port 5000)
- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from the OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- Required env: `DATABASE_URL` — Postgres connection string, `SESSION_SECRET` — HMAC JWT secret

## Stack

- pnpm workspaces, Node.js 24, TypeScript 5.9
- Frontend: React + Vite, shadcn/ui, Tailwind CSS, Framer Motion, Wouter routing, TanStack React Query
- API: Express 5
- DB: PostgreSQL + Drizzle ORM
- Validation: Zod (`zod/v4`), `drizzle-zod`
- API codegen: Orval (from OpenAPI spec)
- Build: esbuild (CJS bundle)

## Where things live

- DB schema: `lib/db/src/schema/index.ts`
- OpenAPI spec (source of truth for API contract): `lib/api-spec/openapi.yaml`
- Generated API hooks + Zod schemas: `lib/api-client-react/src/generated/`
- Custom fetch (injects Bearer token): `lib/api-client-react/src/custom-fetch.ts`
- Auth middleware: `artifacts/api-server/src/middlewares/auth.ts`
- API routes: `artifacts/api-server/src/routes/`
- Frontend pages: `artifacts/career-ai/src/pages/` (student/, company/, mentor/, public/)
- App router: `artifacts/career-ai/src/App.tsx`
- Auth context: `artifacts/career-ai/src/contexts/AuthContext.tsx`

## Architecture decisions

- **Custom HMAC-SHA256 JWT** (no library) — secret from `SESSION_SECRET` env var; token stored in localStorage, sent as `Authorization: Bearer <token>` header.
- **Password hashing** — SHA256 + static salt `"careeraisalt"` (simplified for MVP; swap for bcrypt in production).
- **JSON arrays in DB** — skills, projects, certifications stored as `text` columns with JSON.stringify/parse; Drizzle doesn't support native array columns in all dialects.
- **Contract-first API** — OpenAPI spec drives Orval codegen for both React Query hooks and Zod validators; never edit generated files directly.
- **Role-based routing** — Three roles (student, company, mentor) determined at login; `ProtectedRoute` component gates pages and redirects mismatched roles.

## Product

- **Students**: AI career score + recommendations, skill gap analysis, resume analyzer, job marketplace with 1-click apply, course catalog with enrollment tracking, mentor marketplace with session booking.
- **Companies**: Post/manage job listings, browse candidate profiles, review and update application statuses (shortlist/hire/reject).
- **Mentors**: Manage session requests (accept/decline/complete), set pricing & availability, update profile.
- **All roles**: Personalized dashboard with metrics, profile editing, settings.

## Seed credentials

- Student: `alex@student.com` / `password123`
- Company: `hr@techcorp.com` / `password123`
- Mentor: `james@mentor.com` / `password123`

## User preferences

_Populate as you build — explicit user instructions worth remembering across sessions._

## Gotchas

- Always run `pnpm run typecheck:libs` after changing `lib/db` schema before typechecking API server — stale lib declarations cause TS2305 "no exported member" errors.
- Route params (`req.params.X`) in Express 5 are typed `string | string[]` — always cast with `as string`.
- Routes with path params must come AFTER specific sub-routes (e.g. `/mentors/profile` before `/mentors/:mentorId`).
- Do NOT run `pnpm dev` at workspace root — use `restart_workflow` or the workflow panel instead.

## Pointers

- See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details
