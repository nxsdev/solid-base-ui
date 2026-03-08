import { createEffect, createMemo, createSignal, flush, untrack, type JSX, omit } from "solid-js";
import type { BaseUIGenericEventDetails } from "../types";
import { ResolvedChildren } from "../internal/ResolvedChildren";
import {
  FormContext,
  type Errors,
  type FormContextValue,
  type FormFieldRegistration,
} from "./FormContext";

/**
 * A native form element with consolidated error handling.
 */
export function Form<FormValues extends Record<string, unknown> = Record<string, unknown>>(
  props: Form.Props<FormValues>,
) {
  const registeredFields = new Map<string, FormFieldRegistration>();
  const [submitAttempted, setSubmitAttempted] = createSignal(false);
  const [submitted, setSubmitted] = createSignal(false);
  const [errors, setErrors] = createSignal<Errors>(untrack(() => props.errors ?? {}));

  createEffect(
    () => props.errors,
    (nextErrors) => {
      setErrors(() => nextErrors ?? {});
    },
  );

  createEffect(
    () => [errors(), submitted()] as const,
    ([, isSubmitted]) => {
      if (!isSubmitted) {
        return;
      }

      setSubmitted(() => false);

      const invalidField = getInvalidFields(registeredFields)[0];
      focusControl(invalidField?.controlRef() ?? null);
    },
  );

  const validate = (fieldName?: string | undefined) => {
    const values = Array.from(registeredFields.values());

    if (fieldName !== undefined) {
      const namedField = values.find((field) => field.name === fieldName);
      namedField?.validate(false);
      return;
    }

    values.forEach((field) => {
      field.validate(false);
    });
  };

  assignActionsRef(props.actionsRef, { validate });

  const clearErrors = (name: string | undefined) => {
    if (name === undefined) {
      return;
    }

    setErrors((previous) => {
      if (!Object.hasOwn(previous, name)) {
        return previous;
      }

      const nextErrors: Errors = { ...previous };
      delete nextErrors[name];
      return nextErrors;
    });
  };

  const contextValue: FormContextValue = {
    errors,
    clearErrors,
    validationMode: () => props.validationMode ?? "onSubmit",
    submitAttempted,
    registerField(id, field) {
      registeredFields.set(id, field);
    },
    unregisterField(id) {
      registeredFields.delete(id);
    },
    getFields() {
      return Array.from(registeredFields.values());
    },
  };

  const elementProps = createMemo(() => omit(props, ...FORM_OMITTED_PROP_KEYS));

  const handleSubmit: JSX.EventHandlerUnion<HTMLFormElement, SubmitEvent> = (event) => {
    setSubmitAttempted(() => true);
    flush();

    const fields = Array.from(registeredFields.values());
    fields.forEach((field) => {
      field.validate();
    });
    flush();

    const invalidFields = getInvalidFields(registeredFields);
    const invalidNativeField = fields.find((field) => {
      const control = field.controlRef();
      return control instanceof HTMLInputElement ||
        control instanceof HTMLSelectElement ||
        control instanceof HTMLTextAreaElement
        ? !control.checkValidity()
        : false;
    });

    if (invalidFields.length > 0 || invalidNativeField !== undefined) {
      event.preventDefault();
      focusControl(invalidFields[0]?.controlRef() ?? invalidNativeField?.controlRef() ?? null);
      return;
    }

    setSubmitted(() => true);

    callEventHandler(props.onSubmit, event);

    if (props.onFormSubmit !== undefined) {
      event.preventDefault();

      const formValues: Record<string, unknown> = {};
      fields.forEach((field) => {
        if (field.name !== undefined) {
          formValues[field.name] = field.getValue();
        }
      });

      const details: FormSubmitEventDetails = {
        reason: "none",
        event,
      };

      props.onFormSubmit(formValues as FormValues, details);
    }
  };

  return (
    <FormContext value={contextValue}>
      <form novalidate {...elementProps()} onSubmit={handleSubmit}>
        <ResolvedChildren>{props.children}</ResolvedChildren>
      </form>
    </FormContext>
  );
}

export type FormSubmitEventReason = "none";
export type FormSubmitEventDetails = BaseUIGenericEventDetails<Form.SubmitEventReason>;

export type FormValidationMode = "onSubmit" | "onBlur" | "onChange";

export interface FormActions {
  validate: (fieldName?: string | undefined) => void;
}

export interface FormState {}

export interface FormProps<
  FormValues extends Record<string, unknown> = Record<string, unknown>,
> extends JSX.FormHTMLAttributes<HTMLFormElement> {
  "data-testid"?: string | undefined;
  validationMode?: FormValidationMode | undefined;
  errors?: Errors | undefined;
  onFormSubmit?:
    | ((formValues: FormValues, eventDetails: FormSubmitEventDetails) => void)
    | undefined;
  actionsRef?: FormActionsRef | undefined;
}

export type FormActionsRef = { current: FormActions | null } | ((actions: FormActions) => void);

export namespace Form {
  export type Props<FormValues extends Record<string, unknown> = Record<string, unknown>> =
    FormProps<FormValues>;
  export type State = FormState;
  export type Actions = FormActions;
  export type ValidationMode = FormValidationMode;
  export type SubmitEventReason = FormSubmitEventReason;
  export type SubmitEventDetails = FormSubmitEventDetails;
  export type Values<FormValues extends Record<string, unknown> = Record<string, unknown>> =
    FormValues;
}

const FORM_OMITTED_PROP_KEYS = [
  "children",
  "validationMode",
  "errors",
  "onFormSubmit",
  "actionsRef",
  "onSubmit",
] as const satisfies ReadonlyArray<keyof FormProps>;

function assignActionsRef(ref: FormActionsRef | undefined, actions: FormActions): void {
  if (ref === undefined) {
    return;
  }

  if (typeof ref === "function") {
    ref(actions);
    return;
  }

  ref.current = actions;
}

function getInvalidFields(fields: Map<string, FormFieldRegistration>): FormFieldRegistration[] {
  return Array.from(fields.values()).filter((field) => field.validityData().state.valid === false);
}

function focusControl(control: HTMLElement | null): void {
  if (control === null) {
    return;
  }

  control.focus();

  if (control instanceof HTMLInputElement) {
    control.select();
  }
}

function callEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & {
    currentTarget: TElement;
    target: EventTarget & Element;
  },
): void {
  if (handler === undefined) {
    return;
  }

  if (typeof handler === "function") {
    handler(event);
    return;
  }

  handler[0](handler[1], event);
}
