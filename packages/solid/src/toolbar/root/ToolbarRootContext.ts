import { createContext, useContext, type Accessor, type Setter } from "solid-js";
import type { Orientation } from "../../types";
import type { CompositeMetadata } from "../../composite/list/CompositeList";

export interface ToolbarRootContextValue {
  disabled: Accessor<boolean>;
  orientation: Accessor<Orientation>;
  setItemMap: Setter<Map<Element, CompositeMetadata>>;
}

export const ToolbarRootContext = createContext<ToolbarRootContextValue | null>(null);

export function useToolbarRootContext(optional: true): ToolbarRootContextValue | null;
export function useToolbarRootContext(optional?: false): ToolbarRootContextValue;
export function useToolbarRootContext(optional = false) {
  const context = useContext(ToolbarRootContext);

  if (context === null && !optional) {
    throw new Error(
      "ToolbarRoot context is missing. Toolbar parts must be placed within <Toolbar.Root>.",
    );
  }

  return context;
}
