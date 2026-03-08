import { createContext, useContext, type Accessor } from "solid-js";

export interface CompositeRootContextValue {
  highlightedIndex: Accessor<number>;
  onHighlightedIndexChange: (index: number, shouldScrollIntoView?: boolean) => void;
  highlightItemOnHover: Accessor<boolean>;
  /**
   * Relays keyboard events that occur outside CompositeRoot children.
   */
  relayKeyboardEvent: (event: KeyboardEvent) => void;
}

export const CompositeRootContext = createContext<CompositeRootContextValue | null>(null);

export function useCompositeRootContext(optional: true): CompositeRootContextValue | null;
export function useCompositeRootContext(optional?: false): CompositeRootContextValue;
export function useCompositeRootContext(optional = false) {
  const context = useContext(CompositeRootContext);

  if (context === null && !optional) {
    throw new Error(
      "CompositeRoot context is missing. Composite parts must be nested in <Composite.Root>.",
    );
  }

  return context;
}
