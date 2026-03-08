# Naming Conventions (Base UI Aligned)

Use these naming rules as project-level rules.
Do not redefine naming rules inside component skills.

## 1. Directory Naming

- Feature/component directories: `kebab-case`
  - examples: `alert-dialog`, `radio-group`, `number-field`, `use-render`
- Package-level helper directories also use `kebab-case` when they represent public feature areas.

## 2. Component and Context File Naming

- Component files: `PascalCase.tsx`
  - examples: `Button.tsx`, `RadioGroup.tsx`
- Context files: `PascalCaseContext.ts` or `PascalCaseContext.tsx`
  - examples: `RadioGroupContext.ts`, `DirectionContext.tsx`
- Provider files: `PascalCaseProvider.tsx` when standalone
  - example: `LabelableProvider.tsx`

## 3. Data Attribute and Type Files

- Data attributes: `PascalCaseDataAttributes.ts` (or `.tsx` when JSX is required)
  - examples: `ToggleDataAttributes.ts`, `ButtonDataAttributes.tsx`
- Shared type buckets: `types.ts`
- Shared constant buckets: `constants.ts`

## 4. Hook and Utility File Naming

- Hook files: `useCamelCase.ts` or `useCamelCase.tsx`
  - examples: `useRender.ts`, `useSwipeDismiss.ts`
- Non-hook utility files: `camelCase.ts`
  - examples: `resolveRef.ts`, `formatNumber.ts`, `stateAttributesMapping.ts`

## 5. Entry and Surface Files

- Public entry point in each feature dir: `index.ts`
- Public parts/slots entry point: `index.parts.ts`
- Internal per-feature state holder file: `store.ts` when appropriate

## 6. Test File Naming

- Behavioral tests: `PascalCase.test.tsx` for component files
- Spec/regression tests: `PascalCase.spec.tsx`
- Utility tests: `camelCase.test.ts` / `camelCase.spec.ts`

Keep this consistent with Base UI naming style.

## 7. Type Declaration Files

- Global declarations: `global.d.ts` at package root `src` when needed
- Declaration helper files use lowercase or camelCase unless they represent a named public type module

## 8. Solid Port Rule

When porting from `../base-ui`, preserve directory naming and file naming shape unless there is a strong Solid-specific reason not to.
If deviating, document the reason in the PR description.

