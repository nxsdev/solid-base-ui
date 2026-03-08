import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  omit,
  onCleanup,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { useDirection } from "../../direction-provider/DirectionContext";
import { Dynamic } from "../../internal/Dynamic";
import { combinePropsList, type DomProps } from "../../merge-props/combineProps";
import { useMenuPopupContext } from "../popup/MenuPopupContext";
import { useButton, type ButtonPropsForUseButton } from "../../use-button";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { type MenuInteractionType, type MenuRootContextValue } from "../root/MenuRootContext";
import { useMenuSubmenuRootContext } from "../submenu-root/MenuSubmenuRootContext";
import { type MenuTriggerProps } from "../trigger/MenuTrigger";
import { MenuSubmenuTriggerDataAttributes } from "./MenuSubmenuTriggerDataAttributes";

/**
 * A menu item that opens a submenu.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuSubmenuTrigger(props: MenuSubmenuTrigger.Props) {
  const submenuRootContext = useMenuSubmenuRootContext();
  const parentMenuRootContext = submenuRootContext.parentMenu;
  const triggerId = useBaseUiId();
  const domId = createMemo<string>(() => (typeof props.id === "string" ? props.id : triggerId));
  const menuRootContext = createMemo(() => submenuRootContext.ensureMenu(triggerId).contextValue);
  const popupContext = useMenuPopupContext();
  const direction = useDirection();

  const [triggerElement, setTriggerElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });

  createEffect(
    () => [menuRootContext().store, triggerId] as const,
    ([store, currentTriggerId]) => {
      let disposed = false;
      let unregister: (() => void) | undefined;

      queueMicrotask(() => {
        if (disposed) {
          return;
        }

        unregister = store.registerTrigger(currentTriggerId, triggerElement, () => undefined);
      });

      onCleanup(() => {
        disposed = true;
        unregister?.();
      });
    },
  );

  createEffect(
    () => [menuRootContext().open(), triggerId] as const,
    ([open, currentTriggerId]) => {
      if (open && !menuRootContext().store.isOpenedByTrigger(currentTriggerId)) {
        menuRootContext().store.setActiveTriggerId(currentTriggerId);
      }
    },
  );

  const rootDisabled = createMemo<boolean>(
    () => parentMenuRootContext.disabled() || menuRootContext().disabled(),
  );
  const disabled = createMemo<boolean>(
    () => rootDisabled() || resolveBoolean(props.disabled, false),
  );
  const nativeButton = createMemo<boolean>(() => resolveBoolean(props.nativeButton, false));
  const openOnHover = createMemo<boolean>(() => resolveBoolean(props.openOnHover, true));
  const hoverDelay = createMemo<number>(() => resolveDelay(props.delay, 100));
  const hoverCloseDelay = createMemo<number>(() => resolveDelay(props.closeDelay, 0));

  createRenderEffect(triggerElement, (element) => {
    if (element === null) {
      return;
    }

    const unregister = popupContext.registerItem(element, disabled);
    onCleanup(unregister);
  });

  const index = createMemo<number>(() => popupContext.indexOf(triggerElement()));

  const isOpenedByThisTrigger = createMemo<boolean>(() =>
    menuRootContext().store.isOpenedByTrigger(triggerId),
  );
  const popupId = createMemo<string | undefined>(() =>
    isOpenedByThisTrigger() ? menuRootContext().store.popupId() : undefined,
  );
  const isHighlighted = createMemo<boolean>(() => popupContext.highlightedIndex() === index());

  const { getButtonProps, buttonRef } = useButton<HTMLElement>({
    disabled,
    native: nativeButton,
    composite: true,
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

    return nativeButton() ? "button" : "div";
  });

  const baseProps = createMemo(() => omit(props, ...SUBMENU_TRIGGER_OMITTED_PROP_KEYS));

  const buttonProps = createMemo(() =>
    getButtonProps({
      ...baseProps(),
      role: "menuitem",
      tabindex: isOpenedByThisTrigger() || isHighlighted() ? 0 : -1,
      disabled: disabled(),
    } satisfies ButtonPropsForUseButton<HTMLElement>),
  );

  const controlProps = createMemo<DomProps<HTMLElement>>(() => ({
    id: domId(),
    role: "menuitem",
    "aria-haspopup": "menu",
    "aria-expanded": isOpenedByThisTrigger() ? "true" : "false",
    "aria-controls": popupId(),
    [MenuSubmenuTriggerDataAttributes.popupOpen]: isOpenedByThisTrigger() ? "" : undefined,
    [MenuSubmenuTriggerDataAttributes.highlighted]: isHighlighted() ? "" : undefined,
    [MenuSubmenuTriggerDataAttributes.disabled]: disabled() ? "" : undefined,
    onPointerMove(event) {
      if (event.defaultPrevented || disabled() || triggerElement() === null) {
        return;
      }

      triggerElement()?.focus();
    },
    onFocus() {
      const currentIndex = index();
      if (currentIndex >= 0) {
        popupContext.setHighlightedIndex(currentIndex);
      }
    },
    onPointerDown(event) {
      setInteractionType(menuRootContext(), getPointerInteractionType(event));
    },
    onTouchStart() {
      setInteractionType(menuRootContext(), "touch");
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
        if (isOpenedByThisTrigger()) {
          return;
        }

        menuRootContext().store.requestOpen(triggerId, event, "trigger-hover");
      }, hoverDelay());
    },
    onPointerLeave(event) {
      if (event.defaultPrevented || disabled() || !openOnHover()) {
        return;
      }

      clearHoverTimers();

      closeTimeoutId = window.setTimeout(() => {
        if (!isOpenedByThisTrigger()) {
          return;
        }

        menuRootContext().store.requestClose(event, "focus-out");
      }, hoverCloseDelay());
    },
    onClick(event) {
      if (event.defaultPrevented || disabled()) {
        return;
      }

      clearHoverTimers();

      if (isOpenedByThisTrigger()) {
        if (openOnHover()) {
          return;
        }

        return;
      }

      menuRootContext().setRequestedFocusStrategy("first");
      menuRootContext().store.requestOpen(triggerId, event, "trigger-press");
    },
    onKeyDown(event) {
      if (event.defaultPrevented || disabled()) {
        return;
      }

      const openKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight";
      const closeKey = direction === "rtl" ? "ArrowRight" : "ArrowLeft";

      if (event.key === openKey) {
        event.preventDefault();
        setInteractionType(menuRootContext(), "keyboard");
        if (!isOpenedByThisTrigger()) {
          menuRootContext().setRequestedFocusStrategy("first");
          menuRootContext().store.requestOpen(triggerId, event, "trigger-press");
        }

        return;
      }

      if (event.key === closeKey && isOpenedByThisTrigger()) {
        event.preventDefault();
        menuRootContext().store.requestClose(event, "focus-out");
      }
    },
  }));

  const mergedProps = createMemo(() =>
    combinePropsList<HTMLElement>([controlProps(), buttonProps()]),
  );

  const handleRef: JSX.Ref<HTMLElement> = (node) => {
    setTriggerElement((previous) => (previous === node ? previous : node));
    buttonRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <MenuSubmenuTriggerBody
      children={props.children}
      component={component}
      handleRef={handleRef}
      mergedProps={mergedProps}
    />
  );
}

interface MenuSubmenuTriggerBodyProps {
  children: JSX.Element | undefined;
  component: () => ValidComponent;
  handleRef: JSX.Ref<HTMLElement>;
  mergedProps: () => DomProps<HTMLElement>;
}

function MenuSubmenuTriggerBody(props: MenuSubmenuTriggerBodyProps) {
  return (
    <Dynamic component={props.component()} ref={props.handleRef} {...props.mergedProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface MenuSubmenuTriggerState {
  /**
   * Whether the component should ignore user interaction.
   */
  disabled: boolean;
  /**
   * Whether the item is highlighted.
   */
  highlighted: boolean;
  /**
   * Whether the submenu is currently open.
   */
  open: boolean;
}

