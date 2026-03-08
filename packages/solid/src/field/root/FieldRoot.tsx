import { createMemo, createSignal, type JSX, omit } from "solid-js";
import type { Form } from "../../form";
import { useFormContext } from "../../form/FormContext";
import { useFieldsetRootContext } from "../../fieldset/root/FieldsetRootContext";
import { ResolvedChildren } from "../../internal/ResolvedChildren";
import { LabelableProvider } from "../../labelable-provider";
import { resolveBoolean } from "../../utils/resolveBoolean";
import {
  DEFAULT_VALIDITY_STATE,
  getFieldStateDataAttributes,
  type FieldValidityState,
} from "../utils/constants";
import { FieldRootContext, type FieldRootContextValue } from "./FieldRootContext";
import { useFieldValidation } from "./useFieldValidation";

/**
 * Groups all parts of the field.
 */
export function FieldRoot(props: FieldRoot.Props) {
  const formContext = useFormContext();
  const fieldsetContext = useFieldsetRootContext(true);

  const [touchedState, setTouchedState] = createSignal(false);
  const [dirtyState, setDirtyState] = createSignal(false);
  const [filled, setFilledState] = createSignal(false);
  const [focused, setFocusedState] = createSignal(false);
  const [dirtyMarked, setDirtyMarked] = createSignal(false);

  const [validityData, setValidityData] = createSignal<FieldValidityData>({
    state: DEFAULT_VALIDITY_STATE,
    error: "",
    errors: [],
    value: null,
    initialValue: null,
  });

  const validationMode = createMemo<Form.ValidationMode>(
    () => props.validationMode ?? formContext.validationMode(),
  );
  const validationDebounceTime = createMemo(() => props.validationDebounceTime ?? 0);

  const name = () => props.name;

  const disabled = createMemo(() => {
    const fieldsetDisabled = fieldsetContext?.disabled() ?? false;
    return resolveBoolean(props.disabled, false) || fieldsetDisabled;
  });

  const touched = createMemo(() => resolveBoolean(props.touched, touchedState()));
  const dirty = createMemo(() => resolveBoolean(props.dirty, dirtyState()));

  const shouldValidateOnChange = () => {
    const mode = validationMode();

    return mode === "onChange" || (mode === "onSubmit" && formContext.submitAttempted());
  };

  const hasFormError = createMemo(() => {
    const fieldName = name();

    if (fieldName === undefined) {
      return false;
    }

    const errors = formContext.errors();

    return Object.hasOwn(errors, fieldName) && errors[fieldName] !== undefined;
  });

  const invalid = createMemo(() => resolveBoolean(props.invalid, false) || hasFormError());

  const valid = createMemo(() => !invalid() && validityData().state.valid);

  const state = createMemo<FieldRootState>(() => ({
    disabled: disabled(),
    touched: touched(),
    dirty: dirty(),
    valid: valid(),
    filled: filled(),
    focused: focused(),
  }));

  const validate = (
    value: unknown,
    formValues: Record<string, unknown>,
  ): string | string[] | null | Promise<string | string[] | null> => {
    if (props.validate === undefined) {
      return null;
    }

    return props.validate(value, formValues);
  };

  const setTouched = (value: boolean) => {
    if (props.touched !== undefined) {
      return;
    }

    setTouchedState(() => value);
  };

  const setDirty = (value: boolean) => {
    if (props.dirty !== undefined) {
      return;
    }

    if (value) {
      setDirtyMarked(() => true);
    }

    setDirtyState(() => value);
  };

  const setFilled = (value: boolean) => {
    setFilledState(() => value);
  };

  const setFocused = (value: boolean) => {
    setFocusedState(() => value);
  };

  const validation = useFieldValidation({
    setValidityData(data) {
      setValidityData(() => data);
    },
    validate,
    validityData,
    validationDebounceTime,
    state,
    name,
    isDirtyMarked: dirtyMarked,
    shouldValidateOnChange,
  });

  const validateCurrent = () => {
    setDirtyMarked(() => true);
    void validation.commit(validityData().value);
  };

  assignActionsRef(props.actionsRef, { validate: validateCurrent });

  const contextValue: FieldRootContextValue = {
    invalid,
    name,
    validityData,
    setValidityData,
    disabled,
    touched,
    setTouched,
    dirty,
    setDirty,
    filled,
    setFilled,
    focused,
    setFocused,
    validate,
    validationMode,
    validationDebounceTime,
    shouldValidateOnChange,
    state,
    markDirty() {
      setDirtyMarked(() => true);
    },
    isDirtyMarked: dirtyMarked,
    validation,
  };

  const elementProps = createMemo(() => omit(props, ...ROOT_OMITTED_PROP_KEYS));

  return (
    <LabelableProvider>
      <FieldRootContext value={contextValue}>
        <div {...getFieldStateDataAttributes(state())} {...elementProps()}>
          <ResolvedChildren>{props.children}</ResolvedChildren>
        </div>
      </FieldRootContext>
    </LabelableProvider>
  );
}

export interface FieldValidityData {
  state: FieldValidityState;
  error: string;
  errors: string[];
  value: unknown;
  initialValue: unknown;
}

export interface FieldRootActions {
  validate: () => void;
}

export interface FieldRootState {
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
  valid: boolean | null;
  filled: boolean;
  focused: boolean;
}

export interface FieldRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
  name?: string | undefined;
  validate?:
    | ((
        value: unknown,
        formValues: Form.Values,
      ) => string | string[] | null | Promise<string | string[] | null>)
    | undefined;
  validationMode?: Form.ValidationMode | undefined;
  validationDebounceTime?: number | undefined;
  invalid?: boolean | undefined;
  dirty?: boolean | undefined;
  touched?: boolean | undefined;
  actionsRef?: FieldRootActionsRef | undefined;
}

export type FieldRootActionsRef =
  | { current: FieldRoot.Actions | null }
  | ((actions: FieldRoot.Actions) => void);

export namespace FieldRoot {
  export type State = FieldRootState;
  export type Props = FieldRootProps;
  export type Actions = FieldRootActions;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "disabled",
  "name",
  "validate",
  "validationMode",
  "validationDebounceTime",
  "invalid",
  "dirty",
  "touched",
  "actionsRef",
] as const satisfies ReadonlyArray<keyof FieldRootProps>;

function assignActionsRef(ref: FieldRootActionsRef | undefined, actions: FieldRootActions): void {
  if (ref === undefined) {
    return;
  }

  if (typeof ref === "function") {
    ref(actions);
    return;
  }

  ref.current = actions;
}
