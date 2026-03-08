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
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import type { TooltipHandle } from "../handle";
import { useTooltipProviderContext } from "../provider/TooltipProviderContext";
import { OPEN_DELAY } from "../utils/constants";
import { TooltipTriggerDataAttributes } from "./TooltipTriggerDataAttributes";

/**
 * An element to attach the tooltip to.
 */
export function TooltipTrigger<Payload = unknown>(props: TooltipTrigger.Props<Payload>) {
  const tooltipRootContext = useDialogRootContext(true);
  const providerContext = useTooltipProviderContext();
  const readHandle = () => untrack(() => props.handle);
  const getStore = () => readHandle()?.store ?? tooltipRootContext;

  if (tooltipRootContext === null && readHandle() === undefined) {
    throw new Error(
      "Base UI: <Tooltip.Trigger> must be used within <Tooltip.Root> or provided with a handle.",
    );
  }

  const generatedId = useBaseUiId();
  const resolvedId = createMemo<string>(() =>
    typeof props.id === "string" ? props.id : generatedId,
  );

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });

  createEffect(
    () => [getStore(), resolvedId()] as const,
    ([tooltipStore, triggerId]) => {
      if (tooltipStore === null) {
        return;
      }

      const unregister = tooltipStore.registerTrigger(
        triggerId,
        triggerElement,
        () => props.payload,
      );
      onCleanup(unregister);
    },
  );

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));
  const closeOnClick = createMemo<boolean>(() => resolveBoolean(props.closeOnClick, true));
  const openDelay = createMemo<number>(() => {
    const fromProvider = providerContext?.delay;
    return resolveDelay(props.delay, fromProvider ?? OPEN_DELAY);
  });
  const closeDelay = createMemo<number>(() => {
    const fromProvider = providerContext?.closeDelay;
    return resolveDelay(props.closeDelay, fromProvider ?? 0);
  });

  const isOpenedByThisTrigger = createMemo<boolean>(() => {
    const tooltipStore = getStore();
    if (tooltipStore === null) {
      return false;
    }

    return tooltipStore.isOpenedByTrigger(resolvedId());
  });

  let openTimeoutId: number | undefined;
  let closeTimeoutId: number | undefined;

  const clearTimers = () => {
    if (openTimeoutId !== undefined) {
      clearTimeout(openTimeoutId);
      openTimeoutId = undefined;
    }

    if (closeTimeoutId !== undefined) {
      clearTimeout(closeTimeoutId);
      closeTimeoutId = undefined;
    }
  };

  onCleanup(clearTimers);

  const requestOpen = () => {
    const tooltipStore = getStore();
    if (tooltipStore === null || tooltipStore.isOpenedByTrigger(resolvedId())) {
      return;
    }

    tooltipStore.requestOpen(resolvedId(), new Event("base-ui"), "none");
  };

  const requestClose = () => {
    const tooltipStore = getStore();
    if (tooltipStore === null || !tooltipStore.isOpenedByTrigger(resolvedId())) {
      return;
    }

    tooltipStore.requestClose(new Event("base-ui"), "focus-out", triggerElement() ?? undefined);
  };

  const elementProps = createMemo<JSX.ButtonHTMLAttributes<HTMLButtonElement>>(() => {
    const {
      children: _children,
      handle: _handle,
      payload: _payload,
      id: _id,
      delay: _delay,
      closeDelay: _closeDelay,
      closeOnClick: _closeOnClick,
      disabled: _disabled,
      nativeButton: _nativeButton,
      render: _render,
      ref: _ref,
      onClick: _onClick,
      onFocus: _onFocus,
      onBlur: _onBlur,
      onPointerEnter: _onPointerEnter,
      onPointerLeave: _onPointerLeave,
      ...rest
    } = props;
    void _children;
    void _handle;
    void _payload;
    void _id;
    void _delay;
    void _closeDelay;
    void _closeOnClick;
    void _disabled;
    void _nativeButton;
    void _render;
    void _ref;
    void _onClick;
    void _onFocus;
    void _onBlur;
    void _onPointerEnter;
    void _onPointerLeave;
    return rest;
  });

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
      aria-describedby={isOpenedByThisTrigger() ? getStore()?.popupId() : undefined}
      {...{
        [TooltipTriggerDataAttributes.popupOpen]: isOpenedByThisTrigger() ? "" : undefined,
        [TooltipTriggerDataAttributes.triggerDisabled]: disabled() ? "" : undefined,
      }}
      onPointerEnter={(event) => {
        callEventHandler(props.onPointerEnter, event);

        if (
          event.defaultPrevented ||
          disabled() ||
          (event as PointerEvent).pointerType === "touch"
        ) {
          return;
        }

        clearTimers();
        openTimeoutId = window.setTimeout(requestOpen, openDelay());
      }}
      onPointerLeave={(event) => {
        callEventHandler(props.onPointerLeave, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearTimers();
        closeTimeoutId = window.setTimeout(requestClose, closeDelay());
      }}
      onFocus={(event) => {
        callEventHandler(props.onFocus, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearTimers();
        requestOpen();
      }}
      onBlur={(event) => {
        callEventHandler(props.onBlur, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearTimers();
        closeTimeoutId = window.setTimeout(requestClose, closeDelay());
      }}
      onClick={(event) => {
        callEventHandler(props.onClick, event);

        if (event.defaultPrevented || disabled() || !closeOnClick()) {
          return;
        }

        clearTimers();

        const tooltipStore = getStore();
        if (tooltipStore === null || !tooltipStore.isOpenedByTrigger(resolvedId())) {
          return;
        }

        tooltipStore.requestClose(event, "trigger-press", event.currentTarget);
      }}
    >
      {props.children}
    </button>
  );
}

export interface TooltipTriggerProps<
  Payload = unknown,
> extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  handle?: TooltipHandle<Payload> | undefined;
  payload?: Payload | undefined;
  id?: string | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  closeOnClick?: boolean | undefined;
}

export interface TooltipTriggerState {
  disabled: boolean;
  open: boolean;
}

export namespace TooltipTrigger {
  export type Props<Payload = unknown> = TooltipTriggerProps<Payload>;
  export type State = TooltipTriggerState;
}

function resolveDelay(value: number | undefined, fallback: number): number {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
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
