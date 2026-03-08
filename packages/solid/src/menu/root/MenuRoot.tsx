import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
  type JSX,
  type Setter,
} from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import type { MenuChangeEventReason, MenuHandle, MenuHandleStore } from "../handle";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useMenuSubmenuRootContext } from "../submenu-root/MenuSubmenuRootContext";
import {
  MenuRootContext,
  type MenuInteractionType,
  type MenuRootContextValue,
} from "./MenuRootContext";

type TriggerRegistration<Payload = unknown> = {
  element: Accessor<HTMLElement | null>;
  payload: Accessor<Payload | undefined>;
};

interface MenuStateSnapshot<Payload = unknown> {
  open: boolean;
  activeTriggerId: string | null;
  openedSubmenuIndex: number | null;
  detachedPayload: Payload | undefined;
  popupId: string | undefined;
  popupElement: HTMLElement | null;
  openInteractionType: MenuInteractionType | null;
  lastOpenChangeReason: MenuChangeEventReason;
  requestedFocusStrategy: MenuRoot.FocusStrategy | null;
  initialFocusResolver: (() => HTMLElement | null | undefined) | null;
  finalFocusResolver: (() => HTMLElement | null | undefined) | null;
  triggerRegistryVersion: number;
  triggerRegistry: Map<string, TriggerRegistration<Payload>>;
}

export interface MenuStateRecord<Payload = unknown> {
  dispose(): void;
  openState: Accessor<boolean>;
  setOpenState: Setter<boolean>;
  activeTriggerIdState: Accessor<string | null>;
  setActiveTriggerIdState: Setter<string | null>;
  openedSubmenuIndexState: Accessor<number | null>;
  setOpenedSubmenuIndexState: Setter<number | null>;
  detachedPayload: Accessor<Payload | undefined>;
  setDetachedPayload: Setter<Payload | undefined>;
  popupIdState: Accessor<string | undefined>;
  setPopupIdState: Setter<string | undefined>;
  popupElementState: Accessor<HTMLElement | null>;
  setPopupElementState: Setter<HTMLElement | null>;
  openInteractionType: Accessor<MenuInteractionType | null>;
  setOpenInteractionType: Setter<MenuInteractionType | null>;
  lastOpenChangeReason: Accessor<MenuChangeEventReason>;
  setLastOpenChangeReason: Setter<MenuChangeEventReason>;
  requestedFocusStrategy: Accessor<MenuRoot.FocusStrategy | null>;
  setRequestedFocusStrategy: Setter<MenuRoot.FocusStrategy | null>;
  initialFocusResolver: Accessor<(() => HTMLElement | null | undefined) | null>;
  setInitialFocusResolver: Setter<(() => HTMLElement | null | undefined) | null>;
  finalFocusResolver: Accessor<(() => HTMLElement | null | undefined) | null>;
  setFinalFocusResolver: Setter<(() => HTMLElement | null | undefined) | null>;
  triggerRegistryVersion: Accessor<number>;
  setTriggerRegistryVersion: Setter<number>;
  triggerRegistry: Map<string, TriggerRegistration<Payload>>;
}

