import {
  Show,
  createMemo,
  createRenderEffect,
  createSignal,
  untrack,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import { Dynamic } from "@solidjs/web";
import { useDirection } from "../../direction-provider/DirectionContext";
import type { ScrollAreaRoot } from "../root/ScrollAreaRoot";
import type { ScrollAreaPointerEvent } from "../root/ScrollAreaRoot";
import type { ScrollAreaOrientation } from "../root/ScrollAreaRoot";
import { ScrollAreaRootCssVars } from "../root/ScrollAreaRootCssVars";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext";
import { getOffset } from "../utils/getOffset";
import { ScrollAreaScrollbarContext } from "./ScrollAreaScrollbarContext";
import { ScrollAreaScrollbarCssVars } from "./ScrollAreaScrollbarCssVars";

/**
 * A vertical or horizontal scrollbar for the scroll area.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://xxxxx.com/solid/components/scroll-area)
 */
export function ScrollAreaScrollbar(props: ScrollAreaScrollbar.Props) {
  const rootContext = useScrollAreaRootContext();
  const direction = createMemo(useDirection);
  const [scrollbarElement, setScrollbarElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });

  const orientation = createMemo<ScrollAreaOrientation>(() => props.orientation ?? "vertical");
  const keepMounted = createMemo(() => props.keepMounted ?? false);
  const hidden = createMemo(() =>
    orientation() === "vertical" ? rootContext.hiddenState().y : rootContext.hiddenState().x,
  );
  const shouldRender = createMemo(() => keepMounted() || !hidden());

  const elementProps = createMemo(() => omit(props, ...SCROLLBAR_OMITTED_PROP_KEYS));
  const scrollbarStyle = createMemo<JSX.CSSProperties>(() => ({
    position: "absolute",
    touchAction: "none",
    userSelect: "none",
    visibility: !rootContext.hasMeasuredScrollbar() && !keepMounted() ? "hidden" : undefined,
    ...(orientation() === "vertical"
      ? {
          top: "0px",
          bottom: `var(${ScrollAreaRootCssVars.scrollAreaCornerHeight})`,
          "inset-inline-end": "0px",
          [ScrollAreaScrollbarCssVars.scrollAreaThumbHeight]: `${rootContext.thumbSize().height}px`,
        }
      : {
          "inset-inline-start": "0px",
          "inset-inline-end": `var(${ScrollAreaRootCssVars.scrollAreaCornerWidth})`,
          bottom: "0px",
          [ScrollAreaScrollbarCssVars.scrollAreaThumbWidth]: `${rootContext.thumbSize().width}px`,
        }),
    ...toStyleObject(props.style),
  }));

  const state = createMemo<ScrollAreaScrollbarState>(() => ({
    ...rootContext.state(),
    hovering: rootContext.hovering(),
    scrolling: orientation() === "vertical" ? rootContext.scrollingY() : rootContext.scrollingX(),
    orientation: orientation(),
  }));

  createRenderEffect(shouldRender, (rendered) => {
    if (!rendered) {
      setScrollbarElement(null);
      if (orientation() === "vertical") {
        rootContext.setScrollbarYElement(null);
      } else {
        rootContext.setScrollbarXElement(null);
      }
    }
  });

  createRenderEffect(
    () => [scrollbarElement(), state(), rootContext.hovering()] as const,
    ([element, currentState, hovering]) => {
      if (element === null) {
        return;
      }

      toggleDataAttribute(element, "data-scrolling", currentState.scrolling);
      toggleDataAttribute(element, "data-has-overflow-x", currentState.hasOverflowX);
      toggleDataAttribute(element, "data-has-overflow-y", currentState.hasOverflowY);
      toggleDataAttribute(element, "data-overflow-x-start", currentState.overflowXStart);
      toggleDataAttribute(element, "data-overflow-x-end", currentState.overflowXEnd);
      toggleDataAttribute(element, "data-overflow-y-start", currentState.overflowYStart);
      toggleDataAttribute(element, "data-overflow-y-end", currentState.overflowYEnd);
      toggleDataAttribute(element, "data-hovering", hovering);
    },
  );

  return (
    <ScrollAreaScrollbarContext value={{ orientation }}>
      <Show when={shouldRender()}>
        <Dynamic
          component={props.render ?? "div"}
          ref={(element: HTMLDivElement) => {
            const currentOrientation = untrack(orientation);
            setScrollbarElement(element);
            if (currentOrientation === "vertical") {
              rootContext.setScrollbarYElement(element);
            } else {
              rootContext.setScrollbarXElement(element);
            }
            assignRef(props.ref, element);
          }}
          style={scrollbarStyle()}
          data-orientation={orientation()}
          onPointerDown={(event: ScrollAreaPointerEvent) => {
            if (event.button !== 0) {
              callEventHandler(props.onPointerDown, event);
              return;
            }

            const viewport = rootContext.viewportElement();
            if (viewport === null) {
              callEventHandler(props.onPointerDown, event);
              return;
            }

            if (event.currentTarget === event.target) {
              if (orientation() === "vertical") {
                const thumb = rootContext.thumbYElement();
                const scrollbar = rootContext.scrollbarYElement();

                if (thumb !== null && scrollbar !== null) {
                  const thumbOffset = getOffset(thumb, "margin", "y");
                  const scrollbarOffset = getOffset(scrollbar, "padding", "y");
                  const clickOffset =
                    event.clientY -
                    scrollbar.getBoundingClientRect().top -
                    thumb.offsetHeight / 2 -
                    scrollbarOffset +
                    thumbOffset / 2;
                  const maxThumbOffset =
                    scrollbar.offsetHeight - thumb.offsetHeight - scrollbarOffset - thumbOffset;
                  const maxScroll = viewport.scrollHeight - viewport.clientHeight;
                  if (maxThumbOffset > 0) {
                    viewport.scrollTop = (clickOffset / maxThumbOffset) * maxScroll;
                  }
                }
              } else {
                const thumb = rootContext.thumbXElement();
                const scrollbar = rootContext.scrollbarXElement();

                if (thumb !== null && scrollbar !== null) {
                  const thumbOffset = getOffset(thumb, "margin", "x");
                  const scrollbarOffset = getOffset(scrollbar, "padding", "x");
                  const clickOffset =
                    event.clientX -
                    scrollbar.getBoundingClientRect().left -
                    thumb.offsetWidth / 2 -
                    scrollbarOffset +
                    thumbOffset / 2;
                  const maxThumbOffset =
                    scrollbar.offsetWidth - thumb.offsetWidth - scrollbarOffset - thumbOffset;
                  const maxScroll = viewport.scrollWidth - viewport.clientWidth;
                  if (maxThumbOffset > 0) {
                    const next = (clickOffset / maxThumbOffset) * maxScroll;
                    viewport.scrollLeft = direction() === "rtl" ? -next : next;
                  }
                }
              }
            }

            rootContext.handlePointerDown(event);
            callEventHandler(props.onPointerDown, event);
          }}
          onPointerUp={(event: ScrollAreaPointerEvent) => {
            rootContext.handlePointerUp(event);
            callEventHandler(props.onPointerUp, event);
          }}
          onWheel={(
            event: WheelEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
          ) => {
            if (event.ctrlKey) {
              callEventHandler(props.onWheel, event);
              return;
            }

            const viewport = rootContext.viewportElement();
            if (viewport !== null) {
              event.preventDefault();
              if (orientation() === "vertical") {
                viewport.scrollTop += event.deltaY;
              } else {
                viewport.scrollLeft += event.deltaX;
              }
            }

            callEventHandler(props.onWheel, event);
          }}
          {...elementProps()}
        />
      </Show>
    </ScrollAreaScrollbarContext>
  );
}