export interface MenuSubmenuTriggerProps extends Omit<MenuTriggerProps, "handle" | "payload"> {
  /**
   * Overrides the text label used for text navigation.
   */
  label?: string | undefined;
  /**
   * @ignore
   */
  id?: string | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Whether the rendered element is a native button.
   * @default false
   */
  nativeButton?: boolean | undefined;
  /**
   * How long to wait before opening on hover.
   * @default 100
   */
  delay?: number | string | undefined;
  /**
   * How long to wait before closing after pointer leaves.
   * @default 0
   */
  closeDelay?: number | string | undefined;
  /**
   * Whether the submenu should also open on hover.
   * @default true
   */
  openOnHover?: boolean | undefined;
}

export namespace MenuSubmenuTrigger {
  export type Props = MenuSubmenuTriggerProps;
  export type State = MenuSubmenuTriggerState;
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
  menuRootContext: Pick<MenuRootContextValue, "setOpenInteractionType">,
  interactionType: MenuInteractionType | null,
): void {
  if (interactionType === null) {
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

const SUBMENU_TRIGGER_OMITTED_PROP_KEYS = [
  "children",
  "label",
  "id",
  "disabled",
  "nativeButton",
  "delay",
  "closeDelay",
  "openOnHover",
  "render",
  "ref",
] as const satisfies ReadonlyArray<keyof MenuSubmenuTriggerProps>;
