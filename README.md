# AI Programme and Project Portfolio Intelligence

Stakeholder workspace for GSK's Enterprise Data and AI portfolio: programmes, projects, weekly releases, dependencies, cost, outcomes, governance gates, findings with owner responses, investigations and leadership briefings. Built from the v2 specification (screens S01 to S15). The approach, Microsoft route comparison and reference architecture live in `docs/approach.md` and the companion document, not in the product.

Author: Meraj Akhtar <meraj@aiplanet.com>

## What it covers

| Screen | Where |
|---|---|
| Sign-in (Entra ID account picker stands in for SSO) | `/sign-in` |
| S01 Portfolio overview (matrix, findings, history, snapshot refresh) | `/portfolio` |
| S02 This week (timeline, discussion queue, meeting view, next period, close review) | `/this-week` |
| S03 Weekly releases (timeline, adoption, follow-ups) | `/releases` |
| S04 Directory (search, filters, server-style pagination, comparison tray) | `/directory`, `/compare` |
| S05 Programme detail | `/programmes/:id` |
| S06 Project detail (governance gates, commitment timeline, scope changes, cost and outcomes) | `/projects/:id` |
| S07 Release detail | `/releases/:id` |
| S08 Dependency exploration (graph and accessible list) | `/dependencies` |
| S09 Finding and owner-response panel | `?finding=F-01` on any screen |
| S10 Evidence viewer with version compare | `?evidence=E-09` on any screen |
| S11 Contextual investigation (simulated, with run states and cancellation) | `/ask` |
| S12 Decisions and actions (responses, decisions, aging, updates) | `/decisions` |
| S13 Briefing preparation (tray, canvas, audience preview, status workflow) | `/briefing` |
| S14 Sources and information quality | `/sources` |
| S15 Definitions and reporting configuration | `/definitions` |

## Running it

```
npm install
npm run dev        # http://localhost:3000
npm run build      # typecheck and production build into dist/
npm run preview
```

## Backend

The UI talks to `src/shared/api/readApi.ts` and `writeApi.ts`. In this build those call an in-memory context store (`store.ts`) seeded from `src/mock/`, with request latency, server-style pagination and version checks, so the application behaves as it will against the portfolio context service. Replacing the two API files with HTTP clients is the only change needed to go live; nothing under `features/` knows the difference. State resets on reload until the service is connected.

## Sign-in and roles

Sign-in uses an account picker in place of the Entra ID redirect. The session is kept in `sessionStorage` for the tab. There are five roles from the PRD: portfolio lead, sponsor, project lead, finance, and reporting or data owner. Each lands on its own screen and sees only the actions its role allows; the write API enforces the same rules from the session identity. Every change is recorded in the audit trail.

## Seed data and assumptions

- Seed data is GSK-shaped but invented: four programmes, twelve projects, weekly releases, shared datasets and models, matrix funding by business unit, governance gates. Devon Carlisle appears as the Foundations programme lead; every other name is fictional.
- Reporting date is 12 October 2026 (week 41), compared with the week 40 review.
- Project completion is shown as completed commitments, not a percentage, because no completion method has been agreed.
- Shared cost allocations are excluded from totals until Finance confirms the basis (definition DEF-06).
- The investigation service answers from the context store so every evidence reference resolves; the production service runs the same question types through approved tools on Azure AI Foundry.

## Design

Navy navigation, quiet white reading surface, Google Sans. Colour carries meaning only: amber attention, red breached, teal met, neutral blue reported, hatched grey unknown, purple owner-confirmed. Everything visual goes through `src/theme/`.

See `ARCHITECTURE.md` for the folder layout and `AGENTS.md` for the rules when extending.
