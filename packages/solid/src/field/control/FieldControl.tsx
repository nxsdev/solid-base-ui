import {
  createEffect,
  createMemo,
  createRenderEffect,
  createSignal,
  onCleanup,
  onSettled,
  untrack,
  type JSX,
  omit,
} from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { useLabelableContext } from "../../labelable-provider";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { getFieldStateDataAttributes } from "../utils/constants";
import { useField } from "../useField";
import type { FieldRoot } from "../root/FieldRoot";
import { useFieldRootContext } from "../root/FieldRootContext";

const CONTROL_SOURCE = Symbol("field-control");

type FieldControlValue = string | number | string[] | undefined;

type FieldControlInputEvent = InputEvent & {
  currentTarget: HTMLInputElement;
  target: EventTarget & Element;
};

type FieldControlFocusEvent = FocusEvent & {
  currentTarget: HTMLInputElement;
  target: EventTarget & Element;
};

/**
 * The form control to label and validate.
 */
export function FieldControl(props: FieldControl.Props) {
  const rootContext = useFieldRootContext(false);
  const labelableContext = useLabelableContext();

  const generatedId = useMemoizedId(toStringOrUndefined(props.id));

  createRenderEffect(generatedId, (nextId) => {
    labelableContext.registerControlId(CONTROL_SOURCE, nextId);
  });

  onCleanup(() => {
    labelableContext.registerControlId(CONTROL_SOURCE, undefined);
  });

  const disabled = createMemo(
    () => resolveBoolean(props.disabled, false) || rootContext.disabled(),
  );

  const name = createMemo(() => {
    if (rootContext.name() !== undefined) {
      return rootContext.name();
    }

    return toStringOrUndefined(props.name);
  });

  const state = createMemo<FieldControlState>(() => ({
    ...rootContext.state(),
    disabled: disabled(),
  }));

  const controlledValue = createMemo<FieldControlValue>(() => normalizeControlValue(props.value));
  const defaultValue = createMemo<FieldControlValue>(() =>
    normalizeControlValue(props.defaultValue),
  );

  const [localValue, setLocalValue] = createSignal<string>(
    untrack(() => toInputString(defaultValue())),
  );

  const isControlled = createMemo(() => controlledValue() !== undefined);

  const value = createMemo<string>(() =>
    isControlled() ? toInputString(controlledValue()) : localValue(),
  );

  useField({
    id: generatedId,
    name,
    value: () => (isControlled() ? controlledValue() : value()),
    getValue: () => rootContext.validation.inputRef()?.value,
    commit(nextValue) {
      return rootContext.validation.commit(nextValue);
    },
    controlRef: () => rootContext.validation.inputRef(),
  });

  createEffect(controlledValue, (nextValue) => {
    if (nextValue === undefined) {
      return;
    }

    rootContext.setFilled(toInputString(nextValue) !== "");
  });

  onSettled(() => {
    if (!resolveBoolean(props.autofocus, false)) {
      return;
    }

    const inputElement = rootContext.validation.inputRef();

    if (inputElement !== null && document.activeElement === inputElement) {
      rootContext.setFocused(true);
    }
  });

  const validationProps = createMemo(() => rootContext.validation.getInputValidationProps());

  const describedBy = createMemo(() => {
    return mergeIdReferences(
      toStringOrUndefined(props["aria-describedby"]),
      toStringOrUndefined(validationProps()["aria-describedby"]),
      labelableContext.messageIds().join(" "),
    );
  });

  const ariaInvalid = createMemo<"true" | undefined>(() => {
    const external = props["aria-invalid"];

    if (external === "true" || external === "grammar" || external === "spelling") {
      return "true";
    }

    const validationValue = validationProps()["aria-invalid"];

    if (validationValue === "true") {
      return "true";
    }

    return undefined;
  });

  const elementProps = createMemo(() => omit(props, ...CONTROL_OMITTED_PROP_KEYS));

  const handleInput: JSX.EventHandlerUnion<HTMLInputElement, FieldControlInputEvent> = (event) => {
    callEventHandler(props.onInput, event);
    callEventHandler(props.onChange, event);
    callEventHandler(
      validationProps().onChange as
        | JSX.EventHandlerUnion<HTMLInputElement, FieldControlInputEvent>
        | undefined,
      event,
    );

    const inputValue = event.currentTarget.value;

    if (!isControlled()) {
      setLocalValue(() => inputValue);
    }

    rootContext.setDirty(inputValue !== rootContext.validityData().initialValue);
    rootContext.setFilled(inputValue !== "");

    props.onValueChange?.(
      inputValue,
      createChangeEventDetails(
        event,
        event.currentTarget,
        "none",
      ) as FieldControlChangeEventDetails,
    );
  };

  const handleFocus: JSX.EventHandlerUnion<HTMLInputElement, FieldControlFocusEvent> = (event) => {
    rootContext.setFocused(true);
    callEventHandler(props.onFocus, event);
  };

  const handleBlur: JSX.EventHandlerUnion<HTMLInputElement, FieldControlFocusEvent> = (event) => {
    rootContext.setTouched(true);
    rootContext.setFocused(false);

    if (rootContext.validationMode() === "onBlur") {
      void rootContext.validation.commit(event.currentTarget.value);
    }

    callEventHandler(props.onBlur, event);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLInputElement, KeyboardEvent> = (event) => {
    if (event.key === "Enter") {
      rootContext.setTouched(true);
      void rootContext.validation.commit(event.currentTarget.value);
    }

    callEventHandler(props.onKeyDown, event);
  };

  return (
    <input
      id={generatedId()}
      name={name()}
      disabled={disabled()}
      value={value()}
      autofocus={resolveBoolean(props.autofocus, false)}
      aria-labelledby={toStringOrUndefined(props["aria-labelledby"]) ?? labelableContext.labelId()}
      aria-describedby={describedBy()}
      aria-invalid={ariaInvalid()}
      ref={(node) => {
        rootContext.validation.setInputRef(node);

        if (typeof props.ref === "function") {
          props.ref(node);
        }
      }}
      onInput={handleInput}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      {...getFieldStateDataAttributes(state())}
      {...elementProps()}
    />
  );
}

export type FieldControlState = FieldRoot.State;

export interface FieldControlProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "onInput" | "onChange" | "onFocus" | "onBlur" | "value" | "defaultValue"
> {
  "data-testid"?: string | undefined;
  value?: FieldControlValue;
  defaultValue?: FieldControlValue;
  onInput?: ((event: FieldControlInputEvent) => void) | undefined;
  onChange?: ((event: FieldControlInputEvent) => void) | undefined;
  onFocus?: ((event: FieldControlFocusEvent) => void) | undefined;
  onBlur?: ((event: FieldControlFocusEvent) => void) | undefined;
  onValueChange?:
    | ((value: string, eventDetails: FieldControlChangeEventDetails) => void)
    | undefined;
}

export type FieldControlChangeEventReason = "none";

export type FieldControlChangeEventDetails =
  BaseUIChangeEventDetails<FieldControl.ChangeEventReason>;

export namespace FieldControl {
  export type State = FieldControlState;
  export type Props = FieldControlProps;
  export type ChangeEventReason = FieldControlChangeEventReason;
  export type ChangeEventDetails = FieldControlChangeEventDetails;
}

const CONTROL_OMITTED_PROP_KEYS = [
  "id",
  "name",
  "disabled",
  "value",
  "defaultValue",
  "autofocus",
  "aria-labelledby",
  "aria-describedby",
  "aria-invalid",
  "onInput",
  "onChange",
  "onFocus",
  "onBlur",
  "onKeyDown",
  "onValueChange",
  "ref",
] as const satisfies ReadonlyArray<keyof FieldControlProps>;

function useMemoizedId(id: string | undefined): () => string {
  const generatedId = useBaseUiId();

  return createMemo<string>(() => (typeof id === "string" && id !== "" ? id : generatedId));
}

function normalizeControlValue(value: unknown): FieldControlValue {
  if (value === undefined || value === null || value === false) {
    return undefined;
  }

  if (typeof value === "string" || typeof value === "number") {
    return value;
  }

  if (Array.isArray(value)) {
    return value.filter((entry) => typeof entry === "string") as string[];
  }

  return undefined;
}

function toInputString(value: FieldControlValue): string {
  if (value === undefined) {
    return "";
  }

  if (Array.isArray(value)) {
    return value.join(",");
  }

  return String(value);
}

function toStringOrUndefined(value: unknown): string | undefined {
  return typeof value === "string" && value !== "" ? value : undefined;
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

function mergeIdReferences(...values: Array<string | undefined>): string | undefined {
  const ids = new Set<string>();

  values.forEach((value) => {
    if (value === undefined) {
      return;
    }

    value
      .split(/\s+/)
      .map((entry) => entry.trim())
      .filter((entry) => entry !== "")
      .forEach((entry) => ids.add(entry));
  });

  if (ids.size === 0) {
    return undefined;
  }

  return Array.from(ids).join(" ");
}
