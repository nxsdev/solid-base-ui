import {
  createEffect,
  createMemo,
  createSignal,
  merge,
  omit,
  onCleanup,
  untrack,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { Dynamic } from "../../internal/Dynamic";
import { combinePropsList, type DomProps } from "../../merge-props/combineProps";
import { useButton, type ButtonPropsForUseButton } from "../../use-button";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { MenuHandle } from "../handle";
import { useMenuRootContext, type MenuInteractionType } from "../root/MenuRootContext";
import { MenuTriggerDataAttributes } from "./MenuTriggerDataAttributes";

/**
 * A button that opens the menu.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuTrigger<Payload = unknown>(props: MenuTrigger.Props<Payload>) {
  const menuRootContext = useMenuRootContext(true);

  const readHandle = () => untrack(() => props.handle);
  const getStore = () => readHandle()?.store ?? menuRootContext?.store ?? null;

  if (menuRootContext === null && readHandle() === undefined) {
    throw new Error(
      "Base UI: <Menu.Trigger> must be used within <Menu.Root> or provided with a handle.",
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
  const [ignoreNextClick, setIgnoreNextClick] = createSignal(false);
  const payload = createMemo<Payload | undefined>(() => props.payload);

  createEffect(
    () => [getStore(), resolvedId()] as const,
    ([menuStore, triggerId]) => {
      if (menuStore === null) {
        return;
      }

      let disposed = false;
      let unregister: (() => void) | undefined;

      queueMicrotask(() => {
        if (disposed) {
          return;
        }

        unregister = menuStore.registerTrigger(triggerId, triggerElement, payload);
      });

      onCleanup(() => {
        disposed = true;
        unregister?.();
      });
    },
  );

  const rootDisabled = createMemo<boolean>(() => menuRootContext?.disabled() ?? false);
  const disabled = createMemo<boolean>(
    () => rootDisabled() || resolveBoolean(props.disabled, false),
  );
  const nativeButton = createMemo<boolean>(() => resolveBoolean(props.nativeButton, true));
  const openOnHover = createMemo<boolean>(() => resolveBoolean(props.openOnHover, false));
  const hoverDelay = createMemo<number>(() => resolveDelay(props.delay, 100));
  const hoverCloseDelay = createMemo<number>(() => resolveDelay(props.closeDelay, 0));

  const isOpenedByThisTrigger = createMemo<boolean>(() => {
    const menuStore = getStore();
    if (menuStore === null) {
      return false;
    }

    return menuStore.isOpenedByTrigger(resolvedId());
  });

  createEffect(isOpenedByThisTrigger, (open) => {
    if (!open) {
      setOpenedByPress(() => false);
    }
  });

  const { getButtonProps, buttonRef } = useButton<HTMLElement>({
    disabled,
    native: nativeButton,
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

  const component = createMemo<ValidComponent>(() => {
    if (props.render !== undefined) {
      return props.render;
    }

    return nativeButton() ? "button" : "span";
  });

  const baseProps = createMemo(() => omit(props, ...TRIGGER_OMITTED_PROP_KEYS));

  const buttonProps = createMemo(() =>
    getButtonProps(
      merge(baseProps(), {
        disabled: disabled(),
      }) satisfies ButtonPropsForUseButton<HTMLElement>,
    ),
  );

  const controlProps = createMemo<DomProps<HTMLElement>>(() => ({
    id: resolvedId(),
    "aria-haspopup": "menu",
    "aria-expanded": isOpenedByThisTrigger() ? "true" : "false",
    "aria-controls": isOpenedByThisTrigger() ? getStore()?.popupId() : undefined,
    [MenuTriggerDataAttributes.popupOpen]: isOpenedByThisTrigger() ? "" : undefined,
    [MenuTriggerDataAttributes.pressed]:
      isOpenedByThisTrigger() && openedByPress() ? "" : undefined,
    onPointerDown(event) {
      setInteractionType(menuRootContext, getPointerInteractionType(event));
    },
    onTouchStart() {
      setInteractionType(menuRootContext, "touch");
    },
    onPointerEnter(event) {
      if (
        event.defaultPrevented ||
        disabled() ||
        !openOnHover() ||
        (event as PointerEvent).pointerType === "touch"
      ) {
        return;
      }

      clearHoverTimers();

      openTimeoutId = window.setTimeout(() => {
        const menuStore = getStore();
        if (menuStore === null || menuStore.isOpenedByTrigger(resolvedId())) {
          return;
        }

        setOpenedByPress(() => false);
        menuStore.requestOpen(resolvedId(), event, "trigger-hover");
      }, hoverDelay());
    },
    onPointerLeave(event) {
      if (event.defaultPrevented || disabled() || !openOnHover()) {
        return;
      }

      clearHoverTimers();

      closeTimeoutId = window.setTimeout(() => {
        const menuStore = getStore();
        if (menuStore === null || !menuStore.isOpenedByTrigger(resolvedId())) {
          return;
        }

        menuStore.requestClose(event, "focus-out", triggerElement() ?? undefined);
        setOpenedByPress(() => false);
      }, hoverCloseDelay());
    },
    onClick(event) {
      if (event.defaultPrevented || disabled()) {
        return;
      }

      if (ignoreNextClick()) {
        setIgnoreNextClick(() => false);
        return;
      }

      clearHoverTimers();

      const menuStore = getStore();
      if (menuStore === null) {
        return;
      }

      if (menuStore.isOpenedByTrigger(resolvedId())) {
        menuStore.requestClose(event, "trigger-press", event.currentTarget);
        setOpenedByPress(() => false);
        return;
      }

      menuRootContext?.setRequestedFocusStrategy("first");
      menuStore.requestOpen(resolvedId(), event, "trigger-press");
      setOpenedByPress(() => true);
    },
    onKeyDown(event) {
      if (event.defaultPrevented || disabled()) {
        return;
      }

      if (
        event.key !== "ArrowDown" &&
        event.key !== "ArrowUp" &&
        event.key !== "Enter" &&
        event.key !== " "
      ) {
        return;
      }

      const menuStore = getStore();
      if (menuStore === null) {
        return;
      }

      event.preventDefault();
      setInteractionType(menuRootContext, "keyboard");
      setIgnoreNextClick(() => event.key === "Enter" || event.key === " ");

      if (event.key === "ArrowUp") {
        menuRootContext?.setRequestedFocusStrategy("last");
      } else {
        menuRootContext?.setRequestedFocusStrategy("first");
      }

      if (menuStore.isOpenedByTrigger(resolvedId())) {
        if (event.key === "Enter" || event.key === " ") {
          menuStore.requestClose(event, "trigger-press", event.currentTarget);
          setOpenedByPress(() => false);
        }
        return;
      }

      menuStore.requestOpen(resolvedId(), event, "trigger-press");
      setOpenedByPress(() => true);
    },
  }));

  const mergedProps = createMemo(() =>
    combinePropsList<HTMLElement>([controlProps(), buttonProps()]),
  );

  const handleRef: JSX.Ref<HTMLElement> = (element) => {
    setTriggerElement((previous) => (previous === element ? previous : element));
    buttonRef(element);

    if (typeof props.ref === "function" && element !== null) {
      props.ref(element);
    }
  };

  return (
    <Dynamic component={component()} ref={handleRef} {...mergedProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface MenuTriggerProps<Payload = unknown> extends Omit<
  ButtonPropsForUseButton<HTMLElement>,
  "disabled"
> {
  /**
   * A handle to associate the trigger with a menu.
   */
  handle?: MenuHandle<Payload> | undefined;
  /**
   * A payload to pass to the menu when it is opened.
   */
  payload?: Payload | undefined;
  /**
   * ID of the trigger.
   */
  id?: string | undefined;
  /**
   * Whether the trigger should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Whether the rendered element is a native button.
   * @default true
   */
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
  /**
   * Whether the menu should open on hover.
   * @default false
   */
  openOnHover?: boolean | undefined;
  /**
   * Hover open delay in milliseconds.
   * @default 100
   */
  delay?: number | string | undefined;
  /**
   * Hover close delay in milliseconds.
   * @default 0
   */
  closeDelay?: number | string | undefined;
}

export interface MenuTriggerState {
  disabled: boolean;
  open: boolean;
}

export namespace MenuTrigger {
  export type Props<Payload = unknown> = MenuTriggerProps<Payload>;
  export type State = MenuTriggerState;
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

function setInteractionType(
  menuRootContext: ReturnType<typeof useMenuRootContext> | null,
  interactionType: MenuInteractionType | null,
): void {
  if (menuRootContext === null || interactionType === null) {
    return;
  }

  menuRootContext.setOpenInteractionType(interactionType);
}

function getPointerInteractionType(event: PointerEvent): MenuInteractionType {
  if (event.pointerType === "touch") {
    return "touch";
  }

  if (event.pointerType === "pen") {
    return "pen";
  }

  return "mouse";
}

const TRIGGER_OMITTED_PROP_KEYS = [
  "children",
  "handle",
  "payload",
  "id",
  "disabled",
  "nativeButton",
  "render",
  "openOnHover",
  "delay",
  "closeDelay",
  "ref",
] as const satisfies ReadonlyArray<keyof MenuTriggerProps>;
