import { Dynamic } from "@solidjs/web";
import { createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import { useScrollAreaRootContext } from "../root/ScrollAreaRootContext";

/**
 * A small rectangular area that appears at the intersection of horizontal and vertical scrollbars.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Scroll Area](https://xxxxx.com/solid/components/scroll-area)
 */
export function ScrollAreaCorner(props: ScrollAreaCorner.Props) {
  const rootContext = useScrollAreaRootContext();
  const hidden = createMemo(() => rootContext.hiddenState().corner);
  const elementProps = createMemo(() => omit(props, ...CORNER_OMITTED_PROP_KEYS));
  const cornerStyle = createMemo<JSX.CSSProperties>(() => ({
    position: "absolute",
    bottom: "0px",
    "inset-inline-end": "0px",
    width: `${rootContext.cornerSize().width}px`,
    height: `${rootContext.cornerSize().height}px`,
    ...toStyleObject(props.style),
  }));

  if (hidden()) {
    return null;
  }

  return (
    <Dynamic
      component={props.render ?? "div"}
      ref={(element: HTMLDivElement) => {
        rootContext.setCornerElement(element);
        assignRef(props.ref, element);
      }}
      style={cornerStyle()}
      {...elementProps()}
    />
  );
}

export interface ScrollAreaCornerState {}

export interface ScrollAreaCornerProps extends Omit<
  JSX.HTMLAttributes<HTMLDivElement>,
  "onChange"
> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace ScrollAreaCorner {
  export type State = ScrollAreaCornerState;
  export type Props = ScrollAreaCornerProps;
}

const CORNER_OMITTED_PROP_KEYS = ["ref", "render", "style"] as const satisfies ReadonlyArray<
  keyof ScrollAreaCornerProps
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
