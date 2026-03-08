import { createContext, useContext, type Accessor } from "solid-js";
import type { BaseUIChangeEventDetails } from "../types";

export interface CheckboxGroupContextValue {
  value: Accessor<readonly string[]>;
  setGroupValue: (
    nextValue: string,
    nextChecked: boolean,
    eventDetails: BaseUIChangeEventDetails<"none">,
  ) => void;
  disabled: Accessor<boolean>;
}

export const CheckboxGroupContext = createContext<CheckboxGroupContextValue | null>(null);

export function useCheckboxGroupContext(optional = true): CheckboxGroupContextValue | null {
  const context = useContext(CheckboxGroupContext);

  if (context === null && !optional) {
    throw new Error(
      "CheckboxGroup context is missing. CheckboxGroup parts must be placed within <CheckboxGroup>.",
    );
  }

  return context;
}
