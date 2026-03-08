import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useDialogRootContext } from "../root/DialogRootContext";

/**
 * A button that closes the dialog.
 */
export function DialogClose(props: DialogClose.Props) {
  const dialogRootContext = useDialogRootContext();

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));

  const elementProps = createMemo<JSX.ButtonHTMLAttributes<HTMLButtonElement>>(() => {
    const {
      children: _children,
      disabled: _disabled,
      nativeButton: _nativeButton,
      render: _render,
      ref: _ref,
      onClick: _onClick,
      ...rest
    } = props;
    void _children;
    void _disabled;
    void _nativeButton;
    void _render;
    void _ref;
    void _onClick;
    return rest;
  });

  return (
    <button
      {...elementProps()}
      ref={(element) => {
        callRef(props.ref, element);
      }}
      type={typeof props.type === "string" ? props.type : "button"}
      disabled={disabled()}
      data-disabled={disabled() ? "" : undefined}
      onClick={(event) => {
        callEventHandler(props.onClick, event);

        if (event.defaultPrevented || !dialogRootContext.open() || disabled()) {
          return;
        }

        dialogRootContext.requestClose(event, "close-press", event.currentTarget);
      }}
    >
      {props.children}
    </button>
  );
}

export interface DialogCloseProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export interface DialogCloseState {
  disabled: boolean;
}

export namespace DialogClose {
  export type Props = DialogCloseProps;
  export type State = DialogCloseState;
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
