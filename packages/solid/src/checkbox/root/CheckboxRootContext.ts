import { createRequiredContext } from "@solid-base-ui/utils";

export interface CheckboxRootContextValue {
  checked: () => boolean;
  indeterminate: () => boolean;
  disabled: () => boolean;
  readOnly: () => boolean;
  required: () => boolean;
  touched: () => boolean;
  dirty: () => boolean;
  filled: () => boolean;
  focused: () => boolean;
}

export const [CheckboxRootContext, useCheckboxRootContext] =
  createRequiredContext<CheckboxRootContextValue>("CheckboxRoot");
