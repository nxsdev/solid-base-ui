import { createContext, useContext, type Accessor } from "solid-js";

export interface MenuPopupContextValue {
  highlightedIndex: Accessor<number>;
  setHighlightedIndex(index: number): void;
  registerItem(element: HTMLElement, disabled: Accessor<boolean>): () => void;
  indexOf(element: HTMLElement | null): number;
}

export const MenuPopupContext = createContext<MenuPopupContextValue | null>(null);

export function useMenuPopupContext(optional: true): MenuPopupContextValue | null;
export function useMenuPopupContext(optional?: false): MenuPopupContextValue;
export function useMenuPopupContext(optional = false) {
  const context = useContext(MenuPopupContext);

  if (context === null && !optional) {
    throw new Error("MenuPopup context is missing. Menu items must be used within <Menu.Popup>.");
  }

  return context;
}
