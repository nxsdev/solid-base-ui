import { createContext, useContext } from "solid-js";

export interface TooltipProviderContextValue {
  delay: number | undefined;
  closeDelay: number | undefined;
}

export const TooltipProviderContext = createContext<TooltipProviderContextValue | null>(null);

export function useTooltipProviderContext(): TooltipProviderContextValue | null {
  return useContext(TooltipProviderContext);
}