/**
 * Groups all parts of the menu.
 * Doesn't render its own HTML element.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuRoot<Payload = unknown>(props: MenuRoot.Props<Payload>) {
  const submenuRootContext = useMenuSubmenuRootContext(true);
  const { contextValue, payload } = createMenuRootState(
    props,
    submenuRootContext?.parentMenu.store,
  );

  return (
    <MenuRootContext value={contextValue}>
      <MenuRootChildren children={props.children} payload={payload} />
    </MenuRootContext>
  );
}

export interface CreateMenuRootStateResult<Payload = unknown> {
  contextValue: MenuRootContextValue;
  payload: Accessor<Payload | undefined>;
}

export function createMenuRootState<Payload = unknown>(
  props: MenuRoot.Props<Payload>,
  parentMenu: MenuHandleStore<unknown> | undefined,
  existingRecord?: MenuStateRecord<Payload>,
): CreateMenuRootStateResult<Payload> {
  const record =
    existingRecord ??
    createMenuStateRecord<Payload>(
      untrack(() => props.open ?? props.defaultOpen ?? false),
      untrack(() => props.defaultTriggerId ?? null),
    );
  const {
    openState,
    setOpenState,
    activeTriggerIdState,
    setActiveTriggerIdState,
    openedSubmenuIndexState,
    setOpenedSubmenuIndexState,
    detachedPayload,
    setDetachedPayload,
    popupIdState,
    setPopupIdState,
    popupElementState,
    setPopupElementState,
    openInteractionType,
    setOpenInteractionType,
    lastOpenChangeReason,
    setLastOpenChangeReason,
    requestedFocusStrategy,
    setRequestedFocusStrategy,
    initialFocusResolver,
    setInitialFocusResolver,
    finalFocusResolver,
    setFinalFocusResolver,
    triggerRegistryVersion,
    setTriggerRegistryVersion,
    triggerRegistry,
  } = record;

  const open = createMemo<boolean>(() => props.open ?? openState());
  const mounted = createMemo<boolean>(() => open());
  const activeTriggerId = createMemo<string | null>(
    () => props.triggerId ?? activeTriggerIdState(),
  );

  const disabled = createMemo<boolean>(() => resolveBoolean(props.disabled, false));
  const modal = createMemo<boolean>(() => {
    if (parentMenu !== undefined) {
      return false;
    }

    if (!resolveBoolean(props.modal, true)) {
      return false;
    }

    return openInteractionType() !== "touch";
  });
  const orientation = createMemo<MenuRoot.Orientation>(() => props.orientation ?? "vertical");
  const loopFocus = createMemo<boolean>(() => resolveBoolean(props.loopFocus, true));
  const highlightItemOnHover = createMemo<boolean>(() =>
    resolveBoolean(props.highlightItemOnHover, true),
  );
  const submenuStateRecords = new Map<
    string,
    {
      record: MenuStateRecord<unknown>;
    }
  >();

  const activeTriggerElement = createMemo<HTMLElement | undefined>(() => {
    triggerRegistryVersion();

    const triggerId = activeTriggerId();
    if (triggerId === null) {
      return undefined;
    }

    return triggerRegistry.get(triggerId)?.element() ?? undefined;
  });

  const payload = createMemo<Payload | undefined>(() => {
    triggerRegistryVersion();

    const triggerId = activeTriggerId();
    if (triggerId === null) {
      return detachedPayload();
    }

    return triggerRegistry.get(triggerId)?.payload() ?? detachedPayload();
  });

  const registerTrigger: MenuHandleStore<Payload>["registerTrigger"] = (
    id,
    element,
    triggerPayload,
  ) => {
    triggerRegistry.set(id, { element, payload: triggerPayload });
    setTriggerRegistryVersion((previous) => previous + 1);

    return () => {
      const registered = triggerRegistry.get(id);
      if (registered?.element === element) {
        triggerRegistry.delete(id);
        setTriggerRegistryVersion((previous) => previous + 1);
      }
    };
  };

  const setOpenValue = (
    nextOpen: boolean,
    event: Event | undefined,
    reason: MenuRoot.ChangeEventReason,
    trigger: Element | undefined,
  ) => {
    const details = createChangeEventDetails(
      event ?? new Event("base-ui"),
      trigger,
      reason,
    ) as MenuRoot.ChangeEventDetails;

    props.onOpenChange?.(nextOpen, details);

    if (details.isCanceled) {
      return;
    }

    if (!nextOpen) {
      setRequestedFocusStrategy(() => null);
      setOpenInteractionType(() => null);
      setOpenedSubmenuIndexState(() => null);
    }

    setLastOpenChangeReason(() => reason);

    if (props.open === undefined) {
      setOpenState(() => nextOpen);
    }
  };

  const requestOpen: MenuHandleStore<Payload>["requestOpen"] = (triggerId, event, reason) => {
    const interactionType = getInteractionType(event);
    if (interactionType !== null) {
      setOpenInteractionType(() => interactionType);
    }

    const triggerElement =
      triggerId === null ? undefined : (triggerRegistry.get(triggerId)?.element() ?? undefined);

    setDetachedPayload(() => undefined);

    if (!open()) {
      setOpenValue(true, event, reason, triggerElement);
    }

    if (props.triggerId === undefined) {
      setActiveTriggerIdState(() => triggerId);
    }
  };

  const requestClose: MenuHandleStore<Payload>["requestClose"] = (event, reason, trigger) => {
    const interactionType = getInteractionType(event);
    if (interactionType !== null) {
      setOpenInteractionType(() => interactionType);
    }

    if (!open()) {
      return;
    }

    setOpenValue(false, event, reason, trigger ?? activeTriggerElement());
  };

  const openWithPayload: MenuHandleStore<Payload>["openWithPayload"] = (nextPayload) => {
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
    closeFromAction();
  };

  assignActionsRef(props.actionsRef, {
    close: closeFromAction,
    unmount: unmountFromAction,
  });

  const store: MenuHandleStore<Payload> = {
    popupId: popupIdState,
    openedSubmenuIndex: openedSubmenuIndexState,
    registerTrigger,
    requestOpen,
    requestClose,
    isOpenedByTrigger(id) {
      return open() && activeTriggerId() === id;
    },
    isOpen: open,
    setActiveTriggerId(triggerId) {
      if (props.triggerId === undefined) {
        setActiveTriggerIdState(() => triggerId);
      }
    },
    open(triggerId) {
      requestOpen(triggerId, new Event("base-ui"), "imperative-action");
    },
    openWithPayload,
    close: closeFromAction,
    setOpenedSubmenuIndex(index: number | null) {
      setOpenedSubmenuIndexState(() => index);
    },
  };

  createEffect(
    () => props.handle,
    (handle) => {
      if (handle === undefined) {
        return;
      }

      handle.store = store;

      onCleanup(() => {
        if (handle.store === store) {
          handle.store = null;
        }
      });
    },
  );

  let previousOpen = open();
  let previouslyFocusedElement: HTMLElement | null = null;

  createEffect(open, (isOpen) => {
    if (isOpen && !previousOpen) {
      previouslyFocusedElement = getActiveElement();

      queueMicrotask(() => {
        if (!open()) {
          return;
        }

        const resolvedFocus = initialFocusResolver()?.();
        if (resolvedFocus === null) {
          return;
        }

        resolvedFocus?.focus();
      });
    }

    if (!isOpen && previousOpen) {
      queueMicrotask(() => {
        const resolvedFinalFocus = finalFocusResolver()?.();
        if (resolvedFinalFocus === null) {
          return;
        }

        if (resolvedFinalFocus !== undefined) {
          resolvedFinalFocus.focus();
          return;
        }

        activeTriggerElement()?.focus();
        if (activeTriggerElement() === undefined) {
          previouslyFocusedElement?.focus();
        }
      });
    }

    if (isOpen !== previousOpen) {
      props.onOpenChangeComplete?.(isOpen);
      previousOpen = isOpen;
    }
  });

  const onDocumentClick = (event: MouseEvent) => {
    if (!open()) {
      return;
    }

    const target = event.target;
    if (!(target instanceof Node)) {
      return;
    }

    if (isNodeInside(target, popupElementState())) {
      return;
    }

    if (isNodeInsideRegisteredTrigger(target, triggerRegistry)) {
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
    () => [open(), modal()] as const,
    ([isOpen, isModal]) => {
      if (!isOpen || !isModal) {
        return;
      }

      const previousOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      onCleanup(() => {
        document.body.style.overflow = previousOverflow;
      });
    },
  );

  const contextValue: MenuRootContextValue = {
    store: store as MenuHandleStore<unknown>,
    open,
    mounted,
    disabled,
    modal,
    orientation,
    loopFocus,
    highlightItemOnHover,
    payload: payload as Accessor<unknown | undefined>,
    popupElement: popupElementState,
    activeTriggerElement,
    popupId: popupIdState,
    openedSubmenuIndex: openedSubmenuIndexState,
    requestedFocusStrategy,
    openInteractionType,
    lastOpenChangeReason,
    acquireSubmenuStateRecord<TSubmenuPayload = unknown>(
      branchId: string,
      initialOpen: boolean,
      initialTriggerId: string | null,
    ) {
      const existingEntry = submenuStateRecords.get(branchId);
      if (existingEntry !== undefined) {
        return existingEntry.record as MenuStateRecord<TSubmenuPayload>;
      }

      const submenuRecord = createMenuStateRecord(initialOpen, initialTriggerId);
      submenuStateRecords.set(branchId, {
        record: submenuRecord as MenuStateRecord<unknown>,
      });
      return submenuRecord as MenuStateRecord<TSubmenuPayload>;
    },
    setPopupId(id) {
      setPopupIdState(() => id);
    },
    setPopupElement(element) {
      setPopupElementState(() => element);
    },
    setOpenedSubmenuIndex(index) {
      setOpenedSubmenuIndexState(() => index);
    },
    setInitialFocusResolver(resolver) {
      setInitialFocusResolver(() => resolver);
    },
    setFinalFocusResolver(resolver) {
      setFinalFocusResolver(() => resolver);
    },
    setRequestedFocusStrategy(strategy) {
      setRequestedFocusStrategy(() => strategy);
    },
    setOpenInteractionType(interactionType) {
      setOpenInteractionType(() => interactionType);
    },
  };

  return {
    contextValue,
    payload,
  };
}

export function resolveMenuRootChildren<Payload = unknown>(
  children: MenuRootProps<Payload>["children"],
  renderProps: MenuRootChildrenRenderProps<Payload>,
): JSX.Element {
  if (isChildrenRenderFunction(children)) {
    return children(renderProps);
  }

  return children;
}

function isChildrenRenderFunction<Payload = unknown>(
  children: MenuRootProps<Payload>["children"],
): children is (props: MenuRootChildrenRenderProps<Payload>) => JSX.Element {
  return typeof children === "function" && children.length > 0;
}

export interface MenuRootProps<Payload = unknown> {
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  modal?: boolean | undefined;
  disabled?: boolean | undefined;
  orientation?: MenuRoot.Orientation | undefined;
  loopFocus?: boolean | undefined;
  highlightItemOnHover?: boolean | undefined;
  onOpenChange?: ((open: boolean, eventDetails: MenuRoot.ChangeEventDetails) => void) | undefined;
  onOpenChangeComplete?: ((open: boolean) => void) | undefined;
  children?: JSX.Element | ((props: MenuRoot.ChildrenRenderProps<Payload>) => JSX.Element);
  actionsRef?: MenuRootActionsRef | undefined;
  handle?: MenuHandle<Payload> | undefined;
  triggerId?: string | null | undefined;
  defaultTriggerId?: string | null | undefined;
}

export type MenuRootActionsRef =
  | { current: MenuRoot.Actions | null }
  | ((actions: MenuRoot.Actions) => void);

export type MenuRootActions = {
  close(): void;
  unmount(): void;
};
export type MenuRootChangeEventReason =
  | "trigger-press"
  | "trigger-hover"
  | "outside-press"
  | "item-press"
  | "link-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "imperative-action"
  | "none";
export type MenuRootChangeEventDetails = BaseUIChangeEventDetails<MenuRoot.ChangeEventReason, {}>;
export type MenuRootChildrenRenderProps<Payload = unknown> = {
  payload: Payload | undefined;
};

export namespace MenuRoot {
  export type Props<Payload = unknown> = MenuRootProps<Payload>;
  export type Actions = MenuRootActions;
  export type ChangeEventReason = MenuRootChangeEventReason;
  export type ChangeEventDetails = MenuRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = MenuRootChildrenRenderProps<Payload>;
  export type Orientation = "horizontal" | "vertical";
  export type FocusStrategy = "first" | "last";
}

interface MenuRootChildrenProps<Payload = unknown> {
  children: MenuRootProps<Payload>["children"];
  payload: Accessor<Payload | undefined>;
}

function MenuRootChildren<Payload = unknown>(props: MenuRootChildrenProps<Payload>) {
  const rootChildren = props.children;

  if (isChildrenRenderFunction(rootChildren)) {
    const rendered = createMemo(() => rootChildren({ payload: props.payload() }));
    return <>{rendered()}</>;
  }

  return <>{rootChildren}</>;
}

function assignActionsRef(ref: MenuRootActionsRef | undefined, actions: MenuRootActions): void {
  if (ref === undefined) {
    return;
  }

  if (typeof ref === "function") {
    ref(actions);
    return;
  }

  ref.current = actions;
}

function isNodeInside(node: Node, element: HTMLElement | null): boolean {
  return element !== null && element.contains(node);
}

function isNodeInsideRegisteredTrigger<Payload>(
  node: Node,
  registry: Map<string, TriggerRegistration<Payload>>,
): boolean {
  for (const registration of registry.values()) {
    const element = registration.element();
    if (element !== null && element.contains(node)) {
      return true;
    }
  }

  return false;
}

function getActiveElement(): HTMLElement | null {
  return document.activeElement instanceof HTMLElement ? document.activeElement : null;
}

function getInteractionType(event: Event): MenuInteractionType | null {
  if ("pointerType" in event && typeof event.pointerType === "string") {
    if (event.pointerType === "touch") {
      return "touch";
    }

    if (event.pointerType === "pen") {
      return "pen";
    }

    return "mouse";
  }

  if (event.type.startsWith("key")) {
    return "keyboard";
  }

  return null;
}

function createMenuStateRecord<Payload = unknown>(
  initialOpen: boolean,
  initialTriggerId: string | null,
): MenuStateRecord<Payload> {
  return {
    dispose() {},
    ...createMenuStateRecordState({
      open: initialOpen,
      activeTriggerId: initialTriggerId,
      openedSubmenuIndex: null,
      detachedPayload: undefined,
      popupId: undefined,
      popupElement: null,
      openInteractionType: null,
      lastOpenChangeReason: "none",
      requestedFocusStrategy: null,
      initialFocusResolver: null,
      finalFocusResolver: null,
      triggerRegistryVersion: 0,
      triggerRegistry: new Map<string, TriggerRegistration<Payload>>(),
    }),
  };
}

function createMenuStateRecordState<Payload = unknown>(
  initialState: MenuStateSnapshot<Payload>,
): Omit<MenuStateRecord<Payload>, "dispose"> {
  const [openState, setOpenState] = createSignal(initialState.open);
  const [activeTriggerIdState, setActiveTriggerIdState] = createSignal<string | null>(
    initialState.activeTriggerId,
  );
  const [openedSubmenuIndexState, setOpenedSubmenuIndexState] = createSignal<number | null>(
    initialState.openedSubmenuIndex,
    { pureWrite: true },
  );
  const [detachedPayload, setDetachedPayload] = createSignal<Payload | undefined>();
  const [popupIdState, setPopupIdState] = createSignal<string | undefined>(initialState.popupId, {
    pureWrite: true,
  });
  const [popupElementState, setPopupElementState] = createSignal<HTMLElement | null>(
    initialState.popupElement,
    { pureWrite: true },
  );
  const [openInteractionType, setOpenInteractionType] = createSignal<MenuInteractionType | null>(
    initialState.openInteractionType,
  );
  const [lastOpenChangeReason, setLastOpenChangeReason] = createSignal<MenuChangeEventReason>(
    initialState.lastOpenChangeReason,
  );
  const [requestedFocusStrategy, setRequestedFocusStrategy] =
    createSignal<MenuRoot.FocusStrategy | null>(initialState.requestedFocusStrategy);
  const [initialFocusResolver, setInitialFocusResolver] = createSignal<
    (() => HTMLElement | null | undefined) | null
  >(null, { pureWrite: true });
  const [finalFocusResolver, setFinalFocusResolver] = createSignal<
    (() => HTMLElement | null | undefined) | null
  >(null, { pureWrite: true });
  const [triggerRegistryVersion, setTriggerRegistryVersion] = createSignal(
    initialState.triggerRegistryVersion,
    { pureWrite: true },
  );

  if (initialState.detachedPayload !== undefined) {
    setDetachedPayload(() => initialState.detachedPayload);
  }

  if (initialState.initialFocusResolver !== null) {
    setInitialFocusResolver(() => initialState.initialFocusResolver);
  }

  if (initialState.finalFocusResolver !== null) {
    setFinalFocusResolver(() => initialState.finalFocusResolver);
  }

  return {
    openState,
    setOpenState,
    activeTriggerIdState,
    setActiveTriggerIdState,
    openedSubmenuIndexState,
    setOpenedSubmenuIndexState,
    detachedPayload,
    setDetachedPayload,
    popupIdState,
    setPopupIdState,
    popupElementState,
    setPopupElementState,
    openInteractionType,
    setOpenInteractionType,
    lastOpenChangeReason,
    setLastOpenChangeReason,
    requestedFocusStrategy,
    setRequestedFocusStrategy,
    initialFocusResolver,
    setInitialFocusResolver,
    finalFocusResolver,
    setFinalFocusResolver,
    triggerRegistryVersion,
    setTriggerRegistryVersion,
    triggerRegistry: new Map(initialState.triggerRegistry),
  };
}
