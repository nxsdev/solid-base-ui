import { createContext, useContext } from "solid-js";

export interface ScrollAreaViewportContextValue {
  computeThumbPosition: () => void;
}

export const ScrollAreaViewportContext = createContext<ScrollAreaViewportContextValue | null>(null);

export function useScrollAreaViewportContext(): ScrollAreaViewportContextValue {
  const context = useContext(ScrollAreaViewportContext);

  if (context === null) {
    throw new Error(
      "ScrollAreaViewport context is missing. ScrollArea.Content must be placed within <ScrollArea.Viewport>.",
    );
  }

  return context;
}
