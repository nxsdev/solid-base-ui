import type { JSX } from "solid-js";
import { TooltipProviderContext } from "./TooltipProviderContext";

/**
 * Provides shared open/close delay values for nested tooltip triggers.
 */
export function TooltipProvider(props: TooltipProvider.Props) {
  return (
    <TooltipProviderContext
      value={{
        delay: props.delay,
        closeDelay: props.closeDelay,
      }}
    >
      {props.children}
    </TooltipProviderContext>
  );
}

export interface TooltipProviderProps {
  children?: JSX.Element | undefined;
  delay?: number | undefined;
  closeDelay?: number | undefined;
  timeout?: number | undefined;
}

export namespace TooltipProvider {
  export type Props = TooltipProviderProps;
}
