import { createContext, useContext, type Accessor } from "solid-js";

export interface DrawerVisualState {
  swipeProgress: number;
  frontmostHeight: number;
}

export interface DrawerVisualStateStore {
  getSnapshot: () => DrawerVisualState;
  subscribe: (listener: () => void) => () => void;
  set: (state: Partial<DrawerVisualState>) => void;
}

export interface DrawerProviderContextValue {
  setDrawerOpen: (drawerId: string, open: boolean) => void;
  removeDrawer: (drawerId: string) => void;
  active: Accessor<boolean>;
  visualStateStore: DrawerVisualStateStore;
}

export const DrawerProviderContext = createContext<DrawerProviderContextValue | null>(null);

export function useDrawerProviderContext(optional: true): DrawerProviderContextValue | null;
export function useDrawerProviderContext(optional?: false): DrawerProviderContextValue;
export function useDrawerProviderContext(optional = false) {
  const context = useContext(DrawerProviderContext);

  if (context === null && !optional) {
    throw new Error("Base UI: DrawerProviderContext is missing. Use <Drawer.Provider>.");
  }

  return context;
}
