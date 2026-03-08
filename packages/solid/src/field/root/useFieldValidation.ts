import { onCleanup, type Accessor } from "solid-js";
import { combineProps, type DomProps } from "../../merge-props";
import { useLabelableContext } from "../../labelable-provider";
import { useFormContext } from "../../form/FormContext";
import { DEFAULT_VALIDITY_STATE, type FieldValidityState } from "../utils/constants";
import type { FieldValidityData, FieldRootState } from "./FieldRoot";

const VALIDITY_KEYS: Array<keyof ValidityState> = [
  "badInput",
  "customError",
  "patternMismatch",
  "rangeOverflow",
  "rangeUnderflow",
  "stepMismatch",
  "tooLong",
  "tooShort",
  "typeMismatch",
  "valueMissing",
  "valid",
];

export function useFieldValidation(
  params: UseFieldValidationParameters,
): UseFieldValidationReturnValue {
  const formContext = useFormContext();
  const labelableContext = useLabelableContext();

  let inputElement: HTMLInputElement | null = null;
  const inputRef = () => inputElement;
  const setInputRef = (node: HTMLInputElement | null) => {
    inputElement = node;
  };

  let timeoutId: number | undefined;

  const clearPendingTimeout = () => {
    if (timeoutId !== undefined) {
      clearTimeout(timeoutId);
      timeoutId = undefined;
    }
  };

  onCleanup(() => {
    clearPendingTimeout();
  });

  const commit = async (value: unknown, revalidate = false): Promise<void> => {
    const element = inputRef();
    if (element === null) {
      return;
    }

    if (revalidate && params.state().valid !== false) {
      return;
    }

    const nextState = getValidityState(element.validity);

    if (nextState.valueMissing && !params.isDirtyMarked()) {
      nextState.valueMissing = false;
      nextState.valid = true;
    }

    const validateOnChange = params.shouldValidateOnChange();

    let validationErrors: string[] = [];
    let primaryError = "";

    const formValues: Record<string, unknown> = {};
    formContext.getFields().forEach((field) => {
      if (field.name !== undefined) {
        formValues[field.name] = field.getValue();
      }
    });

    const applyValidationResult = (result: string | string[] | null) => {
      if (Array.isArray(result)) {
        validationErrors = result;
        primaryError = result[0] ?? "";
        nextState.valid = false;
        nextState.customError = validationErrors.length > 0;
        element.setCustomValidity(result.join("\n"));
        return;
      }

      if (typeof result === "string") {
        validationErrors = [result];
        primaryError = result;
        nextState.valid = false;
        nextState.customError = result !== "";
        element.setCustomValidity(result);
        return;
      }

      element.setCustomValidity("");
      nextState.customError = false;
    };

    if (!validateOnChange && element.validationMessage !== "" && !revalidate) {
      primaryError = element.validationMessage;
      validationErrors = [element.validationMessage];
    } else {
      const result = params.validate(value, formValues);

      if (isPromiseLike<string | string[] | null>(result)) {
        applyValidationResult(await result);
      } else {
        applyValidationResult(result);
      }
    }

    if (validationErrors.length === 0 && element.validationMessage !== "") {
      primaryError = element.validationMessage;
      validationErrors = [element.validationMessage];
      nextState.valid = false;
    }

    const nextValidityData: FieldValidityData = {
      value,
      state: nextState,
      error: primaryError,
      errors: validationErrors,
      initialValue: params.validityData().initialValue,
    };

    params.setValidityData(nextValidityData);
  };

  const getValidationProps = <TElement extends HTMLElement>(
    externalProps: DomProps<TElement> = {},
  ): DomProps<TElement> => {
    const described = labelableContext.getDescriptionProps<TElement>(externalProps);

    const ariaProps: DomProps<TElement> =
      params.state().valid === false
        ? {
            "aria-invalid": "true",
          }
        : {};

    return combineProps(ariaProps, described);
  };

  const getInputValidationProps = (
    externalProps: DomProps<HTMLInputElement> = {},
  ): DomProps<HTMLInputElement> => {
    const inputValidationProps: DomProps<HTMLInputElement> = {
      onChange(event) {
        formContext.clearErrors(params.name());

        const nextValue = event.currentTarget.value;

        if (!params.shouldValidateOnChange()) {
          void commit(nextValue, true);
          return;
        }

        if (nextValue === "") {
          clearPendingTimeout();
          void commit(nextValue);
          return;
        }

        clearPendingTimeout();

        const debounceMs = params.validationDebounceTime();

        if (debounceMs > 0) {
          timeoutId = window.setTimeout(() => {
            timeoutId = undefined;
            void commit(nextValue);
          }, debounceMs);
          return;
        }

        void commit(nextValue);
      },
    };

    return combineProps(inputValidationProps, getValidationProps(externalProps));
  };

  return {
    inputRef,
    setInputRef,
    commit,
    getValidationProps,
    getInputValidationProps,
  };
}

export interface UseFieldValidationParameters {
  setValidityData: (data: FieldValidityData) => void;
  validate: (
    value: unknown,
    formValues: Record<string, unknown>,
  ) => string | string[] | null | Promise<string | string[] | null>;
  validityData: Accessor<FieldValidityData>;
  validationDebounceTime: Accessor<number>;
  state: Accessor<FieldRootState>;
  name: Accessor<string | undefined>;
  isDirtyMarked: Accessor<boolean>;
  shouldValidateOnChange: () => boolean;
}

export interface UseFieldValidationReturnValue {
  inputRef: Accessor<HTMLInputElement | null>;
  setInputRef: (node: HTMLInputElement | null) => void;
  commit: (value: unknown, revalidate?: boolean | undefined) => Promise<void>;
  getValidationProps: <TElement extends HTMLElement>(
    externalProps?: DomProps<TElement> | undefined,
  ) => DomProps<TElement>;
  getInputValidationProps: (
    externalProps?: DomProps<HTMLInputElement> | undefined,
  ) => DomProps<HTMLInputElement>;
}

function getValidityState(validity: ValidityState): FieldValidityState {
  const state: FieldValidityState = {
    ...DEFAULT_VALIDITY_STATE,
  };

  VALIDITY_KEYS.forEach((key) => {
    state[key] = validity[key];
  });

  return state;
}

function isPromiseLike<TValue>(value: unknown): value is PromiseLike<TValue> {
  if (typeof value !== "object" || value === null) {
    return false;
  }

  return typeof (value as { then?: unknown }).then === "function";
}
