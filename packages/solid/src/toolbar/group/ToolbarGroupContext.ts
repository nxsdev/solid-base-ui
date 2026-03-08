import { createContext, useContext, type Accessor } from "solid-js";

export interface ToolbarGroupContextValue {
  disabled: Accessor<boolean>;
}

export const ToolbarGroupContext = createContext<ToolbarGroupContextValue | null>(null);

export function useToolbarGroupContext(optional: true): ToolbarGroupContextValue | null;
export function useToolbarGroupContext(optional?: false): ToolbarGroupContextValue;
export function useToolbarGroupContext(optional = false) {
  const context = useContext(ToolbarGroupContext);

  if (context === null && !optional) {
    throw new Error(
      "ToolbarGroup context is missing. Toolbar parts must be placed within <Toolbar.Group>.",
    );
  }

  return context;
}
