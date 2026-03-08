import { Dynamic } from "@solidjs/web";
import { createMemo, createSignal, onCleanup, type JSX, type ValidComponent, omit } from "solid-js";
import { useCSPContext } from "../../csp-provider/CSPContext";
import { styleDisableScrollbar } from "../../utils/styles";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { SCROLL_TIMEOUT } from "../constants";
import { getOffset } from "../utils/getOffset";
import { ScrollAreaRootCssVars } from "./ScrollAreaRootCssVars";
import { ScrollAreaRootContext, type ScrollAreaRootContextValue } from "./ScrollAreaRootContext";

const DEFAULT_COORDS = { x: 0, y: 0 };
const DEFAULT_SIZE = { width: 0, height: 0 };
const DEFAULT_OVERFLOW_EDGES = { xStart: false, xEnd: false, yStart: false, yEnd: false };
const DEFAULT_HIDDEN_STATE = { x: true, y: true, corner: true };
const DEFAULT_OVERFLOW_EDGE_THRESHOLD = { xStart: 0, xEnd: 0, yStart: 0, yEnd: 0 };

/**
 * Groups all parts of the scroll area.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://xxxxx.com/solid/components/scroll-area)
 */
export function ScrollAreaRoot(props: ScrollAreaRoot.Props) {
  const cspContext = useCSPContext();

  const [rootElement, setRootElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [viewportElement, setViewportElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [scrollbarYElement, setScrollbarYElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [scrollbarXElement, setScrollbarXElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [thumbYElement, setThumbYElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [thumbXElement, setThumbXElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [cornerElement, setCornerElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });

  const [hovering, setHovering] = createSignal(false);
  const [scrollingX, setScrollingX] = createSignal(false);
  const [scrollingY, setScrollingY] = createSignal(false);
  const [touchModality, setTouchModality] = createSignal(false);
  const [hasMeasuredScrollbar, setHasMeasuredScrollbar] = createSignal(false);
  const [cornerSize, setCornerSize] = createSignal<Size>(DEFAULT_SIZE);
  const [thumbSize, setThumbSize] = createSignal<Size>(DEFAULT_SIZE);
  const [overflowEdges, setOverflowEdges] = createSignal<OverflowEdges>(DEFAULT_OVERFLOW_EDGES);
  const [hiddenState, setHiddenState] = createSignal<HiddenState>(DEFAULT_HIDDEN_STATE);

  const overflowEdgeThreshold = createMemo<OverflowEdgeThreshold>(() =>
    normalizeOverflowEdgeThreshold(props.overflowEdgeThreshold),
  );

  const generatedId = useBaseUiId();
  const rootId = () => {
    if (typeof props.id === "string" && props.id !== "") {
      return props.id;
    }
    return generatedId;
  };

  let previousScrollPosition = DEFAULT_COORDS;
  let scrollXTimeoutId: number | undefined;
  let scrollYTimeoutId: number | undefined;
  let scrollingXActive = false;
  let scrollingYActive = false;

  let dragging = false;
  let draggingOrientation: ScrollAreaOrientation = "vertical";
  let dragStartX = 0;
  let dragStartY = 0;
  let dragStartScrollTop = 0;
  let dragStartScrollLeft = 0;
  let rootElementRef: HTMLDivElement | null = null;
  let scrollbarYElementRef: HTMLDivElement | null = null;
  let scrollbarXElementRef: HTMLDivElement | null = null;

  const syncScrollingDataAttributes = () => {
    const isScrolling = scrollingXActive || scrollingYActive;
    toggleDataAttribute(rootElementRef, "data-scrolling", isScrolling);
    toggleDataAttribute(scrollbarXElementRef, "data-scrolling", scrollingXActive);
    toggleDataAttribute(scrollbarYElementRef, "data-scrolling", scrollingYActive);
  };

  const setRootElementRefValue = (element: HTMLDivElement | null) => {
    rootElementRef = element;
    setRootElement(element);
  };

  const setScrollbarYElementRefValue = (element: HTMLDivElement | null) => {
    scrollbarYElementRef = element;
    setScrollbarYElement(element);
  };

  const setScrollbarXElementRefValue = (element: HTMLDivElement | null) => {
    scrollbarXElementRef = element;
    setScrollbarXElement(element);
  };

  const clearScrollTimeout = (axis: "x" | "y") => {
    if (axis === "x") {
      if (scrollXTimeoutId !== undefined) {
        window.clearTimeout(scrollXTimeoutId);
      }
      scrollXTimeoutId = undefined;
      return;
    }

    if (scrollYTimeoutId !== undefined) {
      window.clearTimeout(scrollYTimeoutId);
    }
    scrollYTimeoutId = undefined;
  };

  const scheduleScrollEnd = (axis: "x" | "y") => {
    clearScrollTimeout(axis);

    const timeoutId = window.setTimeout(() => {
      if (axis === "x") {
        scrollingXActive = false;
        setScrollingX(false);
      } else {
        scrollingYActive = false;
        setScrollingY(false);
      }
      syncScrollingDataAttributes();
    }, SCROLL_TIMEOUT);

    if (axis === "x") {
      scrollXTimeoutId = timeoutId;
    } else {
      scrollYTimeoutId = timeoutId;
    }
  };

  onCleanup(() => {
    clearScrollTimeout("x");
    clearScrollTimeout("y");
  });

  const handleScroll = (position: Coords) => {
    const deltaX = position.x - previousScrollPosition.x;
    const deltaY = position.y - previousScrollPosition.y;
    previousScrollPosition = position;

    if (deltaX !== 0) {
      scrollingXActive = true;
      setScrollingX(true);
      scheduleScrollEnd("x");
    }

    if (deltaY !== 0) {
      scrollingYActive = true;
      setScrollingY(true);
      scheduleScrollEnd("y");
    }

    if (deltaX !== 0 || deltaY !== 0) {
      syncScrollingDataAttributes();
    }
  };

  const handlePointerDown = (event: ScrollAreaPointerEvent) => {
    if (event.button !== 0) {
      return;
    }

    const viewport = viewportElement();
    if (viewport === null) {
      return;
    }

    dragging = true;
    dragStartX = event.clientX;
    dragStartY = event.clientY;
    dragStartScrollTop = viewport.scrollTop;
    dragStartScrollLeft = viewport.scrollLeft;
    draggingOrientation =
      event.currentTarget.getAttribute("data-orientation") === "horizontal"
        ? "horizontal"
        : "vertical";

    event.currentTarget.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: ScrollAreaPointerEvent) => {
    if (!dragging) {
      return;
    }

    const viewport = viewportElement();
    if (viewport === null) {
      return;
    }

    if (draggingOrientation === "vertical") {
      const thumb = thumbYElement();
      const scrollbar = scrollbarYElement();

      if (thumb === null || scrollbar === null) {
        return;
      }

      const delta = event.clientY - dragStartY;
      const scrollbarOffset = getOffset(scrollbar, "padding", "y");
      const thumbOffset = getOffset(thumb, "margin", "y");
      const maxThumbOffset =
        scrollbar.offsetHeight - thumb.offsetHeight - scrollbarOffset - thumbOffset;

      if (maxThumbOffset <= 0) {
        return;
      }

      const scrollRange = viewport.scrollHeight - viewport.clientHeight;
      viewport.scrollTop = dragStartScrollTop + (delta / maxThumbOffset) * scrollRange;
      event.preventDefault();
      setScrollingY(true);
      scheduleScrollEnd("y");
      return;
    }

    const thumb = thumbXElement();
    const scrollbar = scrollbarXElement();

    if (thumb === null || scrollbar === null) {
      return;
    }

    const delta = event.clientX - dragStartX;
    const scrollbarOffset = getOffset(scrollbar, "padding", "x");
    const thumbOffset = getOffset(thumb, "margin", "x");
    const maxThumbOffset =
      scrollbar.offsetWidth - thumb.offsetWidth - scrollbarOffset - thumbOffset;

    if (maxThumbOffset <= 0) {
      return;
    }

    const scrollRange = viewport.scrollWidth - viewport.clientWidth;
    viewport.scrollLeft = dragStartScrollLeft + (delta / maxThumbOffset) * scrollRange;
    event.preventDefault();
    setScrollingX(true);
    scheduleScrollEnd("x");
  };

  const handlePointerUp = (event: ScrollAreaPointerEvent) => {
    if (!dragging) {
      return;
    }

    dragging = false;
    event.currentTarget.releasePointerCapture?.(event.pointerId);
  };

  const state = createMemo<ScrollAreaRootState>(() => ({
    scrolling: scrollingX() || scrollingY(),
    hasOverflowX: !hiddenState().x,
    hasOverflowY: !hiddenState().y,
    overflowXStart: overflowEdges().xStart,
    overflowXEnd: overflowEdges().xEnd,
    overflowYStart: overflowEdges().yStart,
    overflowYEnd: overflowEdges().yEnd,
    cornerHidden: hiddenState().corner,
  }));

  const contextValue: ScrollAreaRootContextValue = {
    rootId,
    overflowEdgeThreshold,
    state,
    rootElement,
    viewportElement,
    scrollbarYElement,
    scrollbarXElement,
    thumbYElement,
    thumbXElement,
    cornerElement,
    setRootElement: setRootElementRefValue,
    setViewportElement,
    setScrollbarYElement: setScrollbarYElementRefValue,
    setScrollbarXElement: setScrollbarXElementRefValue,
    setThumbYElement,
    setThumbXElement,
    setCornerElement,
    hovering,
    setHovering,
    scrollingX,
    setScrollingX,
    scrollingY,
    setScrollingY,
    touchModality,
    setTouchModality,
    hasMeasuredScrollbar,
    setHasMeasuredScrollbar,
    cornerSize,
    setCornerSize,
    thumbSize,
    setThumbSize,
    hiddenState,
    setHiddenState,
    overflowEdges,
    setOverflowEdges,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleScroll,
  };

  const elementProps = createMemo(() => omit(props, ...ROOT_OMITTED_PROP_KEYS));
  const rootStyle = createMemo<JSX.CSSProperties>(() => ({
    position: "relative",
    [ScrollAreaRootCssVars.scrollAreaCornerHeight]: `${cornerSize().height}px`,
    [ScrollAreaRootCssVars.scrollAreaCornerWidth]: `${cornerSize().width}px`,
    ...toStyleObject(props.style),
  }));

  return (
    <ScrollAreaRootContext value={contextValue}>
      {!cspContext.disableStyleElements()
        ? styleDisableScrollbar.getElement(cspContext.nonce())
        : null}
      <Dynamic
        component={props.render ?? "div"}
        id={rootId()}
        role="presentation"
        ref={(element: HTMLDivElement) => {
          setRootElementRefValue(element);
          assignRef(props.ref, element);
        }}
        style={rootStyle()}
        onPointerEnter={(event: ScrollAreaPointerEvent) => {
          setTouchModality(event.pointerType === "touch");
          if (event.pointerType !== "touch") {
            const root = rootElement();
            const target = event.target;
            setHovering(root !== null && target instanceof Node ? root.contains(target) : false);
          }
          callEventHandler(props.onPointerEnter, event);
        }}
        onPointerMove={(event: ScrollAreaPointerEvent) => {
          setTouchModality(event.pointerType === "touch");
          if (event.pointerType !== "touch") {
            const root = rootElement();
            const target = event.target;
            setHovering(root !== null && target instanceof Node ? root.contains(target) : false);
          }
          callEventHandler(props.onPointerMove, event);
        }}
        onPointerDown={(event: ScrollAreaPointerEvent) => {
          setTouchModality(event.pointerType === "touch");
          callEventHandler(props.onPointerDown, event);
        }}
        onPointerLeave={(event: ScrollAreaPointerEvent) => {
          setHovering(false);
          callEventHandler(props.onPointerLeave, event);
        }}
        data-scrolling={state().scrolling ? "" : undefined}
        data-has-overflow-x={state().hasOverflowX ? "" : undefined}
        data-has-overflow-y={state().hasOverflowY ? "" : undefined}
        data-overflow-x-start={state().overflowXStart ? "" : undefined}
        data-overflow-x-end={state().overflowXEnd ? "" : undefined}
        data-overflow-y-start={state().overflowYStart ? "" : undefined}
        data-overflow-y-end={state().overflowYEnd ? "" : undefined}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </ScrollAreaRootContext>
  );
}

export type Size = typeof DEFAULT_SIZE;
export type Coords = typeof DEFAULT_COORDS;
export type OverflowEdges = typeof DEFAULT_OVERFLOW_EDGES;
export type HiddenState = typeof DEFAULT_HIDDEN_STATE;
export type ScrollAreaOrientation = "horizontal" | "vertical";
export type ScrollAreaPointerEvent = PointerEvent & {
  currentTarget: HTMLDivElement;
  target: EventTarget & Element;
};

export interface OverflowEdgeThreshold {
  xStart: number;
  xEnd: number;
  yStart: number;
  yEnd: number;
}

export interface ScrollAreaRootState {
  /** Whether the scroll area is being scrolled. */
  scrolling: boolean;
  /** Whether horizontal overflow is present. */
  hasOverflowX: boolean;
  /** Whether vertical overflow is present. */
  hasOverflowY: boolean;
  /** Whether there is overflow on the inline start side for the horizontal axis. */
  overflowXStart: boolean;
  /** Whether there is overflow on the inline end side for the horizontal axis. */
  overflowXEnd: boolean;
  /** Whether there is overflow on the block start side. */
  overflowYStart: boolean;
  /** Whether there is overflow on the block end side. */
  overflowYEnd: boolean;
  /** Whether the scrollbar corner is hidden. */
  cornerHidden: boolean;
}

export interface ScrollAreaRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
  /**
   * The threshold in pixels that must be passed before the overflow edge attributes are applied.
   * Accepts a single number for all edges or an object to configure them individually.
   * @default 0
   */
  overflowEdgeThreshold?: number | Partial<OverflowEdgeThreshold> | undefined;
}

export namespace ScrollAreaRoot {
  export type State = ScrollAreaRootState;
  export type Props = ScrollAreaRootProps;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "id",
  "onPointerEnter",
  "onPointerMove",
  "onPointerDown",
  "onPointerLeave",
  "overflowEdgeThreshold",
  "ref",
  "render",
  "style",
] as const satisfies ReadonlyArray<keyof ScrollAreaRootProps>;

function normalizeOverflowEdgeThreshold(
  threshold: number | Partial<OverflowEdgeThreshold> | undefined,
): OverflowEdgeThreshold {
  if (typeof threshold === "number") {
    const value = Math.max(0, threshold);
    return {
      xStart: value,
      xEnd: value,
      yStart: value,
      yEnd: value,
    };
  }

  return {
    xStart: Math.max(0, threshold?.xStart ?? DEFAULT_OVERFLOW_EDGE_THRESHOLD.xStart),
    xEnd: Math.max(0, threshold?.xEnd ?? DEFAULT_OVERFLOW_EDGE_THRESHOLD.xEnd),
    yStart: Math.max(0, threshold?.yStart ?? DEFAULT_OVERFLOW_EDGE_THRESHOLD.yStart),
    yEnd: Math.max(0, threshold?.yEnd ?? DEFAULT_OVERFLOW_EDGE_THRESHOLD.yEnd),
  };
}

function toggleDataAttribute(
  element: HTMLElement | null,
  attributeName: string,
  enabled: boolean,
): void {
  if (element === null) {
    return;
  }

  if (enabled) {
    element.setAttribute(attributeName, "");
    return;
  }

  element.removeAttribute(attributeName);
}

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}

function assignRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement,
): void {
  if (ref === undefined) {
    return;
  }

  if (typeof ref === "function") {
    ref(element);
    return;
  }

  if ("current" in ref) {
    ref.current = element;
  }
}

function callEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & { currentTarget: TElement; target: EventTarget & Element },
): void {
  if (handler === undefined) {
    return;
  }

  if (typeof handler === "function") {
    handler(event);
    return;
  }

  handler[0](handler[1], event);
}
