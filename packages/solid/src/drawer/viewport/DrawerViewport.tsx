import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { DialogViewport } from "../../dialog/viewport/DialogViewport";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { DrawerViewportDataAttributes } from "./DrawerViewportDataAttributes";

/**
 * A positioning container for the drawer popup that can be made scrollable.
 */
export function DrawerViewport(props: DrawerViewport.Props) {
  const dialogRootContext = useDialogRootContext();

  const nested = createMemo<boolean>(() => dialogRootContext.nested());

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);

    return {
      ...inputStyle,
    };
  });

  const elementProps = createMemo<DrawerViewport.Props>(() => {
    const {
      children: _children,
      render: _render,
      ref: _ref,
      style: _style,
      onPointerDown: _onPointerDown,
      ...rest
    } = props;
    void _children;
    void _render;
    void _ref;
    void _style;
    void _onPointerDown;
    return rest;
  });

  return (
    <DialogViewport
      {...elementProps()}
      ref={props.ref}
      style={style()}
      {...{
        [DrawerViewportDataAttributes.nested]: nested() ? "" : undefined,
      }}
      onPointerDown={(event) => {
        callEventHandler(props.onPointerDown, event);

        if (event.defaultPrevented || event.pointerType === "touch") {
          return;
        }

        const selection = window.getSelection();
        if (selection !== null && !selection.isCollapsed) {
          selection.removeAllRanges();
        }
      }}
    >
      {props.children}
    </DialogViewport>
  );
}

export interface DrawerViewportProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface DrawerViewportState {
  open: boolean;
  nested: boolean;
}

export namespace DrawerViewport {
  export type Props = DrawerViewportProps;
  export type State = DrawerViewportState;
}

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}

function callEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & {
    currentTarget: TElement;
    target: EventTarget & Element;
  },
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
