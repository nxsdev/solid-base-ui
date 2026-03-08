import { FieldRootDataAttributes } from "../root/FieldRootDataAttributes";
import type { FieldRootState } from "../root/FieldRoot";

export const DEFAULT_VALIDITY_STATE: FieldValidityState = {
  badInput: false,
  customError: false,
  patternMismatch: false,
  rangeOverflow: false,
  rangeUnderflow: false,
  stepMismatch: false,
  tooLong: false,
  tooShort: false,
  typeMismatch: false,
  valueMissing: false,
  valid: null,
};

export const DEFAULT_FIELD_STATE_ATTRIBUTES: Pick<
  FieldRootState,
  "valid" | "touched" | "dirty" | "filled" | "focused"
> = {
  valid: null,
  touched: false,
  dirty: false,
  filled: false,
  focused: false,
};

export const DEFAULT_FIELD_ROOT_STATE: FieldRootState = {
  disabled: false,
  ...DEFAULT_FIELD_STATE_ATTRIBUTES,
};

export function getFieldStateDataAttributes(
  state: Pick<FieldRootState, "disabled" | "valid" | "touched" | "dirty" | "filled" | "focused">,
): Record<string, string | undefined> {
  return {
    [FieldRootDataAttributes.disabled]: state.disabled ? "" : undefined,
    [FieldRootDataAttributes.valid]: state.valid === true ? "" : undefined,
    [FieldRootDataAttributes.invalid]: state.valid === false ? "" : undefined,
    [FieldRootDataAttributes.touched]: state.touched ? "" : undefined,
    [FieldRootDataAttributes.dirty]: state.dirty ? "" : undefined,
    [FieldRootDataAttributes.filled]: state.filled ? "" : undefined,
    [FieldRootDataAttributes.focused]: state.focused ? "" : undefined,
  };
}

export type FieldValidityState = {
  badInput: boolean;
  customError: boolean;
  patternMismatch: boolean;
  rangeOverflow: boolean;
  rangeUnderflow: boolean;
  stepMismatch: boolean;
  tooLong: boolean;
  tooShort: boolean;
  typeMismatch: boolean;
  valueMissing: boolean;
  valid: boolean | null;
};
