import { createContext, useContext, type Accessor } from "solid-js";
import type { PopoverPositioner } from "./PopoverPositioner";

export interface PopoverPositionerContextValue {
  side: Accessor<PopoverPositioner.Side>;
  align: Accessor<PopoverPositioner.Align>;
  anchorHidden: Accessor<boolean>;
  arrowStyle: Accessor<Record<string, string | undefined>>;
  arrowUncentered: Accessor<boolean>;
  setArrowElement(element: HTMLElement | null): void;
}

export const PopoverPositionerContext = createContext<PopoverPositionerContextValue | null>(null);

export function usePopoverPositionerContext(optional: true): PopoverPositionerContextValue | null;
export function usePopoverPositionerContext(optional?: false): PopoverPositionerContextValue;
export function usePopoverPositionerContext(optional = false) {
  const context = useContext(PopoverPositionerContext);

  if (context === null && !optional) {
    throw new Error(
      "PopoverPositioner context is missing. Popover.Popup and Popover.Arrow must be placed within <Popover.Positioner>.",
    );
  }

  return context;
}
