# Summary

- Component family:
- Scope of this PR:

# Porting Checklist File

- [ ] Created or updated `porting/checklists/<component-family>.md` from `porting/checklists/_template.md`
- Checklist path:

# Required Checks

- [ ] Mapping doc updated (`porting/<component-family>-mapping.md`)
- [ ] Decision log updated (`porting/IMPLEMENTATION_DECISIONS.md`)
- [ ] Export surface updated (`packages/solid/src/index.ts`, `packages/solid/package.json` when needed)
- [ ] No `any` and no unsafe assertion chains
- [ ] No React-internal compatibility wrappers added

# Verification

- [ ] `pnpm --filter @solid-base-ui/solid test -- '<component test glob>'`
- [ ] `pnpm --filter @solid-base-ui/solid typecheck`
- [ ] `pnpm --filter @solid-base-ui/solid lint`
- [ ] `pnpm --filter @solid-base-ui/solid format`

# Added / Omitted / Deferred

## Added

-

## Omitted

-

## Deferred

-

# Risks

- Risk level: `low | medium | high`
- Remaining risks:
- Follow-up PRs:
