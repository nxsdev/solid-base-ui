import { createContext, useContext, type Accessor } from "solid-js";
import type { Orientation } from "../../types";

export type MenubarRootInteractionType = "mouse" | "pen" | "touch" | "";

export interface MenubarRootContextValue {
  modal: Accessor<boolean>;
  disabled: Accessor<boolean>;
  contentElement: Accessor<HTMLElement | null>;
  hasSubmenuOpen: Accessor<boolean>;
  orientation: Accessor<Orientation>;
  allowMouseUpTrigger: Accessor<boolean>;
  rootId: Accessor<string | undefined>;
  setContentElement: (element: HTMLElement | null) => void;
  setHasSubmenuOpen: (open: boolean, interactionType?: MenubarRootInteractionType) => void;
  setAllowMouseUpTrigger: (allow: boolean) => void;
}

export const MenubarRootContext = createContext<MenubarRootContextValue | null>(null);

export function useMenubarRootContext(optional: true): MenubarRootContextValue | null;
export function useMenubarRootContext(optional?: false): MenubarRootContextValue;
export function useMenubarRootContext(optional = false) {
  const context = useContext(MenubarRootContext);

  if (context === null && !optional) {
    throw new Error(
      "Base UI: MenubarRootContext is missing. Menubar parts must be placed within <Menubar.Root>.",
    );
  }

  return context;
}
