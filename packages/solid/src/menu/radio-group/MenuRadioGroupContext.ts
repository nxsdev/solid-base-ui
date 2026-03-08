import { createContext, useContext, type Accessor } from "solid-js";
import type { MenuRoot } from "../root/MenuRoot";

export interface MenuRadioGroupContextValue {
  value: Accessor<unknown>;
  setValue(newValue: unknown, eventDetails: MenuRoot.ChangeEventDetails): void;
  disabled: Accessor<boolean>;
}

export const MenuRadioGroupContext = createContext<MenuRadioGroupContextValue | null>(null);

export function useMenuRadioGroupContext(optional: true): MenuRadioGroupContextValue | null;
export function useMenuRadioGroupContext(optional?: false): MenuRadioGroupContextValue;
export function useMenuRadioGroupContext(optional = false) {
  const context = useContext(MenuRadioGroupContext);

  if (context === null && !optional) {
    throw new Error(
      "MenuRadioGroup context is missing. Menu.RadioGroup parts must be placed within <Menu.RadioGroup>.",
    );
  }

  return context;
}
