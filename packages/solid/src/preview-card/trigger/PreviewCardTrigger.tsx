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
import type { PreviewCardHandle } from "../handle";
import { PreviewCardTriggerDataAttributes } from "./PreviewCardTriggerDataAttributes";

const OPEN_DELAY = 600;
const CLOSE_DELAY = 300;

/**
 * A link that opens the preview card.
 */
export function PreviewCardTrigger<Payload = unknown>(props: PreviewCardTrigger.Props<Payload>) {
  const previewCardRootContext = useDialogRootContext(true);
  const readHandle = () => untrack(() => props.handle);
  const getStore = () => readHandle()?.store ?? previewCardRootContext;

  if (previewCardRootContext === null && readHandle() === undefined) {
    throw new Error(
      "Base UI: <PreviewCard.Trigger> must be used within <PreviewCard.Root> or provided with a handle.",
    );
  }

  const generatedId = useBaseUiId();
  const resolvedId = createMemo<string>(() =>
    typeof props.id === "string" ? props.id : generatedId,
  );

  const [triggerElement, setTriggerElement] = createSignal<HTMLAnchorElement | null>(null, {
    pureWrite: true,
  });

  createEffect(
    () => [getStore(), resolvedId()] as const,
    ([previewCardStore, triggerId]) => {
      if (previewCardStore === null) {
        return;
      }

      const unregister = previewCardStore.registerTrigger(
        triggerId,
        triggerElement,
        () => props.payload,
      );
      onCleanup(unregister);
    },
  );

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));
  const openDelay = createMemo<number>(() => resolveDelay(props.delay, OPEN_DELAY));
  const closeDelay = createMemo<number>(() => resolveDelay(props.closeDelay, CLOSE_DELAY));

  const isOpenedByThisTrigger = createMemo<boolean>(() => {
    const previewCardStore = getStore();
    if (previewCardStore === null) {
      return false;
    }

    return previewCardStore.isOpenedByTrigger(resolvedId());
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

  const requestHoverOpen = () => {
    const previewCardStore = getStore();
    const triggerId = untrack(resolvedId);

    if (previewCardStore === null || previewCardStore.isOpenedByTrigger(triggerId)) {
      return;
    }

    previewCardStore.requestOpen(triggerId, new Event("base-ui"), "none");
  };

  const requestHoverClose = () => {
    const previewCardStore = getStore();
    const triggerId = untrack(resolvedId);

    if (previewCardStore === null || !previewCardStore.isOpenedByTrigger(triggerId)) {
      return;
    }

    previewCardStore.requestClose(
      new Event("base-ui"),
      "focus-out",
      untrack(triggerElement) ?? undefined,
    );
  };

  const elementProps = createMemo<JSX.AnchorHTMLAttributes<HTMLAnchorElement>>(() => {
    const {
      children: _children,
      handle: _handle,
      payload: _payload,
      id: _id,
      disabled: _disabled,
      render: _render,
      ref: _ref,
      delay: _delay,
      closeDelay: _closeDelay,
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
    void _disabled;
    void _render;
    void _ref;
    void _delay;
    void _closeDelay;
    void _onClick;
    void _onFocus;
    void _onBlur;
    void _onPointerEnter;
    void _onPointerLeave;
    return rest;
  });

  return (
    <a
      {...elementProps()}
      id={resolvedId()}
      ref={(element) => {
        setTriggerElement((previous) => (previous === element ? previous : element));
        callRef(
          untrack(() => props.ref),
          element,
        );
      }}
      tabindex={disabled() ? -1 : props.tabindex}
      aria-haspopup="dialog"
      aria-expanded={isOpenedByThisTrigger() ? "true" : "false"}
      aria-controls={isOpenedByThisTrigger() ? getStore()?.popupId() : undefined}
      aria-disabled={disabled() ? "true" : undefined}
      {...{
        [PreviewCardTriggerDataAttributes.popupOpen]: isOpenedByThisTrigger() ? "" : undefined,
        [PreviewCardTriggerDataAttributes.disabled]: disabled() ? "" : undefined,
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
        openTimeoutId = window.setTimeout(requestHoverOpen, openDelay());
      }}
      onPointerLeave={(event) => {
        callEventHandler(props.onPointerLeave, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearTimers();
        closeTimeoutId = window.setTimeout(requestHoverClose, closeDelay());
      }}
      onFocus={(event) => {
        callEventHandler(props.onFocus, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearTimers();
        openTimeoutId = window.setTimeout(requestHoverOpen, openDelay());
      }}
      onBlur={(event) => {
        callEventHandler(props.onBlur, event);

        if (event.defaultPrevented || disabled()) {
          return;
        }

        clearTimers();
        closeTimeoutId = window.setTimeout(requestHoverClose, closeDelay());
      }}
      onClick={(event) => {
        callEventHandler(props.onClick, event);

        if (event.defaultPrevented) {
          return;
        }

        if (disabled()) {
          event.preventDefault();
          return;
        }

        const previewCardStore = getStore();
        if (previewCardStore === null) {
          return;
        }

        clearTimers();

        if (previewCardStore.isOpenedByTrigger(resolvedId())) {
          previewCardStore.requestClose(event, "trigger-press", event.currentTarget);
          return;
        }

        previewCardStore.requestOpen(resolvedId(), event, "trigger-press");
      }}
    >
      {props.children}
    </a>
  );
}

export interface PreviewCardTriggerProps<
  Payload = unknown,
> extends JSX.AnchorHTMLAttributes<HTMLAnchorElement> {
  /**
   * A handle to associate the trigger with a preview card.
   */
  handle?: PreviewCardHandle<Payload> | undefined;
  /**
   * A payload to pass to the preview card when it is opened.
   */
  payload?: Payload | undefined;
  /**
   * ID of the trigger.
   */
  id?: string | undefined;
  /**
   * Whether interactions should be disabled.
   */
  disabled?: boolean | string | undefined;
  render?: ValidComponent | undefined;
  /**
   * Hover/focus open delay in milliseconds.
   * @default 600
   */
  delay?: number | undefined;
  /**
   * Hover/focus close delay in milliseconds.
   * @default 300
   */
  closeDelay?: number | undefined;
}

export interface PreviewCardTriggerState {
  disabled: boolean;
  open: boolean;
}

export namespace PreviewCardTrigger {
  export type Props<Payload = unknown> = PreviewCardTriggerProps<Payload>;
  export type State = PreviewCardTriggerState;
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
