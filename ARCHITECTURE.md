# Architecture

Feature-first React application. Dependency direction is one way: `app -> features -> shared`.

```
src/
  app/            composition root: providers, router, layout, review and briefing-tray context
  features/
    portfolio/    S01 overview, S08 dependency graph and list
    week/         S02 weekly review, S03 releases, S07 release detail
    directory/    S04 directory, S05 programme, S06 project, comparison tray
    findings/     S09 finding panel, owner response form, findings list
    evidence/     S10 evidence dialog
    ask/          S11 investigation screen and run state hook
    decisions/    S12 responses, decisions, actions
    briefing/     S13 briefing preparation
    admin/        S14 sources, S15 definitions
    audit/        audit trail of every change and investigation run
    auth/         sign-in, session identity, directory accounts
  shared/
    api/          in-memory store, read and list APIs (server-style pagination), write APIs split by area
                  (writeApi, reviewWriteApi, recordsWriteApi), audit, session identity, snapshots,
                  definition preview, simulated investigation, query hooks and mutations
    components/   ConditionChip, Legend, PageHeader, SectionCard, StatePanels, KeyValueList, EntityLink, Freshness
    hooks/        useUrlParam
    lib/          formatting, portfolio aggregation rules, role permissions
    types/        domain model, governance records, workflow and audit types
  mock/           illustrative data, one file per subject
  theme/          palette (with condition and nav colours) and MUI component defaults
```

## Key decisions

- URL is the source of truth for selection: `?finding=`, `?evidence=`, `?focus=`, `?item=`, `?release=`, `?tab=`, and the directory's filters and page. Panels survive refresh and navigation.
- Review context (portfolio, comparison snapshot, role) lives in `ReviewProvider`; the briefing tray in `BriefingTrayProvider`.
- Server data is owned by TanStack Query. The "server" is `shared/api/store.ts`; swap `readApi.ts` and `writeApi.ts` for HTTP clients and nothing in `features/` changes.
- Programme position is the worst contributing project condition, never an average (`shared/lib/portfolio.ts`).
- Cost totals use direct records only; shared allocations are reported separately.
- Owner responses carry the finding version; the write API rejects a response against a stale version.
- Graphs are plain SVG with stable layouts; every graph has a list alternative.
- Roles follow the PRD table in `shared/lib/permissions.ts`. Screens hide or disable what a role cannot do, and the write API enforces the same rules using the session identity, never a name passed by a component.
- Every write records an audit entry (user, role, time, evidence version, inputs). Findings, actions and briefings carry versions, and stale writes are rejected.
- Closing a review freezes its content into the snapshot; later corrections are amendments. Earlier reviews are reconstructed once from recorded differences in `mock/workflow.ts`.
- Definitions keep their previous versions; snapshots and published briefings record the versions in force.
- Rules are covered by `shared/api/workflow.test.ts` (`npm test`).

## Journeys and contextual views

- Five destinations (Portfolio, This week, Programmes and projects, Decisions and actions, Briefing) plus an admin group (Sources and quality, Definitions). Old routes redirect: `/dependencies` to the Constraints tab, `/releases` to the This week releases tab, `/ask` and `/audit` to their contextual homes.
- Contextual views open over any page from URL params: `?finding=` (the six-step finding journey), `?evidence=` (full record and version compare), `?ask=&q=` (investigation panel), `?constraint=`, `?release=`.
- `shared/lib/journey.ts` holds the finding lifecycle, impact (confirmed kept apart from inferred), business implication and week-by-week trail. `shared/lib/constraints.ts` holds shared constraints, their trace and the release summary. `shared/lib/assessment.ts` holds the written portfolio assessment, "since last review", programme contribution and the briefing figures. Overview and briefing use the same calculations, and a published briefing freezes its figures.
- Colour marks exceptions only: amber needs attention, red breached. Met and reported are neutral text.

## Design system

- Tokens live in `src/theme/palette.ts` (navy, accent, canvas, borders and four status tints) and `src/theme/index.ts` (Inter type scale with `metric`, `label` and `overline` variants, card radius, elevation, table and tab styling), taken from the customer's reference design.
- The shell is a two-row navy header (logo, breadcrumb, programme scope, search, briefing action, my work, account; then section tabs, the administration menu and source status), the review context strip and a footer. There is no sidebar.
- Shared building blocks in `src/shared/components/ui/`: StatusChip, KpiTile, StageGateTrack, InitiativeCard, AvatarName, FilterChips, SegmentedToggle, ProgressLine, MatrixCard, MatrixPager and the statement chip and frame. Screens compose these rather than styling locally, so every page reads as one product.
- Every figure shown comes from records through the hooks; reference elements with no data behind them are left out rather than invented.
