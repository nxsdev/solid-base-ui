import { createContext, useContext } from "solid-js";

export interface FieldsetRootContextValue {
  disabled: () => boolean;
  setLegendId: (id: string | undefined) => void;
}

export const FieldsetRootContext = createContext<FieldsetRootContextValue | null>(null);

export function useFieldsetRootContext(optional?: false): FieldsetRootContextValue;
export function useFieldsetRootContext(optional: true): FieldsetRootContextValue | null;
export function useFieldsetRootContext(optional = false): FieldsetRootContextValue | null {
  const context = useContext(FieldsetRootContext);

  if (context === null && !optional) {
    throw new Error(
      "FieldsetRoot context is missing. Fieldset parts must be placed within <Fieldset.Root>.",
    );
  }

  return context;
}