export interface ScrollAreaScrollbarState extends ScrollAreaRoot.State {
  /** Whether the scroll area is being hovered. */
  hovering: boolean;
  /** Whether the scroll area is being scrolled. */
  scrolling: boolean;
  /** The orientation of the scrollbar. */
  orientation: ScrollAreaOrientation;
}

export interface ScrollAreaScrollbarProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  "data-testid"?: string | undefined;
  /**
   * Whether the scrollbar controls vertical or horizontal scroll.
   * @default 'vertical'
   */
  orientation?: ScrollAreaOrientation | undefined;
  /**
   * Whether to keep the HTML element in the DOM when the viewport isn’t scrollable.
   * @default false
   */
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace ScrollAreaScrollbar {
  export type State = ScrollAreaScrollbarState;
  export type Props = ScrollAreaScrollbarProps;
}

const SCROLLBAR_OMITTED_PROP_KEYS = [
  "children",
  "keepMounted",
  "orientation",
  "ref",
  "render",
  "style",
  "onPointerDown",
  "onPointerUp",
  "onWheel",
] as const satisfies ReadonlyArray<keyof ScrollAreaScrollbarProps>;

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

function toggleDataAttribute(element: HTMLElement, attributeName: string, enabled: boolean): void {
  if (enabled) {
    element.setAttribute(attributeName, "");
    return;
  }

  element.removeAttribute(attributeName);
}
