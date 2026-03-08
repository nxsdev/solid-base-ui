import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { useTooltipPositionerContext } from "../positioner/TooltipPositionerContext";
import { TooltipArrowDataAttributes } from "./TooltipArrowDataAttributes";

/**
 * The tooltip arrow.
 */
export function TooltipArrow(props: TooltipArrow.Props) {
  const tooltipRootContext = useDialogRootContext();
  const positionerContext = useTooltipPositionerContext();

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
        [TooltipArrowDataAttributes.open]: tooltipRootContext.open() ? "" : undefined,
        [TooltipArrowDataAttributes.closed]: tooltipRootContext.open() ? undefined : "",
        [TooltipArrowDataAttributes.side]: positionerContext.side(),
        [TooltipArrowDataAttributes.align]: positionerContext.align(),
        [TooltipArrowDataAttributes.uncentered]: positionerContext.arrowUncentered()
          ? ""
          : undefined,
      }}
    >
      {props.children}
    </div>
  );
}

export interface TooltipArrowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface TooltipArrowState {
  open: boolean;
  side: string;
  align: string;
  uncentered: boolean;
}

export namespace TooltipArrow {
  export type Props = TooltipArrowProps;
  export type State = TooltipArrowState;
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
