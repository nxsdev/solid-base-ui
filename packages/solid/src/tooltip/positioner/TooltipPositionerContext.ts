import { createContext, useContext, type Accessor } from "solid-js";
import type { TooltipPositioner } from "./TooltipPositioner";

export interface TooltipPositionerContextValue {
  side: Accessor<TooltipPositioner.Side>;
  align: Accessor<TooltipPositioner.Align>;
  anchorHidden: Accessor<boolean>;
  arrowStyle: Accessor<Record<string, string | undefined>>;
  arrowUncentered: Accessor<boolean>;
  setArrowElement(element: HTMLElement | null): void;
}

export const TooltipPositionerContext = createContext<TooltipPositionerContextValue | null>(null);

export function useTooltipPositionerContext(optional: true): TooltipPositionerContextValue | null;
export function useTooltipPositionerContext(optional?: false): TooltipPositionerContextValue;
export function useTooltipPositionerContext(optional = false) {
  const context = useContext(TooltipPositionerContext);

  if (context === null && !optional) {
    throw new Error(
      "TooltipPositioner context is missing. Tooltip.Popup and Tooltip.Arrow must be placed within <Tooltip.Positioner>.",
    );
  }

  return context;
}
