import { createContext, useContext, type Accessor } from "solid-js";
import type { Setter } from "solid-js";
import type { Form } from "../../form";
import type { FieldValidityState } from "../utils/constants";
import type { UseFieldValidationReturnValue } from "./useFieldValidation";
import type { FieldRootState, FieldValidityData } from "./FieldRoot";

export interface FieldRootContextValue {
  invalid: Accessor<boolean>;
  name: Accessor<string | undefined>;
  validityData: Accessor<FieldValidityData>;
  setValidityData: Setter<FieldValidityData>;
  disabled: Accessor<boolean>;
  touched: Accessor<boolean>;
  setTouched: (value: boolean) => void;
  dirty: Accessor<boolean>;
  setDirty: (value: boolean) => void;
  filled: Accessor<boolean>;
  setFilled: (value: boolean) => void;
  focused: Accessor<boolean>;
  setFocused: (value: boolean) => void;
  validate: (
    value: unknown,
    formValues: Form.Values,
  ) => string | string[] | null | Promise<string | string[] | null>;
  validationMode: Accessor<Form.ValidationMode>;
  validationDebounceTime: Accessor<number>;
  shouldValidateOnChange: () => boolean;
  state: Accessor<FieldRootState>;
  markDirty: () => void;
  isDirtyMarked: Accessor<boolean>;
  validation: UseFieldValidationReturnValue;
}

export const FieldRootContext = createContext<FieldRootContextValue | null>(null);

export function useFieldRootContext(optional?: true): FieldRootContextValue | null;
export function useFieldRootContext(optional: false): FieldRootContextValue;
export function useFieldRootContext(optional = true): FieldRootContextValue | null {
  const context = useContext(FieldRootContext);

  if (context === null && !optional) {
    throw new Error(
      "FieldRoot context is missing. Field parts must be placed within <Field.Root>.",
    );
  }

  return context;
}

export function createEmptyFieldValidityData(): FieldValidityData {
  const state: FieldValidityState = {
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

  return {
    state,
    error: "",
    errors: [],
    value: null,
    initialValue: null,
  };
}
