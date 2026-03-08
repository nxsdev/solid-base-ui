import { createContext, useContext } from "solid-js";

export const MenuPortalContext = createContext(false);

export function useMenuPortalContext(): boolean {
  return useContext(MenuPortalContext);
}
