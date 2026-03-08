import {
  createMemo,
  createEffect,
  createSignal,
  onCleanup,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useMenuPortalContext } from "../portal/MenuPortalContext";
import { useMenuPositionerContext } from "../positioner/MenuPositionerContext";
import { useMenuRootContext, type MenuInteractionType } from "../root/MenuRootContext";
import { useMenuSubmenuRootContext } from "../submenu-root/MenuSubmenuRootContext";
import { MenuPopupContext, type MenuPopupContextValue } from "./MenuPopupContext";
import { MenuPopupDataAttributes } from "./MenuPopupDataAttributes";

/**
 * A container for the menu items.
 * Renders a `<div>` element.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuPopup(props: MenuPopup.Props) {
  useMenuPortalContext();
  const submenuRootContext = useMenuSubmenuRootContext(true);
  const menuRootContext = submenuRootContext?.menu() ?? useMenuRootContext();
  const positionerContext = useMenuPositionerContext(true);
  const [highlightedIndex, setHighlightedIndex] = createSignal(-1, {
    pureWrite: true,
  });
  const [items, setItems] = createSignal<
    Array<{
      element: HTMLElement;
      disabled: () => boolean;
    }>
  >([], {
    pureWrite: true,
  });

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));
  const resolvedOpen = createMemo<boolean>(() => menuRootContext.open());
  const resolvedMounted = createMemo<boolean>(() => menuRootContext.mounted());

  if (submenuRootContext !== null && submenuRootContext.menu() === null) {
    return null;
  }

  createEffect(id, (popupId) => {
    menuRootContext.setPopupId(popupId);

    onCleanup(() => {
      if (menuRootContext.popupId() === popupId) {
        menuRootContext.setPopupId(undefined);
      }
    });
  });

  createEffect(
    () => [props.initialFocus, props.finalFocus, menuRootContext.openInteractionType()] as const,
    ([initialFocus, finalFocus, openInteractionType]) => {
      menuRootContext.setInitialFocusResolver(() =>
        resolveFocusTarget({
          option: initialFocus,
          interactionType: openInteractionType ?? "keyboard",
          fallback: () => getDefaultInitialFocusTarget(menuRootContext.popupElement()),
        }),
      );

      menuRootContext.setFinalFocusResolver(() =>
        resolveFocusTarget({
          option: finalFocus,
          interactionType: openInteractionType ?? "keyboard",
          fallback: () => undefined,
        }),
      );

      onCleanup(() => {
        menuRootContext.setInitialFocusResolver(null);
        menuRootContext.setFinalFocusResolver(null);
      });
    },
  );

  createEffect(
    () =>
      [
        resolvedOpen(),
        menuRootContext.requestedFocusStrategy(),
        menuRootContext.popupElement(),
      ] as const,
    ([open, focusStrategy, popupElement]) => {
      if (!open || focusStrategy === null || popupElement === null) {
        return;
      }

      queueMicrotask(() => {
        const target =
          focusStrategy === "last" ? getLastMenuItem(popupElement) : getFirstMenuItem(popupElement);

        target?.focus();
        menuRootContext.setRequestedFocusStrategy(null);
      });
    },
  );

  const side = createMemo(() => positionerContext?.side() ?? "bottom");
  const align = createMemo(() => positionerContext?.align() ?? "start");

  const elementProps = createMemo(() => omit(props, ...POPUP_OMITTED_PROP_KEYS));

  const popupContextValue: MenuPopupContextValue = {
    highlightedIndex,
    setHighlightedIndex(index) {
      setHighlightedIndex(() => index);
    },
    registerItem(element, disabled) {
      setItems((previous) =>
        sortItems([
          ...previous.filter((item) => item.element !== element),
          {
            element,
            disabled,
          },
        ]),
      );

      return () => {
        setItems((previous) => previous.filter((item) => item.element !== element));
      };
    },
    indexOf(element) {
      if (element === null) {
        return -1;
      }

      return items().findIndex((item) => item.element === element);
    },
  };

  const focusItemAtIndex = (index: number) => {
    const item = items()[index];
    if (item === undefined) {
      return;
    }

    item.element.focus();
    setHighlightedIndex(() => index);
  };

  const getEnabledIndex = (startIndex: number, step: -1 | 1) => {
    const registeredItems = items();
    if (registeredItems.length === 0) {
      return -1;
    }

    let currentIndex = startIndex;
    for (let attempts = 0; attempts < registeredItems.length; attempts += 1) {
      currentIndex += step;

      if (currentIndex < 0) {
        currentIndex = menuRootContext.loopFocus() ? registeredItems.length - 1 : 0;
      } else if (currentIndex >= registeredItems.length) {
        currentIndex = menuRootContext.loopFocus() ? 0 : registeredItems.length - 1;
      }

      if (!registeredItems[currentIndex]?.disabled()) {
        return currentIndex;
      }

      if (
        !menuRootContext.loopFocus() &&
        (currentIndex === 0 || currentIndex === registeredItems.length - 1)
      ) {
        break;
      }
    }

    return -1;
  };

  return (
    <MenuPopupContext value={popupContextValue}>
      <MenuPopupBody
        align={align}
        children={props.children}
        elementProps={elementProps}
        focusItemAtIndex={focusItemAtIndex}
        getEnabledIndex={getEnabledIndex}
        highlightedIndex={highlightedIndex}
        id={id}
        items={items}
        menuRootContext={menuRootContext}
        onKeyDown={props.onKeyDown}
        popupRef={props.ref}
        resolvedMounted={resolvedMounted}
        resolvedOpen={resolvedOpen}
        side={side}
      />
    </MenuPopupContext>
  );
}

export type MenuFocusOption =
  | boolean
  | { current: HTMLElement | null }
  | ((interactionType: MenuInteractionType) => boolean | HTMLElement | null | void);

export interface MenuPopupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  /**
   * @ignore
   */
  id?: string | undefined;
  render?: ValidComponent | undefined;
  initialFocus?: MenuFocusOption | undefined;
  finalFocus?: MenuFocusOption | undefined;
}

