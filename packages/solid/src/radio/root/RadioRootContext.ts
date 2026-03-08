import { createRequiredContext } from "@solid-base-ui/utils";

export interface RadioRootContextValue {
  checked: () => boolean;
  disabled: () => boolean;
  readOnly: () => boolean;
  required: () => boolean;
  touched: () => boolean;
  dirty: () => boolean;
  filled: () => boolean;
  focused: () => boolean;
}

export const [RadioRootContext, useRadioRootContext] =
  createRequiredContext<RadioRootContextValue>("RadioRoot");
