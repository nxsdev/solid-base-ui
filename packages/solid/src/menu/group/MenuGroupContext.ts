import { createContext, useContext } from "solid-js";

export interface MenuGroupContextValue {
  setLabelId(id: string | undefined): void;
}

export const MenuGroupContext = createContext<MenuGroupContextValue | null>(null);

export function useMenuGroupContext(optional: true): MenuGroupContextValue | null;
export function useMenuGroupContext(optional?: false): MenuGroupContextValue;
export function useMenuGroupContext(optional = false) {
  const context = useContext(MenuGroupContext);

  if (context === null && !optional) {
    throw new Error(
      "MenuGroup context is missing. Menu group parts must be used within <Menu.Group>.",
    );
  }

  return context;
}
