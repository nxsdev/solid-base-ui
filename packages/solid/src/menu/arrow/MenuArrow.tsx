import { Dynamic } from "../../internal/Dynamic";
import { createMemo, omit, type JSX, type ValidComponent } from "solid-js";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext";
import { useMenuRootContext } from "../root/MenuRootContext";
import { MenuArrowDataAttributes } from "./MenuArrowDataAttributes";

/**
 * Displays an element positioned against the menu anchor.
 */
export function MenuArrow(props: MenuArrow.Props) {
  const menuRootContext = useMenuRootContext();
  const positionerContext = useMenuPositionerContext();
  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...ARROW_OMITTED_PROP_KEYS));
  const style = createMemo<JSX.CSSProperties>(() => ({
    ...toStyleObject(props.style),
    ...positionerContext.arrowStyle(),
  }));

  return (
    <Dynamic
      component={component()}
      {...elementProps()}
      ref={(element: HTMLDivElement | null) => {
        positionerContext.setArrowElement(element);
        callRef(props.ref, element);
      }}
      role="presentation"
      style={style()}
      {...{
        [MenuArrowDataAttributes.open]: menuRootContext.open() ? "" : undefined,
        [MenuArrowDataAttributes.closed]: menuRootContext.open() ? undefined : "",
        [MenuArrowDataAttributes.side]: positionerContext.side(),
        [MenuArrowDataAttributes.align]: positionerContext.align(),
        [MenuArrowDataAttributes.uncentered]: positionerContext.arrowUncentered() ? "" : undefined,
      }}
    >
      {props.children}
    </Dynamic>
  );
}

export interface MenuArrowState {
  open: boolean;
  side: string;
  align: string;
  uncentered: boolean;
}

export interface MenuArrowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export namespace MenuArrow {
  export type State = MenuArrowState;
  export type Props = MenuArrowProps;
}

const ARROW_OMITTED_PROP_KEYS = [
  "children",
  "render",
  "ref",
  "style",
] as const satisfies ReadonlyArray<keyof MenuArrowProps>;

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
