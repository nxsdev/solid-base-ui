import { createRequiredContext } from "@solid-base-ui/utils";

export interface SwitchRootContextValue {
  checked: () => boolean;
  disabled: () => boolean;
  readOnly: () => boolean;
  required: () => boolean;
  touched: () => boolean;
  dirty: () => boolean;
  filled: () => boolean;
  focused: () => boolean;
}

export const [SwitchRootContext, useSwitchRootContext] =
  createRequiredContext<SwitchRootContextValue>("SwitchRoot");
