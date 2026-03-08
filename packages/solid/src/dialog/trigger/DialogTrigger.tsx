import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { DialogHandle } from "../store/DialogHandle";
import { useDialogRootContext } from "../root/DialogRootContext";
import { DialogTriggerDataAttributes } from "./DialogTriggerDataAttributes";

/**
 * A button that opens the dialog.
 */
export function DialogTrigger<Payload = unknown>(props: DialogTrigger.Props<Payload>) {
  const dialogRootContext = useDialogRootContext(true);
  const readHandle = () => untrack(() => props.handle);
  const getStore = () => readHandle()?.store ?? dialogRootContext;

  if (dialogRootContext === null && readHandle() === undefined) {
    throw new Error(
      "Base UI: <Dialog.Trigger> must be used within <Dialog.Root> or provided with a handle.",
    );
  }

  const generatedId = useBaseUiId();
  const resolvedId = createMemo<string>(() =>
    typeof props.id === "string" ? props.id : generatedId,
  );

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });
  const payload = createMemo<Payload | undefined>(() => props.payload);

  createEffect(
    () => [getStore(), resolvedId()] as const,
    ([dialogStore, triggerId]) => {
      if (dialogStore === null) {
        return;
      }

      const unregister = dialogStore.registerTrigger(triggerId, triggerElement, payload);
      onCleanup(unregister);
    },
  );

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));

  const isOpenedByThisTrigger = createMemo<boolean>(() => {
    const dialogStore = getStore();
    if (dialogStore === null) {
      return false;
    }

    return dialogStore.isOpenedByTrigger(resolvedId());
  });

  const elementProps = createMemo<JSX.ButtonHTMLAttributes<HTMLButtonElement>>(() => {
    const {
      children: _children,
      handle: _handle,
      payload: _payload,
      id: _id,
      disabled: _disabled,
      nativeButton: _nativeButton,
      render: _render,
      ref: _ref,
      onClick: _onClick,
      ...rest
    } = props;
    void _children;
    void _handle;
    void _payload;
    void _id;
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
      id={resolvedId()}
      ref={(element) => {
        setTriggerElement(() => element);
        callRef(props.ref, element);
      }}
      type={typeof props.type === "string" ? props.type : "button"}
      disabled={disabled()}
      aria-haspopup="dialog"
      aria-expanded={isOpenedByThisTrigger() ? "true" : "false"}
      aria-controls={isOpenedByThisTrigger() ? getStore()?.popupId() : undefined}
      {...{
        [DialogTriggerDataAttributes.disabled]: disabled() ? "" : undefined,
        [DialogTriggerDataAttributes.popupOpen]: isOpenedByThisTrigger() ? "" : undefined,
      }}
      onClick={(event) => {
        callEventHandler(props.onClick, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        const dialogStore = getStore();
        if (dialogStore === null) {
          return;
        }

        if (dialogStore.isOpenedByTrigger(resolvedId())) {
          dialogStore.requestClose(event, "trigger-press", event.currentTarget);
          return;
        }

        dialogStore.requestOpen(resolvedId(), event, "trigger-press");
      }}
    >
      {props.children}
    </button>
  );
}

export interface DialogTriggerProps<
  Payload = unknown,
> extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * A handle to associate the trigger with a dialog.
   */
  handle?: DialogHandle<Payload> | undefined;
  /**
   * A payload to pass to the dialog when it is opened.
   */
  payload?: Payload | undefined;
  /**
   * ID of the trigger.
   */
  id?: string | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export interface DialogTriggerState {
  disabled: boolean;
  open: boolean;
}

export namespace DialogTrigger {
  export type Props<Payload = unknown> = DialogTriggerProps<Payload>;
  export type State = DialogTriggerState;
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
