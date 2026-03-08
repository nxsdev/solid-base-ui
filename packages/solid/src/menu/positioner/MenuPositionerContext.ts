import { createContext, useContext, type Accessor } from "solid-js";
import type { MenuPositioner } from "./MenuPositioner";

export interface MenuPositionerContextValue {
  side: Accessor<MenuPositioner.Side>;
  align: Accessor<MenuPositioner.Align>;
  anchorHidden: Accessor<boolean>;
  arrowStyle: Accessor<Record<string, string | undefined>>;
  arrowUncentered: Accessor<boolean>;
  setArrowElement(element: HTMLElement | null): void;
}

export const MenuPositionerContext = createContext<MenuPositionerContextValue | null>(null);

export function useMenuPositionerContext(optional: true): MenuPositionerContextValue | null;
export function useMenuPositionerContext(optional?: false): MenuPositionerContextValue;
export function useMenuPositionerContext(optional = false) {
  const context = useContext(MenuPositionerContext);

  if (context === null && !optional) {
    throw new Error(
      "MenuPositioner context is missing. Menu.Popup and Menu.Arrow must be placed within <Menu.Positioner>.",
    );
  }

  return context;
}
