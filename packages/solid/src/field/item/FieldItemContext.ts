import { createContext, useContext, type Accessor } from "solid-js";

export interface FieldItemContextValue {
  disabled: Accessor<boolean>;
}

export const FieldItemContext = createContext<FieldItemContextValue>({
  disabled: () => false,
});

export function useFieldItemContext(): FieldItemContextValue {
  return useContext(FieldItemContext);
}
