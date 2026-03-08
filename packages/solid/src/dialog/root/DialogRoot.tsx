import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
  type JSX,
} from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { DialogHandle, type DialogHandleStore } from "../store/DialogHandle";
import {
  DialogRootContext,
  type DialogRootContextValue,
  type DialogTriggerRegistration,
  useDialogRootContext,
} from "./DialogRootContext";

/**
 * Groups all parts of the dialog.
 * Doesn't render its own HTML element.
 */
export function DialogRoot<Payload = unknown>(props: DialogRoot.Props<Payload>) {
  const parentDialogRootContext = useDialogRootContext(true);

  const [openState, setOpenState] = createSignal(
    untrack(() => props.open ?? props.defaultOpen ?? false),
  );
  const [activeTriggerIdState, setActiveTriggerIdState] = createSignal<string | null>(
    untrack(() => props.defaultTriggerId ?? null),
  );
  const [detachedPayload, setDetachedPayload] = createSignal<Payload | undefined>(undefined);
  const [popupIdState, setPopupIdState] = createSignal<string | undefined>(undefined);
  const [titleElementIdState, setTitleElementIdState] = createSignal<string | undefined>(undefined);
  const [descriptionElementIdState, setDescriptionElementIdState] = createSignal<
    string | undefined
  >(undefined);
  const [popupElementState, setPopupElementState] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });
  const [, setViewportElementState] = createSignal<HTMLElement | null>(null, { pureWrite: true });
  const [, setBackdropElementState] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [, setInternalBackdropElementState] = createSignal<HTMLDivElement | null>(null, {
    pureWrite: true,
  });
  const [nestedOpenDialogCount, setNestedOpenDialogCount] = createSignal(0);
  const [openInteractionType, setOpenInteractionType] = createSignal<DialogInteractionType | null>(
    null,
  );
  const [initialFocusResolver, setInitialFocusResolver] = createSignal<
    (() => HTMLElement | null | undefined) | null
  >(null);
  const [finalFocusResolver, setFinalFocusResolver] = createSignal<
    (() => HTMLElement | null | undefined) | null
  >(null);
  const [preventUnmountOnClose, setPreventUnmountOnClose] = createSignal(false);
  const [triggerRegistryVersion, setTriggerRegistryVersion] = createSignal(0);

  const triggerRegistry = new Map<string, DialogTriggerRegistration<Payload>>();

  const open = createMemo<boolean>(() => props.open ?? openState());
  const activeTriggerId = createMemo<string | null>(
    () => props.triggerId ?? activeTriggerIdState(),
  );
  const nested = createMemo<boolean>(() => parentDialogRootContext !== null);
  const modal = createMemo<DialogRoot.Modal>(() => props.modal ?? true);
  const role = createMemo<DialogRoot.Role>(() => props.role ?? "dialog");
  const disablePointerDismissal = createMemo<boolean>(() => props.disablePointerDismissal ?? false);
  const mounted = createMemo<boolean>(() => open() || preventUnmountOnClose());

  const activeTriggerElement = createMemo<HTMLElement | undefined>(() => {
    triggerRegistryVersion();

    const triggerId = activeTriggerId();
    if (triggerId === null) {
      return undefined;
    }

    const registration = triggerRegistry.get(triggerId);
    return registration?.element() ?? undefined;
  });

  const payload = createMemo<Payload | undefined>(() => {
    triggerRegistryVersion();

    const triggerId = activeTriggerId();
    if (triggerId === null) {
      return detachedPayload();
    }

    const registration = triggerRegistry.get(triggerId);
    if (registration === undefined) {
      return detachedPayload();
    }

    return registration.payload();
  });

  const registerTrigger = (
    id: string,
    element: Accessor<HTMLElement | null>,
    triggerPayload: Accessor<Payload | undefined>,
  ) => {
    triggerRegistry.set(id, {
      element,
      payload: triggerPayload,
    });
    setTriggerRegistryVersion((prev) => prev + 1);

    return () => {
      const registered = triggerRegistry.get(id);
      if (registered?.element === element) {
        triggerRegistry.delete(id);
        setTriggerRegistryVersion((prev) => prev + 1);
      }
    };
  };

  const setOpenValue = (
    nextOpen: boolean,
    event: Event | undefined,
    reason: DialogRoot.ChangeEventReason,
    trigger: Element | undefined,
  ) => {
    const resolvedEvent = event ?? new Event("base-ui");
    const resolvedTrigger = trigger ?? activeTriggerElement();
    const { details, shouldPreventUnmountOnClose } = createDialogChangeEventDetails(
      resolvedEvent,
      resolvedTrigger,
      reason,
    );

    props.onOpenChange?.(nextOpen, details);

    if (details.isCanceled) {
      return;
    }

    if (nextOpen) {
      setPreventUnmountOnClose(() => false);
    } else if (shouldPreventUnmountOnClose()) {
      setPreventUnmountOnClose(() => true);
    }

    if (props.open === undefined) {
      setOpenState(() => nextOpen);
    }
  };

  const requestOpen = (
    triggerId: string | null,
    event: Event,
    reason: DialogRoot.ChangeEventReason,
  ) => {
    setOpenInteractionType(() => getInteractionType(event));
    setDetachedPayload(() => undefined);

    if (props.triggerId === undefined) {
      setActiveTriggerIdState(() => triggerId);
    }

    if (open()) {
      return;
    }

    const triggerElement =
      triggerId === null ? undefined : (triggerRegistry.get(triggerId)?.element() ?? undefined);
    setOpenValue(true, event, reason, triggerElement);
  };

  const requestClose = (event: Event, reason: DialogRoot.ChangeEventReason, trigger?: Element) => {
    setOpenInteractionType(() => getInteractionType(event));

    if (!open()) {
      return;
    }

    setOpenValue(false, event, reason, trigger);
  };

  const openWithPayload = (nextPayload: Payload) => {
    setDetachedPayload(() => nextPayload);
    setOpenInteractionType(() => null);

    if (props.triggerId === undefined) {
      setActiveTriggerIdState(() => null);
    }

    if (!open()) {
      setOpenValue(true, new Event("base-ui"), "imperative-action", undefined);
    }
  };

  const closeFromAction = () => {
    requestClose(new Event("base-ui"), "imperative-action");
  };

  const unmountFromAction = () => {
    setPreventUnmountOnClose(() => false);
  };

  assignActionsRef(props.actionsRef, {
    close: closeFromAction,
    unmount: unmountFromAction,
  });

  const handleStore: DialogHandleStore<Payload> = {
    popupId: popupIdState,
    registerTrigger,
    requestOpen,
    requestClose,
    isOpenedByTrigger(id) {
      return open() && activeTriggerId() === id;
    },
    isOpen: open,
    open(triggerId) {
      requestOpen(triggerId, new Event("base-ui"), "imperative-action");
    },
    openWithPayload,
    close: closeFromAction,
  };

  createEffect(
    () => props.handle,
    (handle) => {
      if (handle === undefined) {
        return;
      }

      handle.store = handleStore;

      onCleanup(() => {
        if (handle.store === handleStore) {
          handle.store = null;
        }
      });
    },
  );

  let previousOpen = open();
  let previouslyFocusedElement: HTMLElement | null = null;

  createEffect(open, (isOpen) => {
    if (isOpen && !previousOpen) {
      setPreventUnmountOnClose(() => false);
      previouslyFocusedElement = getActiveElement();

      queueMicrotask(() => {
        if (!open()) {
          return;
        }

        const resolvedFocus = initialFocusResolver()?.();
        if (resolvedFocus === null) {
          return;
        }

        if (resolvedFocus !== undefined) {
          resolvedFocus.focus();
          return;
        }

        focusPopupOnOpen(popupElementState(), openInteractionType());
      });

      props.onOpenChangeComplete?.(true);
    }

    if (!isOpen && previousOpen) {
      queueMicrotask(() => {
        const resolvedFocus = finalFocusResolver()?.();
        if (resolvedFocus === null) {
          return;
        }

        if (resolvedFocus !== undefined) {
          resolvedFocus.focus();
          return;
        }

        const triggerElement = activeTriggerElement();
        if (triggerElement !== undefined) {
          triggerElement.focus();
          return;
        }

        previouslyFocusedElement?.focus();
      });

      props.onOpenChangeComplete?.(false);
    }
    previousOpen = isOpen;
  });

  const onDocumentClick = (event: MouseEvent) => {
    if (!open() || disablePointerDismissal()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (isEventInsidePopup(target, popupElementState())) {
      return;
    }

    if (isEventInsideRegisteredTrigger(target, triggerRegistry)) {
      return;
    }

    requestClose(event, "outside-press");
  };

  const onDocumentKeyDown = (event: KeyboardEvent) => {
    if (!open() || event.key !== "Escape") {
      return;
    }

    requestClose(event, "escape-key");
  };

  document.addEventListener("click", onDocumentClick);
  document.addEventListener("keydown", onDocumentKeyDown);

  onCleanup(() => {
    document.removeEventListener("click", onDocumentClick);
    document.removeEventListener("keydown", onDocumentKeyDown);
  });

  createEffect(
    () => [open(), parentDialogRootContext] as const,
    ([isOpen, parentContext]) => {
      if (!isOpen || parentContext === null) {
        return;
      }

      parentContext.registerOpenChild();

      onCleanup(() => {
        parentContext.unregisterOpenChild();
      });
    },
  );

  createEffect(
    () => [open(), modal()] as const,
    ([isOpen, currentModal]) => {
      if (!isOpen || currentModal !== true) {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      onCleanup(() => {
        document.body.style.overflow = previousOverflow;
      });
    },
  );

  const contextValue: DialogRootContextValue<Payload> = {
    open,
    mounted,
    modal,
    role,
    disablePointerDismissal,
    nested,
    nestedOpenDialogCount,
    activeTriggerId,
    activeTriggerElement,
    payload,
    popupId: popupIdState,
    titleElementId: titleElementIdState,
    descriptionElementId: descriptionElementIdState,
    popupElement: popupElementState,
    setPopupId(id) {
      setPopupIdState(() => id);
    },
    setTitleElementId(id) {
      setTitleElementIdState(() => id);
    },
    setDescriptionElementId(id) {
      setDescriptionElementIdState(() => id);
    },
    setPopupElement(element) {
      setPopupElementState(() => element);
    },
    setViewportElement(element) {
      setViewportElementState(() => element);
    },
    setBackdropElement(element) {
      setBackdropElementState(() => element);
    },
    setInternalBackdropElement(element) {
      setInternalBackdropElementState(() => element);
    },
    setInitialFocusResolver(resolver) {
      setInitialFocusResolver(() => resolver);
    },
    setFinalFocusResolver(resolver) {
      setFinalFocusResolver(() => resolver);
    },
    registerTrigger,
    requestOpen,
    requestClose,
    openWithPayload,
    isOpenedByTrigger(id) {
      return open() && activeTriggerId() === id;
    },
    registerOpenChild() {
      setNestedOpenDialogCount((prev) => prev + 1);
    },
    unregisterOpenChild() {
      setNestedOpenDialogCount((prev) => (prev > 0 ? prev - 1 : 0));
    },
    closeFromAction,
    unmountFromAction,
  };

  return (
    <DialogRootContext value={contextValue}>
      <DialogRootChildrenRenderer children={props.children} payload={payload} />
    </DialogRootContext>
  );
}

export type DialogRootActionsRef =
  | { current: DialogRoot.Actions | null }
  | ((actions: DialogRoot.Actions) => void);

export type DialogInteractionType = "mouse" | "touch" | "pen" | "keyboard";

export interface DialogRootChildrenRenderProps<Payload = unknown> {
  payload: Payload | undefined;
}

export interface DialogRootActions {
  unmount: () => void;
  close: () => void;
}

export type DialogRootChangeEventReason =
  | "trigger-press"
  | "outside-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "imperative-action"
  | "none";

export type DialogRootChangeEventDetails = BaseUIChangeEventDetails<
  DialogRoot.ChangeEventReason,
  {
    preventUnmountOnClose: () => void;
  }
>;

export interface DialogRootProps<Payload = unknown> {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  modal?: DialogRoot.Modal | undefined;
  role?: DialogRoot.Role | undefined;
  disablePointerDismissal?: boolean | undefined;
  onOpenChange?: ((open: boolean, eventDetails: DialogRoot.ChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  actionsRef?: DialogRootActionsRef | undefined;
  handle?: DialogHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
  children?: JSX.Element | ((props: DialogRoot.ChildrenRenderProps<Payload>) => JSX.Element);
}

export namespace DialogRoot {
  export type Props<Payload = unknown> = DialogRootProps<Payload>;
  export type Modal = boolean | "trap-focus";
  export type Role = "dialog" | "alertdialog";
  export type Actions = DialogRootActions;
  export type ChangeEventReason = DialogRootChangeEventReason;
  export type ChangeEventDetails = DialogRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = DialogRootChildrenRenderProps<Payload>;
}

interface DialogRootChildrenRendererProps<Payload = unknown> {
  children: DialogRootProps<Payload>["children"];
  payload: Accessor<Payload | undefined>;
}

function DialogRootChildrenRenderer<Payload = unknown>(
  props: DialogRootChildrenRendererProps<Payload>,
) {
  if (isChildrenRenderFunction(props.children)) {
    const renderChildren = props.children;
    const renderedChildren = createMemo(() => renderChildren({ payload: props.payload() }));
    return <>{renderedChildren()}</>;
  }

  return <>{props.children}</>;
}

function isChildrenRenderFunction<Payload = unknown>(
  children: DialogRootProps<Payload>["children"],
): children is (props: DialogRootChildrenRenderProps<Payload>) => JSX.Element {
  return typeof children === "function" && children.length > 0;
}

function assignActionsRef(ref: DialogRootActionsRef | undefined, actions: DialogRootActions): void {
  if (ref === undefined) {
    return;
  }

  if (typeof ref === "function") {
    ref(actions);
    return;
  }

  ref.current = actions;
}

function createDialogChangeEventDetails(
  event: Event,
  trigger: Element | undefined,
  reason: DialogRoot.ChangeEventReason,
): {
  details: DialogRoot.ChangeEventDetails;
  shouldPreventUnmountOnClose: () => boolean;
} {
  const baseDetails = createChangeEventDetails(event, trigger, reason);
  let preventUnmountOnClose = false;

  const details: DialogRoot.ChangeEventDetails = {
    reason: baseDetails.reason,
    event: baseDetails.event,
    trigger: baseDetails.trigger,
    cancel: baseDetails.cancel,
    allowPropagation: baseDetails.allowPropagation,
    get isCanceled() {
      return baseDetails.isCanceled;
    },
    get isPropagationAllowed() {
      return baseDetails.isPropagationAllowed;
    },
    preventUnmountOnClose() {
      preventUnmountOnClose = true;
    },
  };

  return {
    details,
    shouldPreventUnmountOnClose() {
      return preventUnmountOnClose;
    },
  };
}

function getActiveElement(): HTMLElement | null {
  const { activeElement } = document;
  return activeElement instanceof HTMLElement ? activeElement : null;
}

function getInteractionType(event: Event): DialogInteractionType | null {
  if (typeof PointerEvent !== "undefined" && event instanceof PointerEvent) {
    if (
      event.pointerType === "mouse" ||
      event.pointerType === "touch" ||
      event.pointerType === "pen"
    ) {
      return event.pointerType;
    }
  }

  if (event instanceof MouseEvent) {
    return "mouse";
  }

  if (event instanceof KeyboardEvent) {
    return "keyboard";
  }

  if (typeof TouchEvent !== "undefined" && event instanceof TouchEvent) {
    return "touch";
  }

  return null;
}

function isEventInsidePopup(target: Node, popupElement: HTMLElement | null): boolean {
  if (popupElement === null) {
    return false;
  }

  return popupElement.contains(target);
}

function isEventInsideRegisteredTrigger(
  target: Node,
  triggerRegistry: Map<string, DialogTriggerRegistration<unknown>>,
): boolean {
  for (const registration of triggerRegistry.values()) {
    const element = registration.element();
    if (element !== null && element.contains(target)) {
      return true;
    }
  }

  return false;
}

function focusPopupOnOpen(
  popupElement: HTMLElement | null,
  interactionType: DialogInteractionType | null,
): void {
  if (popupElement === null) {
    return;
  }

  if (interactionType === "touch") {
    popupElement.focus();
    return;
  }

  const firstFocusable = getFirstFocusableElement(popupElement);
  if (firstFocusable !== null) {
    firstFocusable.focus();
    return;
  }

  popupElement.focus();
}

function getFirstFocusableElement(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(FOCUSABLE_SELECTOR);
}

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])",
].join(",");
