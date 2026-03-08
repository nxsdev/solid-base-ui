import { createContext, useContext, type Accessor } from "solid-js";
import type { DrawerRoot } from "./DrawerRoot";

export type DrawerSwipeDirection = "up" | "down" | "left" | "right";
export type DrawerSnapPoint = number | string;

export interface DrawerNestedSwipeProgressStore {
  getSnapshot: () => number;
  subscribe: (listener: () => void) => () => void;
}

export interface DrawerRootContextValue {
  swipeDirection: Accessor<DrawerSwipeDirection>;
  snapToSequentialPoints: Accessor<boolean>;
  snapPoints: Accessor<readonly DrawerSnapPoint[] | undefined>;
  activeSnapPoint: Accessor<DrawerSnapPoint | null>;
  setActiveSnapPoint: (
    snapPoint: DrawerSnapPoint | null,
    eventDetails?: DrawerRoot.SnapPointChangeEventDetails,
  ) => void;
  frontmostHeight: Accessor<number>;
  popupHeight: Accessor<number>;
  hasNestedDrawer: Accessor<boolean>;
  nestedSwiping: Accessor<boolean>;
  nestedSwipeProgressStore: DrawerNestedSwipeProgressStore;
  onNestedDrawerPresenceChange: (present: boolean) => void;
  onPopupHeightChange: (height: number) => void;
  onNestedFrontmostHeightChange: (height: number) => void;
  onNestedSwipingChange: (swiping: boolean) => void;
  onNestedSwipeProgressChange: (progress: number) => void;
  notifyParentFrontmostHeight?: ((height: number) => void) | undefined;
  notifyParentSwipingChange?: ((swiping: boolean) => void) | undefined;
  notifyParentSwipeProgressChange?: ((progress: number) => void) | undefined;
  notifyParentHasNestedDrawer?: ((present: boolean) => void) | undefined;
}

export const DrawerRootContext = createContext<DrawerRootContextValue | null>(null);

export function useDrawerRootContext(optional: true): DrawerRootContextValue | null;
export function useDrawerRootContext(optional?: false): DrawerRootContextValue;
export function useDrawerRootContext(optional = false) {
  const context = useContext(DrawerRootContext);

  if (context === null && !optional) {
    throw new Error(
      "Base UI: DrawerRootContext is missing. Drawer parts must be placed within <Drawer.Root>.",
    );
  }

  return context;
}
