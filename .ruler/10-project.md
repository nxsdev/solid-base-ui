# Project Goal

Build a headless UI library for SolidJS 2 Beta.
Use `../base-ui` as the primary reference for architecture and tests, then re-implement with Solid-native patterns.

# Tech Stack

Use `pnpm` as the package manager.
Use `turbo` for monorepo task execution.
Use `oxlint` for linting and `oxfmt` for formatting.
Lint policy for Solid is `oxlint` + `eslint-plugin-solid` (via `jsPlugins`).
Enforce Solid best-practice rules first (`prefer-for`, `no-destructure`, `no-react-*`).
Add project restrictions for Solid 2 migration (`no-restricted-imports`) and run migration guards in `packages/solid` lint.
Use `Vitest` as the primary testing framework.

# Git Workflow

When creating commits in this repository, use a type prefix in the subject line.
Preferred prefixes are `fix:`, `refactor:`, `feat:`, `test:`, `docs:`, and `chore:`.
Do not create bare commit subjects without one of these prefixes.
