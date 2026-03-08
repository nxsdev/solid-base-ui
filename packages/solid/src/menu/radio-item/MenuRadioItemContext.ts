import { createContext, useContext, type Accessor } from "solid-js";

export interface MenuRadioItemContextValue {
  checked: Accessor<boolean>;
  highlighted: Accessor<boolean>;
  disabled: Accessor<boolean>;
}

export const MenuRadioItemContext = createContext<MenuRadioItemContextValue | null>(null);

export function useMenuRadioItemContext(optional: true): MenuRadioItemContextValue | null;
export function useMenuRadioItemContext(optional?: false): MenuRadioItemContextValue;
export function useMenuRadioItemContext(optional = false) {
  const context = useContext(MenuRadioItemContext);

  if (context === null && !optional) {
    throw new Error(
      "MenuRadioItem context is missing. Menu.RadioItem parts must be placed within <Menu.RadioItem>.",
    );
  }

  return context;
}
