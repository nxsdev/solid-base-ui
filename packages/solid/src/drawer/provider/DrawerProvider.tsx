import { createMemo, createSignal, type JSX } from "solid-js";
import {
  DrawerProviderContext,
  type DrawerProviderContextValue,
  type DrawerVisualStateStore,
} from "./DrawerProviderContext";

/**
 * Provides shared drawer state for indent/background effects.
 * Doesn't render its own HTML element.
 */
export function DrawerProvider(props: DrawerProvider.Props) {
  const [openById, setOpenById] = createSignal<Map<string, boolean>>(new Map());
  const visualStateStore = createVisualStateStore();

  const setDrawerOpen = (drawerId: string, open: boolean) => {
    setOpenById((previous) => {
      if (previous.get(drawerId) === open) {
        return previous;
      }

      const next = new Map(previous);
      next.set(drawerId, open);
      return next;
    });
  };

  const removeDrawer = (drawerId: string) => {
    setOpenById((previous) => {
      if (!previous.has(drawerId)) {
        return previous;
      }

      const next = new Map(previous);
      next.delete(drawerId);
      return next;
    });
  };

  const active = createMemo<boolean>(() => {
    for (const open of openById().values()) {
      if (open) {
        return true;
      }
    }

    return false;
  });

  const contextValue = {
    setDrawerOpen,
    removeDrawer,
    active,
    visualStateStore,
  } satisfies DrawerProviderContextValue;

  return <DrawerProviderContext value={contextValue}>{props.children}</DrawerProviderContext>;
}

export interface DrawerProviderProps {
  children?: JSX.Element | undefined;
}

export interface DrawerProviderState {}

export namespace DrawerProvider {
  export type Props = DrawerProviderProps;
  export type State = DrawerProviderState;
}

function createVisualStateStore(): DrawerVisualStateStore {
  let swipeProgress = 0;
  let frontmostHeight = 0;
  const listeners = new Set<() => void>();

  const emit = () => {
    listeners.forEach((listener) => {
      listener();
    });
  };

  return {
    getSnapshot() {
      return {
        swipeProgress,
        frontmostHeight,
      };
    },
    subscribe(listener) {
      listeners.add(listener);

      return () => {
        listeners.delete(listener);
      };
    },
    set(nextState) {
      const nextSwipeProgress =
        nextState.swipeProgress === undefined || !Number.isFinite(nextState.swipeProgress)
          ? swipeProgress
          : nextState.swipeProgress;
      const nextFrontmostHeight =
        nextState.frontmostHeight === undefined || !Number.isFinite(nextState.frontmostHeight)
          ? frontmostHeight
          : nextState.frontmostHeight;

      if (nextSwipeProgress === swipeProgress && nextFrontmostHeight === frontmostHeight) {
        return;
      }

      swipeProgress = nextSwipeProgress;
      frontmostHeight = nextFrontmostHeight;
      emit();
    },
  };
}
