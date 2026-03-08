import { createContext, useContext, type Accessor } from "solid-js";

export interface MenuCheckboxItemContextValue {
  checked: Accessor<boolean>;
  highlighted: Accessor<boolean>;
  disabled: Accessor<boolean>;
}

export const MenuCheckboxItemContext = createContext<MenuCheckboxItemContextValue | null>(null);

export function useMenuCheckboxItemContext(optional: true): MenuCheckboxItemContextValue | null;
export function useMenuCheckboxItemContext(optional?: false): MenuCheckboxItemContextValue;
export function useMenuCheckboxItemContext(optional = false) {
  const context = useContext(MenuCheckboxItemContext);

  if (context === null && !optional) {
    throw new Error(
      "MenuCheckboxItem context is missing. Menu.CheckboxItem parts must be placed within <Menu.CheckboxItem>.",
    );
  }

  return context;
}
