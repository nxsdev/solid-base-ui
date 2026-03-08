import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { usePopoverPositionerContext } from "../positioner/PopoverPositionerContext";
import { PopoverArrowDataAttributes } from "./PopoverArrowDataAttributes";

/**
 * The popover arrow.
 */
export function PopoverArrow(props: PopoverArrow.Props) {
  const popoverRootContext = useDialogRootContext();
  const positionerContext = usePopoverPositionerContext();

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const { children: _children, render: _render, ref: _ref, style: _style, ...rest } = props;
    void _children;
    void _render;
    void _ref;
    void _style;
    return rest;
  });

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);
    return {
      ...inputStyle,
      ...positionerContext.arrowStyle(),
    };
  });

  return (
    <div
      {...elementProps()}
      ref={(element) => {
        positionerContext.setArrowElement(element);
        callRef(props.ref, element);
      }}
      role="presentation"
      style={style()}
      {...{
        [PopoverArrowDataAttributes.open]: popoverRootContext.open() ? "" : undefined,
        [PopoverArrowDataAttributes.closed]: popoverRootContext.open() ? undefined : "",
        [PopoverArrowDataAttributes.side]: positionerContext.side(),
        [PopoverArrowDataAttributes.align]: positionerContext.align(),
        [PopoverArrowDataAttributes.uncentered]: positionerContext.arrowUncentered()
          ? ""
          : undefined,
      }}
    >
      {props.children}
    </div>
  );
}

export interface PopoverArrowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface PopoverArrowState {
  open: boolean;
  side: string;
  align: string;
  uncentered: boolean;
}

export namespace PopoverArrow {
  export type Props = PopoverArrowProps;
  export type State = PopoverArrowState;
}

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
