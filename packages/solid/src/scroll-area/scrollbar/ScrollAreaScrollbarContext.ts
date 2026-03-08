import { createContext, useContext, type Accessor } from "solid-js";
import type { ScrollAreaOrientation } from "../root/ScrollAreaRoot";

export interface ScrollAreaScrollbarContextValue {
  orientation: Accessor<ScrollAreaOrientation>;
}

export const ScrollAreaScrollbarContext = createContext<ScrollAreaScrollbarContextValue | null>(
  null,
);

export function useScrollAreaScrollbarContext(): ScrollAreaScrollbarContextValue {
  const context = useContext(ScrollAreaScrollbarContext);

  if (context === null) {
    throw new Error(
      "ScrollAreaScrollbar context is missing. ScrollArea.Thumb must be placed within <ScrollArea.Scrollbar>.",
    );
  }

  return context;
}
