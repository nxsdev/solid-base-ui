import { Show, createMemo, type JSX, type ValidComponent } from "solid-js";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { DrawerBackdropCssVars } from "./DrawerBackdropCssVars";
import { DrawerBackdropDataAttributes } from "./DrawerBackdropDataAttributes";
import { DrawerPopupCssVars } from "../popup/DrawerPopupCssVars";

/**
 * An overlay displayed beneath the popup.
 */
export function DrawerBackdrop(props: DrawerBackdrop.Props) {
  const dialogRootContext = useDialogRootContext();

  const enabled = createMemo<boolean>(() => props.forceRender || !dialogRootContext.nested());

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);

    return {
      pointerEvents: dialogRootContext.open() ? undefined : "none",
      userSelect: "none",
      WebkitUserSelect: "none",
      [DrawerBackdropCssVars.swipeProgress]: "0",
      [DrawerPopupCssVars.swipeStrength]: "1",
      ...inputStyle,
    };
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const {
      children: _children,
      forceRender: _forceRender,
      render: _render,
      ref: _ref,
      style: _style,
      onClick: _onClick,
      ...rest
    } = props;
    void _children;
    void _forceRender;
    void _render;
    void _ref;
    void _style;
    void _onClick;
    return rest;
  });

  return (
    <Show when={enabled()}>
      <div
        {...elementProps()}
        ref={(element) => {
          dialogRootContext.setBackdropElement(element);
          callRef(props.ref, element);
        }}
        role="presentation"
        hidden={!dialogRootContext.mounted()}
        {...{
          [DrawerBackdropDataAttributes.open]: dialogRootContext.open() ? "" : undefined,
          [DrawerBackdropDataAttributes.closed]: dialogRootContext.open() ? undefined : "",
        }}
        style={style()}
        onClick={(event) => {
          callEventHandler(props.onClick, event);

          if (event.defaultPrevented || dialogRootContext.disablePointerDismissal()) {
            return;
          }

          dialogRootContext.requestClose(event, "outside-press", event.currentTarget);
        }}
      >
        {props.children}
      </div>
    </Show>
  );
}

export interface DrawerBackdropProps extends JSX.HTMLAttributes<HTMLDivElement> {
  forceRender?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export interface DrawerBackdropState {
  open: boolean;
}

export namespace DrawerBackdrop {
  export type Props = DrawerBackdropProps;
  export type State = DrawerBackdropState;
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
