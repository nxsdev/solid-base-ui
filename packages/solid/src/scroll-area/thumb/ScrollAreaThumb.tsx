import { Dynamic } from "@solidjs/web";
import { createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import type { ScrollAreaPointerEvent } from "../root/ScrollAreaRoot";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext";
import { ScrollAreaScrollbarCssVars } from "../scrollbar/ScrollAreaScrollbarCssVars";
import { useScrollAreaScrollbarContext } from "../scrollbar/ScrollAreaScrollbarContext";
import { ScrollAreaThumbDataAttributes } from "./ScrollAreaThumbDataAttributes";

/**
 * The draggable part of the scrollbar that indicates the current scroll position.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://xxxxx.com/solid/components/scroll-area)
 */
export function ScrollAreaThumb(props: ScrollAreaThumb.Props) {
  const rootContext = useScrollAreaRootContext();
  const scrollbarContext = useScrollAreaScrollbarContext();

  const orientation = createMemo(() => scrollbarContext.orientation());
  const elementProps = createMemo(() => omit(props, ...THUMB_OMITTED_PROP_KEYS));
  const thumbStyle = createMemo<JSX.CSSProperties>(() => ({
    visibility: rootContext.hasMeasuredScrollbar() ? undefined : "hidden",
    ...(orientation() === "vertical"
      ? { height: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbHeight})` }
      : { width: `var(${ScrollAreaScrollbarCssVars.scrollAreaThumbWidth})` }),
    ...toStyleObject(props.style),
  }));

  return (
    <Dynamic
      component={props.render ?? "div"}
      ref={(element: HTMLDivElement) => {
        if (orientation() === "vertical") {
          rootContext.setThumbYElement(element);
        } else {
          rootContext.setThumbXElement(element);
        }
        assignRef(props.ref, element);
      }}
      style={thumbStyle()}
      onPointerDown={(event: ScrollAreaPointerEvent) => {
        rootContext.handlePointerDown(event);
        callEventHandler(props.onPointerDown, event);
      }}
      onPointerMove={(event: ScrollAreaPointerEvent) => {
        rootContext.handlePointerMove(event);
        callEventHandler(props.onPointerMove, event);
      }}
      onPointerUp={(event: ScrollAreaPointerEvent) => {
        if (orientation() === "vertical") {
          rootContext.setScrollingY(false);
        } else {
          rootContext.setScrollingX(false);
        }
        rootContext.handlePointerUp(event);
        callEventHandler(props.onPointerUp, event);
      }}
      {...{
        [ScrollAreaThumbDataAttributes.orientation]: orientation(),
      }}
      {...elementProps()}
    />
  );
}

export interface ScrollAreaThumbState {
  orientation: "horizontal" | "vertical";
}

export interface ScrollAreaThumbProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace ScrollAreaThumb {
  export type State = ScrollAreaThumbState;
  export type Props = ScrollAreaThumbProps;
}

const THUMB_OMITTED_PROP_KEYS = [
  "ref",
  "render",
  "style",
  "onPointerDown",
  "onPointerMove",
  "onPointerUp",
] as const satisfies ReadonlyArray<keyof ScrollAreaThumbProps>;

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
