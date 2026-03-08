import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { usePreviewCardPositionerContext } from "../positioner/PreviewCardPositionerContext";
import { PreviewCardArrowDataAttributes } from "./PreviewCardArrowDataAttributes";

/**
 * The preview card arrow.
 */
export function PreviewCardArrow(props: PreviewCardArrow.Props) {
  const previewCardRootContext = useDialogRootContext();
  const positionerContext = usePreviewCardPositionerContext();

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
        [PreviewCardArrowDataAttributes.open]: previewCardRootContext.open() ? "" : undefined,
        [PreviewCardArrowDataAttributes.closed]: previewCardRootContext.open() ? undefined : "",
        [PreviewCardArrowDataAttributes.side]: positionerContext.side(),
        [PreviewCardArrowDataAttributes.align]: positionerContext.align(),
        [PreviewCardArrowDataAttributes.uncentered]: positionerContext.arrowUncentered()
          ? ""
          : undefined,
      }}
    >
      {props.children}
    </div>
  );
}

export interface PreviewCardArrowProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface PreviewCardArrowState {
  open: boolean;
  side: string;
  align: string;
  uncentered: boolean;
}

export namespace PreviewCardArrow {
  export type Props = PreviewCardArrowProps;
  export type State = PreviewCardArrowState;
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
