import { createContext, useContext } from "solid-js";
import type { CompositeMetadata } from "./CompositeList";
import type { ElementListRef } from "../composite";

export interface StringListRef {
  current: Array<string | null>;
}

export interface NumberRef {
  current: number;
}

export interface CompositeListContextValue {
  register: (node: Element, metadata: Record<string, unknown> | null | undefined) => void;
  unregister: (node: Element) => void;
  subscribeMapChange: (fn: (map: Map<Element, CompositeMetadata>) => void) => () => void;
  elementsRef: ElementListRef<HTMLElement>;
  labelsRef?: StringListRef | undefined;
  nextIndexRef: NumberRef;
}

export const CompositeListContext = createContext<CompositeListContextValue | null>(null);

export function useCompositeListContext() {
  const context = useContext(CompositeListContext);

  if (context === null) {
    throw new Error(
      "CompositeList context is missing. Composite list items must be nested in CompositeList.",
    );
  }

  return context;
}
