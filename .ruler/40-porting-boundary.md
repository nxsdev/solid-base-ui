# Porting Boundary Rule

Before implementing any component migration, read `PORTING_PLAN.md`.
Also treat Solid 2 migration as primary framework reference:
`https://github.com/solidjs/solid/blob/next/documentation/solid-2.0/MIGRATION.md`

Treat `PORTING_PLAN.md` as the source of truth for:

- what must be ported with parity
- what must be adapted to Solid architecture
- what must not be ported 1:1 from React internals

Do not start implementation if the target area is not categorized in `PORTING_PLAN.md`.
Before implementation, review `.ruler/20-implementation.md` (Known Repeated Failures) and apply it.
