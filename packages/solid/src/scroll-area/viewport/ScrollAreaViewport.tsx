import { Dynamic } from "@solidjs/web";
import { createMemo, onCleanup, type JSX, type ValidComponent, omit } from "solid-js";
import { useDirection } from "../../direction-provider/DirectionContext";
import { styleDisableScrollbar } from "../../utils/styles";
import { MIN_THUMB_SIZE } from "../constants";
import { getOffset } from "../utils/getOffset";
import { normalizeScrollOffset } from "../utils/scrollEdges";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext";
import { ScrollAreaViewportContext } from "./ScrollAreaViewportContext";
import { ScrollAreaViewportCssVars } from "./ScrollAreaViewportCssVars";

const SCROLL_END_TIMEOUT = 100;

/**
 * The actual scrollable container of the scroll area.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://xxxxx.com/solid/components/scroll-area)
 */
export function ScrollAreaViewport(props: ScrollAreaViewport.Props) {
  const rootContext = useScrollAreaRootContext();
  const direction = useDirection();
  let viewportElementRef: HTMLDivElement | null = null;
  let viewportWithScrollListener: HTMLDivElement | null = null;
  let resizeObserver: ResizeObserver | null = null;
  let scrollEndTimeoutId: number | undefined;
  let programmaticScroll = true;

  const computeThumbPosition = () => {
    const viewport = viewportElementRef ?? rootContext.viewportElement();
    if (viewport === null) {
      return;
    }

    const scrollbarY = rootContext.scrollbarYElement();
    const scrollbarX = rootContext.scrollbarXElement();
    const thumbY = rootContext.thumbYElement();
    const thumbX = rootContext.thumbXElement();

    const scrollHeight = viewport.scrollHeight;
    const scrollWidth = viewport.scrollWidth;
    const viewportHeight = viewport.clientHeight;
    const viewportWidth = viewport.clientWidth;
    const maxScrollTop = Math.max(0, scrollHeight - viewportHeight);
    const maxScrollLeft = Math.max(0, scrollWidth - viewportWidth);

    const hiddenX = scrollWidth <= viewportWidth + 1;
    const hiddenY = scrollHeight <= viewportHeight + 1;
    const hiddenCorner = hiddenX || hiddenY;

    rootContext.setHiddenState((previous) => {
      if (previous.x === hiddenX && previous.y === hiddenY && previous.corner === hiddenCorner) {
        return previous;
      }

      return {
        x: hiddenX,
        y: hiddenY,
        corner: hiddenCorner,
      };
    });

    if (!rootContext.hasMeasuredScrollbar()) {
      rootContext.setHasMeasuredScrollbar(true);
    }

    const threshold = rootContext.overflowEdgeThreshold();
    const rawScrollLeftFromStart =
      direction === "rtl"
        ? clamp(-viewport.scrollLeft, 0, maxScrollLeft)
        : clamp(viewport.scrollLeft, 0, maxScrollLeft);
    const scrollLeftFromStart = normalizeScrollOffset(rawScrollLeftFromStart, maxScrollLeft);
    const scrollLeftFromEnd = maxScrollLeft - scrollLeftFromStart;
    const scrollTopFromStart = normalizeScrollOffset(
      clamp(viewport.scrollTop, 0, maxScrollTop),
      maxScrollTop,
    );
    const scrollTopFromEnd = maxScrollTop - scrollTopFromStart;
    const nextOverflowEdges = {
      xStart: scrollLeftFromStart > threshold.xStart,
      xEnd: scrollLeftFromEnd > threshold.xEnd,
      yStart: scrollTopFromStart > threshold.yStart,
      yEnd: scrollTopFromEnd > threshold.yEnd,
    };

    rootContext.setOverflowEdges((previous) => {
      if (
        previous.xStart === nextOverflowEdges.xStart &&
        previous.xEnd === nextOverflowEdges.xEnd &&
        previous.yStart === nextOverflowEdges.yStart &&
        previous.yEnd === nextOverflowEdges.yEnd
      ) {
        return previous;
      }

      return nextOverflowEdges;
    });

    toggleDataAttribute(viewport, "data-has-overflow-x", !hiddenX);
    toggleDataAttribute(viewport, "data-has-overflow-y", !hiddenY);
    toggleDataAttribute(viewport, "data-overflow-x-start", nextOverflowEdges.xStart);
    toggleDataAttribute(viewport, "data-overflow-x-end", nextOverflowEdges.xEnd);
    toggleDataAttribute(viewport, "data-overflow-y-start", nextOverflowEdges.yStart);
    toggleDataAttribute(viewport, "data-overflow-y-end", nextOverflowEdges.yEnd);

    viewport.style.setProperty(
      ScrollAreaViewportCssVars.scrollAreaOverflowXStart,
      `${scrollLeftFromStart}px`,
    );
    viewport.style.setProperty(
      ScrollAreaViewportCssVars.scrollAreaOverflowXEnd,
      `${scrollLeftFromEnd}px`,
    );
    viewport.style.setProperty(
      ScrollAreaViewportCssVars.scrollAreaOverflowYStart,
      `${scrollTopFromStart}px`,
    );
    viewport.style.setProperty(
      ScrollAreaViewportCssVars.scrollAreaOverflowYEnd,
      `${scrollTopFromEnd}px`,
    );

    const nextCornerWidth =
      !hiddenX && !hiddenY && scrollbarY !== null ? scrollbarY.offsetWidth : 0;
    const nextCornerHeight =
      !hiddenX && !hiddenY && scrollbarX !== null ? scrollbarX.offsetHeight : 0;
    rootContext.setCornerSize((previous) => {
      if (previous.width === nextCornerWidth && previous.height === nextCornerHeight) {
        return previous;
      }

      return {
        width: nextCornerWidth,
        height: nextCornerHeight,
      };
    });

    if (!hiddenY && scrollbarY !== null && thumbY !== null) {
      const ratio = viewportHeight / Math.max(scrollHeight, 1);
      const scrollbarOffset = getOffset(scrollbarY, "padding", "y");
      const thumbOffset = getOffset(thumbY, "margin", "y");
      const trackSize = Math.max(0, scrollbarY.offsetHeight - scrollbarOffset - thumbOffset);
      const thumbHeight = Math.max(MIN_THUMB_SIZE, trackSize * ratio);
      const maxThumbOffset = Math.max(0, trackSize - thumbHeight);
      const scrollRatio =
        maxScrollTop <= 0 ? 0 : clamp(viewport.scrollTop, 0, maxScrollTop) / maxScrollTop;
      const thumbOffsetY = scrollRatio * maxThumbOffset;
      thumbY.style.transform = `translate3d(0,${thumbOffsetY}px,0)`;

      rootContext.setThumbSize((previous) => {
        if (previous.height === thumbHeight) {
          return previous;
        }

        return {
          ...previous,
          height: thumbHeight,
        };
      });
    }

    if (!hiddenX && scrollbarX !== null && thumbX !== null) {
      const ratio = viewportWidth / Math.max(scrollWidth, 1);
      const scrollbarOffset = getOffset(scrollbarX, "padding", "x");
      const thumbOffset = getOffset(thumbX, "margin", "x");
      const trackSize = Math.max(0, scrollbarX.offsetWidth - scrollbarOffset - thumbOffset);
      const thumbWidth = Math.max(MIN_THUMB_SIZE, trackSize * ratio);
      const maxThumbOffset = Math.max(0, trackSize - thumbWidth);
      const scrollRatio = maxScrollLeft <= 0 ? 0 : viewport.scrollLeft / maxScrollLeft;
      const thumbOffsetX =
        direction === "rtl"
          ? clamp(scrollRatio * maxThumbOffset, -maxThumbOffset, 0)
          : clamp(scrollRatio * maxThumbOffset, 0, maxThumbOffset);
      thumbX.style.transform = `translate3d(${thumbOffsetX}px,0,0)`;

      rootContext.setThumbSize((previous) => {
        if (previous.width === thumbWidth) {
          return previous;
        }

        return {
          ...previous,
          width: thumbWidth,
        };
      });
    }
  };

  const clearScrollEndTimeout = () => {
    if (scrollEndTimeoutId !== undefined) {
      window.clearTimeout(scrollEndTimeoutId);
      scrollEndTimeoutId = undefined;
    }
  };

  const handleUserInteraction = () => {
    programmaticScroll = false;
  };

  const handleViewportScroll = (event: Event) => {
    const viewport = viewportElementRef ?? rootContext.viewportElement();
    if (viewport === null) {
      return;
    }

    computeThumbPosition();

    if (!programmaticScroll) {
      rootContext.handleScroll({
        x: viewport.scrollLeft,
        y: viewport.scrollTop,
      });

      clearScrollEndTimeout();
      scrollEndTimeoutId = window.setTimeout(() => {
        programmaticScroll = true;
        scrollEndTimeoutId = undefined;
      }, SCROLL_END_TIMEOUT);
    }

    callEventHandler(
      props.onScroll,
      event as Event & { currentTarget: HTMLDivElement; target: EventTarget & Element },
    );
  };

  onCleanup(() => {
    if (viewportWithScrollListener !== null) {
      viewportWithScrollListener.removeEventListener("scroll", handleViewportScroll);
      viewportWithScrollListener = null;
    }
    if (resizeObserver !== null) {
      resizeObserver.disconnect();
      resizeObserver = null;
    }
    clearScrollEndTimeout();
    viewportElementRef = null;
  });

  const state = () => rootContext.state();
  const rootId = () => rootContext.rootId();
  const elementProps = createMemo(() => omit(props, ...VIEWPORT_OMITTED_PROP_KEYS));
  const viewportStyle = createMemo<JSX.CSSProperties>(() => ({
    overflow: "scroll",
    scrollbarWidth: "none",
    msOverflowStyle: "none",
    ...toStyleObject(props.style),
  }));
  const viewportClass = createMemo(() =>
    mergeClassNameValues(styleDisableScrollbar.className, props.class),
  );
  const contextValue = { computeThumbPosition };

  return (
    <ScrollAreaViewportContext value={contextValue}>
      <Dynamic
        component={props.render ?? "div"}
        ref={(element: HTMLDivElement) => {
          viewportElementRef = element;

          if (viewportWithScrollListener !== element) {
            if (viewportWithScrollListener !== null) {
              viewportWithScrollListener.removeEventListener("scroll", handleViewportScroll);
            }
            element.addEventListener("scroll", handleViewportScroll);
            viewportWithScrollListener = element;
          }

          if (resizeObserver !== null) {
            resizeObserver.disconnect();
            resizeObserver = null;
          }

          if (typeof ResizeObserver === "function") {
            resizeObserver = new ResizeObserver(() => {
              computeThumbPosition();
            });
            resizeObserver.observe(element);

            const contentElement = element.firstElementChild;
            if (contentElement !== null) {
              resizeObserver.observe(contentElement);
            }
          }

          queueMicrotask(() => {
            if (viewportElementRef === element) {
              computeThumbPosition();
            }
          });

          rootContext.setViewportElement(element);
          assignRef(props.ref, element);
        }}
        role="presentation"
        data-id={rootId() !== undefined ? `${rootId()}-viewport` : undefined}
        tabIndex={rootContext.hiddenState().x && rootContext.hiddenState().y ? -1 : 0}
        class={viewportClass()}
        style={viewportStyle()}
        onWheel={(
          event: WheelEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          handleUserInteraction();
          callEventHandler(props.onWheel, event);
        }}
        onTouchMove={(
          event: TouchEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          handleUserInteraction();
          callEventHandler(props.onTouchMove, event);
        }}
        onPointerMove={(
          event: PointerEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          handleUserInteraction();
          callEventHandler(props.onPointerMove, event);
        }}
        onPointerEnter={(
          event: PointerEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          handleUserInteraction();
          callEventHandler(props.onPointerEnter, event);
        }}
        onKeyDown={(
          event: KeyboardEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
        ) => {
          handleUserInteraction();
          callEventHandler(props.onKeyDown, event);
        }}
        data-scrolling={state().scrolling ? "" : undefined}
        data-has-overflow-x={state().hasOverflowX ? "" : undefined}
        data-has-overflow-y={state().hasOverflowY ? "" : undefined}
        data-overflow-x-start={state().overflowXStart ? "" : undefined}
        data-overflow-x-end={state().overflowXEnd ? "" : undefined}
        data-overflow-y-start={state().overflowYStart ? "" : undefined}
        data-overflow-y-end={state().overflowYEnd ? "" : undefined}
        {...elementProps()}
      />
    </ScrollAreaViewportContext>
  );
}

export interface ScrollAreaViewportState {}

export interface ScrollAreaViewportProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace ScrollAreaViewport {
  export type State = ScrollAreaViewportState;
  export type Props = ScrollAreaViewportProps;
}

const VIEWPORT_OMITTED_PROP_KEYS = [
  "class",
  "onKeyDown",
  "onPointerEnter",
  "onPointerMove",
  "onTouchMove",
  "onWheel",
  "ref",
  "render",
  "style",
  "onScroll",
] as const satisfies ReadonlyArray<keyof ScrollAreaViewportProps>;

function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}

function toggleDataAttribute(element: HTMLElement, attributeName: string, enabled: boolean): void {
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

function mergeClassNameValues(
  baseClassName: string,
  customClassName: ScrollAreaViewportProps["class"] | undefined,
): string {
  const classNames = [baseClassName];

  if (typeof customClassName === "string") {
    const trimmed = customClassName.trim();
    if (trimmed.length > 0) {
      classNames.push(trimmed);
    }
  } else if (customClassName !== null && typeof customClassName === "object") {
    for (const [className, enabled] of Object.entries(customClassName)) {
      if (enabled) {
        classNames.push(className);
      }
    }
  }

  return classNames.join(" ");
}
