import { createContext, useContext, type Accessor, type Setter } from "solid-js";
import type {
  Coords,
  HiddenState,
  OverflowEdges,
  OverflowEdgeThreshold,
  ScrollAreaPointerEvent,
  ScrollAreaRootState,
  Size,
} from "./ScrollAreaRoot";

export interface ScrollAreaRootContextValue {
  rootId: Accessor<string | undefined>;
  overflowEdgeThreshold: Accessor<OverflowEdgeThreshold>;
  state: Accessor<ScrollAreaRootState>;
  rootElement: Accessor<HTMLDivElement | null>;
  viewportElement: Accessor<HTMLDivElement | null>;
  scrollbarYElement: Accessor<HTMLDivElement | null>;
  scrollbarXElement: Accessor<HTMLDivElement | null>;
  thumbYElement: Accessor<HTMLDivElement | null>;
  thumbXElement: Accessor<HTMLDivElement | null>;
  cornerElement: Accessor<HTMLDivElement | null>;
  setRootElement: (element: HTMLDivElement | null) => void;
  setViewportElement: (element: HTMLDivElement | null) => void;
  setScrollbarYElement: (element: HTMLDivElement | null) => void;
  setScrollbarXElement: (element: HTMLDivElement | null) => void;
  setThumbYElement: (element: HTMLDivElement | null) => void;
  setThumbXElement: (element: HTMLDivElement | null) => void;
  setCornerElement: (element: HTMLDivElement | null) => void;
  hovering: Accessor<boolean>;
  setHovering: Setter<boolean>;
  scrollingX: Accessor<boolean>;
  setScrollingX: Setter<boolean>;
  scrollingY: Accessor<boolean>;
  setScrollingY: Setter<boolean>;
  touchModality: Accessor<boolean>;
  setTouchModality: Setter<boolean>;
  hasMeasuredScrollbar: Accessor<boolean>;
  setHasMeasuredScrollbar: Setter<boolean>;
  cornerSize: Accessor<Size>;
  setCornerSize: Setter<Size>;
  thumbSize: Accessor<Size>;
  setThumbSize: Setter<Size>;
  hiddenState: Accessor<HiddenState>;
  setHiddenState: Setter<HiddenState>;
  overflowEdges: Accessor<OverflowEdges>;
  setOverflowEdges: Setter<OverflowEdges>;
  handlePointerDown: (event: ScrollAreaPointerEvent) => void;
  handlePointerMove: (event: ScrollAreaPointerEvent) => void;
  handlePointerUp: (event: ScrollAreaPointerEvent) => void;
  handleScroll: (position: Coords) => void;
}

export const ScrollAreaRootContext = createContext<ScrollAreaRootContextValue | null>(null);

export function useScrollAreaRootContext(): ScrollAreaRootContextValue {
  const context = useContext(ScrollAreaRootContext);

  if (context === null) {
    throw new Error(
      "ScrollAreaRoot context is missing. ScrollArea parts must be placed within <ScrollArea.Root>.",
    );
  }

  return context;
}
