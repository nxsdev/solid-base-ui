import { createContext, useContext, type Accessor } from "solid-js";
import type { MenuStateRecord } from "./MenuRoot";
import type { MenuHandleStore } from "../handle";
import type { MenuRoot } from "./MenuRoot";
import type { MenuChangeEventReason } from "../handle";

export type MenuInteractionType = "mouse" | "touch" | "pen" | "keyboard";

export interface MenuRootContextValue {
  store: MenuHandleStore<unknown>;
  open: Accessor<boolean>;
  mounted: Accessor<boolean>;
  disabled: Accessor<boolean>;
  modal: Accessor<boolean>;
  orientation: Accessor<MenuRoot.Orientation>;
  loopFocus: Accessor<boolean>;
  highlightItemOnHover: Accessor<boolean>;
  payload: Accessor<unknown | undefined>;
  popupElement: Accessor<HTMLElement | null>;
  activeTriggerElement: Accessor<HTMLElement | undefined>;
  popupId: Accessor<string | undefined>;
  openedSubmenuIndex: Accessor<number | null>;
  requestedFocusStrategy: Accessor<MenuRoot.FocusStrategy | null>;
  openInteractionType: Accessor<MenuInteractionType | null>;
  lastOpenChangeReason: Accessor<MenuChangeEventReason>;
  acquireSubmenuStateRecord<Payload = unknown>(
    branchId: string,
    initialOpen: boolean,
    initialTriggerId: string | null,
  ): MenuStateRecord<Payload>;
  setPopupId(id: string | undefined): void;
  setPopupElement(element: HTMLElement | null): void;
  setOpenedSubmenuIndex(index: number | null): void;
  setInitialFocusResolver(resolver: (() => HTMLElement | null | undefined) | null): void;
  setFinalFocusResolver(resolver: (() => HTMLElement | null | undefined) | null): void;
  setRequestedFocusStrategy(strategy: MenuRoot.FocusStrategy | null): void;
  setOpenInteractionType(interactionType: MenuInteractionType | null): void;
}

export const MenuRootContext = createContext<MenuRootContextValue | null>(null);

export function useMenuRootContext(optional: true): MenuRootContextValue | null;
export function useMenuRootContext(optional?: false): MenuRootContextValue;
export function useMenuRootContext(optional = false) {
  const context = useContext(MenuRootContext);

  if (context === null && !optional) {
    throw new Error("MenuRoot context is missing. Menu parts must be used within <Menu.Root>.");
  }

  return context;
}
