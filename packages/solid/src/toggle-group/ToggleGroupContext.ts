import { createContext, useContext } from "solid-js";
import type { Accessor } from "solid-js";
import type { Orientation } from "../types";
import type { BaseUIChangeEventDetails } from "../types";

export interface ToggleGroupContextValue {
  value: Accessor<readonly string[]>;
  setGroupValue: (
    newValue: string,
    nextPressed: boolean,
    eventDetails: BaseUIChangeEventDetails<"none">,
  ) => void;
  disabled: Accessor<boolean>;
  orientation: Accessor<Orientation>;
  isValueInitialized: Accessor<boolean>;
}

export const ToggleGroupContext = createContext<ToggleGroupContextValue | null>(null);

export function useToggleGroupContext(optional = true): ToggleGroupContextValue | null {
  const context = useContext(ToggleGroupContext);

  if (context === null && !optional) {
    throw new Error(
      "ToggleGroup context is missing. ToggleGroup parts must be placed within <ToggleGroup>.",
    );
  }

  return context;
}
