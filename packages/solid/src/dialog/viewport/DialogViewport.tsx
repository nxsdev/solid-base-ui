import { Show, createMemo, type JSX, type ValidComponent } from "solid-js";
import { useDialogPortalContext } from "../portal/DialogPortalContext";
import { useDialogRootContext } from "../root/DialogRootContext";
import { DialogViewportDataAttributes } from "./DialogViewportDataAttributes";

/**
 * A positioning container for the dialog popup that can be made scrollable.
 */
export function DialogViewport(props: DialogViewport.Props) {
  const keepMounted = useDialogPortalContext();
  const dialogRootContext = useDialogRootContext();

  const shouldRender = createMemo<boolean>(() => keepMounted || dialogRootContext.mounted());
  const nestedDialogOpen = createMemo<boolean>(() => dialogRootContext.nestedOpenDialogCount() > 0);

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);

    return {
      pointerEvents: dialogRootContext.open() ? undefined : "none",
      ...inputStyle,
    };
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const { children: _children, render: _render, ref: _ref, style: _style, ...rest } = props;
    void _children;
    void _render;
    void _ref;
    void _style;
    return rest;
  });

  return (
    <Show when={shouldRender()}>
      <div
        {...elementProps()}
        ref={(element) => {
          dialogRootContext.setViewportElement(element);
          callRef(props.ref, element);
        }}
        role="presentation"
        hidden={!dialogRootContext.mounted()}
        {...{
          [DialogViewportDataAttributes.open]: dialogRootContext.open() ? "" : undefined,
          [DialogViewportDataAttributes.closed]: dialogRootContext.open() ? undefined : "",
          [DialogViewportDataAttributes.nested]: dialogRootContext.nested() ? "" : undefined,
          [DialogViewportDataAttributes.nestedDialogOpen]: nestedDialogOpen() ? "" : undefined,
        }}
        style={style()}
      >
        {props.children}
      </div>
    </Show>
  );
}

export interface DialogViewportProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface DialogViewportState {
  open: boolean;
  nested: boolean;
  nestedDialogOpen: boolean;
}

export namespace DialogViewport {
  export type Props = DialogViewportProps;
  export type State = DialogViewportState;
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
