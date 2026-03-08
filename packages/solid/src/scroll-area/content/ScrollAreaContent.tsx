import { Dynamic } from "@solidjs/web";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import type { ScrollAreaRoot } from "../root/ScrollAreaRoot";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext";
import { getScrollAreaStateDataAttributes } from "../root/stateAttributes";
import { useScrollAreaViewportContext } from "../viewport/ScrollAreaViewportContext";

/**
 * A container for the content of the scroll area.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://xxxxx.com/solid/components/scroll-area)
 */
export function ScrollAreaContent(props: ScrollAreaContent.Props) {
  const rootContext = useScrollAreaRootContext();
  const viewportContext = useScrollAreaViewportContext();
  const [contentElement, setContentElement] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });

  const elementProps = createMemo(() => omit(props, ...CONTENT_OMITTED_PROP_KEYS));
  const contentStyle = createMemo<JSX.CSSProperties>(() => ({
    minWidth: "fit-content",
    ...toStyleObject(props.style),
  }));

  createEffect(contentElement, (content) => {
    if (content === null || typeof ResizeObserver !== "function") {
      return;
    }

    const observer = new ResizeObserver(() => {
      viewportContext.computeThumbPosition();
    });
    observer.observe(content);

    onCleanup(() => {
      observer.disconnect();
    });
  });

  return (
    <Dynamic
      component={props.render ?? "div"}
      role="presentation"
      ref={(element: HTMLDivElement) => {
        setContentElement(element);
        assignRef(props.ref, element);
      }}
      style={contentStyle()}
      {...getScrollAreaStateDataAttributes(rootContext.state())}
      {...elementProps()}
    >
      {props.children}
    </Dynamic>
  );
}

export type ScrollAreaContentState = ScrollAreaRoot.State;

export interface ScrollAreaContentProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace ScrollAreaContent {
  export type State = ScrollAreaContentState;
  export type Props = ScrollAreaContentProps;
}

const CONTENT_OMITTED_PROP_KEYS = ["ref", "render", "style"] as const satisfies ReadonlyArray<
  keyof ScrollAreaContentProps
>;

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
