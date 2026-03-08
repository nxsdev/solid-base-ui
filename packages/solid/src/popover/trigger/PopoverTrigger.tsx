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
import type { PopoverHandle } from "../handle";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import { PopoverTriggerDataAttributes } from "./PopoverTriggerDataAttributes";

const OPEN_DELAY = 300;

/**
 * A button that opens the popover.
 */
export function PopoverTrigger<Payload = unknown>(props: PopoverTrigger.Props<Payload>) {
  const popoverRootContext = useDialogRootContext(true);
  const readHandle = () => untrack(() => props.handle);
  const getStore = () => readHandle()?.store ?? popoverRootContext;

  if (popoverRootContext === null && readHandle() === undefined) {
    throw new Error(
      "Base UI: <Popover.Trigger> must be used within <Popover.Root> or provided with a handle.",
    );
  }

  const generatedId = useBaseUiId();
  const resolvedId = createMemo<string>(() =>
    typeof props.id === "string" ? props.id : generatedId,
  );

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });
  const [openedByPress, setOpenedByPress] = createSignal(false);

  createEffect(
    () => [getStore(), resolvedId()] as const,
    ([popoverStore, triggerId]) => {
      if (popoverStore === null) {
        return;
      }

      const unregister = popoverStore.registerTrigger(
        triggerId,
        triggerElement,
        () => props.payload,
      );
      onCleanup(unregister);
    },
  );

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));
  const openOnHover = createMemo<boolean>(() => resolveBoolean(props.openOnHover, false));
  const hoverDelay = createMemo<number>(() => resolveDelay(props.delay, OPEN_DELAY));
  const hoverCloseDelay = createMemo<number>(() => resolveDelay(props.closeDelay, 0));

  const isOpenedByThisTrigger = createMemo<boolean>(() => {
    const popoverStore = getStore();
    if (popoverStore === null) {
      return false;
    }

    return popoverStore.isOpenedByTrigger(resolvedId());
  });

  createEffect(isOpenedByThisTrigger, (isOpen) => {
    if (!isOpen) {
      setOpenedByPress(() => false);
    }
  });

  let openTimeoutId: number | undefined;
  let closeTimeoutId: number | undefined;

  const clearHoverTimers = () => {
    if (openTimeoutId !== undefined) {
      clearTimeout(openTimeoutId);
      openTimeoutId = undefined;
    }

    if (closeTimeoutId !== undefined) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = undefined;
    }
  };

  onCleanup(clearHoverTimers);

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
      openOnHover: _openOnHover,
      delay: _delay,
      closeDelay: _closeDelay,
      onClick: _onClick,
      onPointerEnter: _onPointerEnter,
      onPointerLeave: _onPointerLeave,
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
    void _openOnHover;
    void _delay;
    void _closeDelay;
    void _onClick;
    void _onPointerEnter;
    void _onPointerLeave;
    return rest;
  });

  const requestHoverOpen = () => {
    const popoverStore = getStore();
    if (popoverStore === null || popoverStore.isOpenedByTrigger(resolvedId())) {
      return;
    }

    setOpenedByPress(() => false);
    popoverStore.requestOpen(resolvedId(), new Event("base-ui"), "none");
  };

  const requestHoverClose = () => {
    const popoverStore = getStore();
    if (popoverStore === null || !popoverStore.isOpenedByTrigger(resolvedId())) {
      return;
    }

    popoverStore.requestClose(new Event("base-ui"), "focus-out", triggerElement() ?? undefined);
    setOpenedByPress(() => false);
  };

  return (
    <button
      {...elementProps()}
      id={resolvedId()}
      ref={(element) => {
        setTriggerElement((previous) => (previous === element ? previous : element));
        callRef(
          untrack(() => props.ref),
          element,
        );
      }}
      type={typeof props.type === "string" ? props.type : "button"}
      disabled={disabled()}
      aria-haspopup="dialog"
      aria-expanded={isOpenedByThisTrigger() ? "true" : "false"}
      aria-controls={isOpenedByThisTrigger() ? getStore()?.popupId() : undefined}
      {...{
        [PopoverTriggerDataAttributes.popupOpen]: isOpenedByThisTrigger() ? "" : undefined,
        [PopoverTriggerDataAttributes.pressed]:
          isOpenedByThisTrigger() && openedByPress() ? "" : undefined,
      }}
      onPointerEnter={(event) => {
        callEventHandler(props.onPointerEnter, event);

        if (
          event.defaultPrevented ||
          disabled() ||
          !openOnHover() ||
          (event as PointerEvent).pointerType === "touch"
        ) {
          return;
        }

        clearHoverTimers();
        openTimeoutId = window.setTimeout(requestHoverOpen, hoverDelay());
      }}
      onPointerLeave={(event) => {
        callEventHandler(props.onPointerLeave, event);

        if (event.defaultPrevented || disabled() || !openOnHover()) {
          return;
        }

        clearHoverTimers();
        closeTimeoutId = window.setTimeout(requestHoverClose, hoverCloseDelay());
      }}
      onClick={(event) => {
        callEventHandler(props.onClick, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearHoverTimers();

        const popoverStore = getStore();
        if (popoverStore === null) {
          return;
        }

        if (popoverStore.isOpenedByTrigger(resolvedId())) {
          popoverStore.requestClose(event, "trigger-press", event.currentTarget);
          setOpenedByPress(() => false);
          return;
        }

        popoverStore.requestOpen(resolvedId(), event, "trigger-press");
        setOpenedByPress(() => true);
      }}
    >
      {props.children}
    </button>
  );
}

export interface PopoverTriggerProps<
  Payload = unknown,
> extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  /**
   * A handle to associate the trigger with a popover.
   */
  handle?: PopoverHandle<Payload> | undefined;
  /**
   * A payload to pass to the popover when it is opened.
   */
  payload?: Payload | undefined;
  /**
   * ID of the trigger.
   */
  id?: string | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
  /**
   * Whether the popover should also open when the trigger is hovered.
   * @default false
   */
  openOnHover?: boolean | undefined;
  /**
   * Hover open delay in milliseconds.
   * @default 300
   */
  delay?: number | undefined;
  /**
   * Hover close delay in milliseconds.
   * @default 0
   */
  closeDelay?: number | undefined;
}

export interface PopoverTriggerState {
  disabled: boolean;
  open: boolean;
}

export namespace PopoverTrigger {
  export type Props<Payload = unknown> = PopoverTriggerProps<Payload>;
  export type State = PopoverTriggerState;
}

function resolveDelay(value: number | string | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value === "string") {
    const parsed = Number.parseFloat(value);
    if (Number.isFinite(parsed)) {
      return parsed;
    }
  }

  return fallback;
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
