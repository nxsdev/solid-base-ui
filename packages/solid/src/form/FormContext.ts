import { createContext, useContext, type Accessor } from "solid-js";
import type { FieldValidityData } from "../field/root/FieldRoot";
import type { FormValidationMode } from "./Form";

export type Errors = Record<string, string | string[]>;

export interface FormFieldRegistration {
  name: string | undefined;
  validate: (flushSync?: boolean | undefined) => void;
  validityData: Accessor<FieldValidityData>;
  controlRef: () => HTMLElement | null;
  getValue: () => unknown;
}

export interface FormContextValue {
  errors: Accessor<Errors>;
  clearErrors: (name: string | undefined) => void;
  validationMode: Accessor<FormValidationMode>;
  submitAttempted: Accessor<boolean>;
  registerField: (id: string, field: FormFieldRegistration) => void;
  unregisterField: (id: string) => void;
  getFields: () => FormFieldRegistration[];
}

const EMPTY_ERRORS: Errors = {};

const DEFAULT_FORM_CONTEXT: FormContextValue = {
  errors: () => EMPTY_ERRORS,
  clearErrors: () => {},
  validationMode: () => "onSubmit",
  submitAttempted: () => false,
  registerField: () => {},
  unregisterField: () => {},
  getFields: () => [],
};

export const FormContext = createContext<FormContextValue>(DEFAULT_FORM_CONTEXT);

export function useFormContext(): FormContextValue {
  return useContext(FormContext);
}