export interface MenuPopupState {
  open: boolean;
  side: "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  align: "start" | "center" | "end";
}

export namespace MenuPopup {
  export type Props = MenuPopupProps;
  export type State = MenuPopupState;
}

interface MenuPopupBodyProps {
  align: () => string;
  children: JSX.Element | undefined;
  elementProps: () => Partial<JSX.HTMLAttributes<HTMLDivElement>>;
  focusItemAtIndex(index: number): void;
  getEnabledIndex(startIndex: number, step: -1 | 1): number;
  highlightedIndex: () => number;
  id: () => string;
  items: () => Array<{
    element: HTMLElement;
    disabled: () => boolean;
  }>;
  menuRootContext: ReturnType<typeof useMenuRootContext>;
  onKeyDown: JSX.HTMLAttributes<HTMLDivElement>["onKeyDown"];
  popupRef: JSX.Ref<HTMLDivElement> | undefined;
  resolvedMounted: () => boolean;
  resolvedOpen: () => boolean;
  side: () => string;
}

function MenuPopupBody(props: MenuPopupBodyProps) {
  return (
    <div
      {...props.elementProps()}
      id={props.id()}
      ref={(element) => {
        props.menuRootContext.setPopupElement(element);
        callRef(props.popupRef, element as HTMLDivElement | null);
      }}
      role="menu"
      tabindex={-1}
      hidden={!props.resolvedMounted()}
      aria-modal={props.menuRootContext.modal() ? "true" : undefined}
      onKeyDown={(event) => {
        callEventHandler(props.onKeyDown, event);

        if (event.defaultPrevented) {
          return;
        }

        if (event.key === "ArrowDown") {
          event.preventDefault();
          const nextIndex = props.getEnabledIndex(props.highlightedIndex(), 1);
          if (nextIndex >= 0) {
            props.focusItemAtIndex(nextIndex);
          }
          return;
        }

        if (event.key === "ArrowUp") {
          event.preventDefault();
          const nextIndex = props.getEnabledIndex(
            props.highlightedIndex() === -1 ? props.items().length : props.highlightedIndex(),
            -1,
          );
          if (nextIndex >= 0) {
            props.focusItemAtIndex(nextIndex);
          }
          return;
        }

        if (event.key === "Home") {
          event.preventDefault();
          const nextIndex = props.getEnabledIndex(-1, 1);
          if (nextIndex >= 0) {
            props.focusItemAtIndex(nextIndex);
          }
          return;
        }

        if (event.key === "End") {
          event.preventDefault();
          const nextIndex = props.getEnabledIndex(props.items().length, -1);
          if (nextIndex >= 0) {
            props.focusItemAtIndex(nextIndex);
          }
        }
      }}
      {...{
        [MenuPopupDataAttributes.open]: props.resolvedOpen() ? "" : undefined,
        [MenuPopupDataAttributes.closed]: props.resolvedOpen() ? undefined : "",
        [MenuPopupDataAttributes.side]: props.side(),
        [MenuPopupDataAttributes.align]: props.align(),
      }}
    >
      {props.children}
    </div>
  );
}

interface ResolveFocusTargetOptions {
  option: MenuFocusOption | undefined;
  interactionType: MenuInteractionType;
  fallback: () => HTMLElement | null | undefined;
}

function resolveFocusTarget(parameters: ResolveFocusTargetOptions): HTMLElement | null | undefined {
  const { option, interactionType, fallback } = parameters;

  if (option === undefined || option === true || option === null) {
    return fallback();
  }

  if (option === false) {
    return null;
  }

  if (typeof option === "function") {
    const value = option(interactionType);

    if (value === true || value === null) {
      return fallback();
    }

    if (value === false || value === undefined) {
      return null;
    }

    return value;
  }

  return option.current ?? fallback();
}

function getDefaultInitialFocusTarget(
  popupElement: HTMLElement | null,
): HTMLElement | null | undefined {
  if (popupElement === null) {
    return undefined;
  }

  const firstMenuItem = getFirstMenuItem(popupElement);
  if (firstMenuItem !== null) {
    return firstMenuItem;
  }

  return popupElement;
}

function getFirstMenuItem(root: HTMLElement): HTMLElement | null {
  return root.querySelector<HTMLElement>(MENU_ITEM_SELECTOR);
}

function getLastMenuItem(root: HTMLElement): HTMLElement | null {
  const items = root.querySelectorAll<HTMLElement>(MENU_ITEM_SELECTOR);
  if (items.length === 0) {
    return null;
  }

  return items[items.length - 1] ?? null;
}

function sortItems(
  items: Array<{
    element: HTMLElement;
    disabled: () => boolean;
  }>,
) {
  return [...items].sort((left, right) => {
    const position = left.element.compareDocumentPosition(right.element);

    if (position & Node.DOCUMENT_POSITION_FOLLOWING) {
      return -1;
    }

    if (position & Node.DOCUMENT_POSITION_PRECEDING) {
      return 1;
    }

    return 0;
  });
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

const MENU_ITEM_SELECTOR = "[role='menuitem'],[role='menuitemcheckbox'],[role='menuitemradio']";

const POPUP_OMITTED_PROP_KEYS = [
  "children",
  "id",
  "render",
  "ref",
  "initialFocus",
  "finalFocus",
] as const satisfies ReadonlyArray<keyof MenuPopupProps>;
