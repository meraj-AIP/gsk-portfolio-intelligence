# Rules for extending this repository

1. New screen or module: new folder under `src/features/`. Do not grow an existing page file.
2. Files stay under 300 lines; components target 150. Split along data vs presentation.
3. No hex colours in components. Use theme tokens (`condition.*`, `nav.*`, palette) and `sx`.
4. MUI v9 API only: `Grid size={{ }}`, `slotProps`, no system props on Box or Stack.
5. Lists that can grow use server-style pagination through `shared/api/readApi.ts` with URL state.
6. Every data surface has loading, empty, error and success states.
7. Keep reported fact, calculated result and AI interpretation visibly distinct. Never blend them.
8. No em dashes or en dashes in any copy. Plain sentence-case interface text.
9. Author metadata is Meraj Akhtar <meraj@aiplanet.com>. No AI attribution anywhere.
10. Run `npm run build` (typecheck plus build) before calling work done.
