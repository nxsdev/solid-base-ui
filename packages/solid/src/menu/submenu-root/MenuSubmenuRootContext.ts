import { createContext, useContext, type Accessor } from "solid-js";
import type { MenuRootContextValue } from "../root/MenuRootContext";
import type { CreateMenuRootStateResult } from "../root/MenuRoot";

export interface MenuSubmenuRootContextValue {
  parentMenu: MenuRootContextValue;
  menu: Accessor<MenuRootContextValue | null>;
  ensureMenu(triggerId: string): CreateMenuRootStateResult<unknown>;
}

export const MenuSubmenuRootContext = createContext<MenuSubmenuRootContextValue | null>(null);

export function useMenuSubmenuRootContext(optional: true): MenuSubmenuRootContextValue | null;
export function useMenuSubmenuRootContext(optional?: false): MenuSubmenuRootContextValue;
export function useMenuSubmenuRootContext(optional = false) {
  const context = useContext(MenuSubmenuRootContext);

  if (context === null && !optional) {
    throw new Error(
      "MenuSubmenuRoot context is missing. <Menu.SubmenuTrigger> must be used within <Menu.SubmenuRoot>.",
    );
  }

  return context;
}
