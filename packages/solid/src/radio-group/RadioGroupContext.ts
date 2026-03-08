import { createContext, useContext, type Accessor } from "solid-js";
import type { BaseUIChangeEventDetails } from "../types";

export interface RadioGroupContextValue {
  value: Accessor<string | undefined>;
  setValue: (nextValue: string, eventDetails: BaseUIChangeEventDetails<"none">) => void;
  disabled: Accessor<boolean>;
  readOnly: Accessor<boolean>;
  required: Accessor<boolean>;
  name: Accessor<string | undefined>;
}

export const RadioGroupContext = createContext<RadioGroupContextValue | null>(null);

export function useRadioGroupContext(optional = true): RadioGroupContextValue | null {
  const context = useContext(RadioGroupContext);

  if (context === null && !optional) {
    throw new Error(
      "RadioGroup context is missing. Radio parts must be placed within <RadioGroup>.",
    );
  }

  return context;
}
