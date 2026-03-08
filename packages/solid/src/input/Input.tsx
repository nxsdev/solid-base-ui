import { Dynamic } from "@solidjs/web";
import { createMemo, createSignal, untrack, type JSX, type ValidComponent } from "solid-js";
import { useLabelableContext } from "../labelable-provider";
import type { BaseUIChangeEventDetails } from "../types";
import { createChangeEventDetails } from "../utils/createChangeEventDetails";

type InputValue = string | number | string[] | undefined;
type InputInputEvent = InputEvent & {
  currentTarget: HTMLInputElement;
  target: EventTarget & Element;
};
type InputFocusEvent = FocusEvent & {
  currentTarget: HTMLInputElement;
  target: EventTarget & Element;
};

/**
 * A native input element.
 */
export function Input(props: Input.Props) {
  const initialValue = untrack(() => toInputString(props.value ?? props.defaultValue));

  const [touched, setTouched] = createSignal(false);
  const [dirty, setDirty] = createSignal(false);
  const [filled, setFilled] = createSignal(initialValue !== "");
  const [focused, setFocused] = createSignal(false);

  const isControlled = () => props.value !== undefined;
  const controlledValue = () => toInputString(props.value);
  const isFilled = () => (isControlled() ? controlledValue() !== "" : filled());
  const isDirty = () => (isControlled() ? controlledValue() !== initialValue : dirty());

  const { labelId } = useLabelableContext();

  const component = () => props.render ?? "input";
  const elementProps = createMemo(() => {
    const {
      render: _render,
      disabled: _disabled,
      onValueChange: _onValueChange,
      onInput: _onInput,
      onChange: _onChange,
      onFocus: _onFocus,
      onBlur: _onBlur,
      value: _value,
      defaultValue: _defaultValue,
      ...rest
    } = props;
    void _render;
    void _disabled;
    void _onValueChange;
    void _onInput;
    void _onChange;
    void _onFocus;
    void _onBlur;
    void _value;
    void _defaultValue;
    return rest;
  });

  return (
    <Dynamic
      component={component()}
      {...elementProps()}
      value={isControlled() ? props.value : undefined}
      defaultValue={isControlled() ? undefined : props.defaultValue}
      disabled={props.disabled ?? false}
      aria-labelledby={elementProps()["aria-labelledby"] ?? labelId()}
      data-disabled={props.disabled ? "" : undefined}
      data-touched={touched() ? "" : undefined}
      data-dirty={isDirty() ? "" : undefined}
      data-filled={isFilled() ? "" : undefined}
      data-focused={focused() ? "" : undefined}
      onInput={(event: InputInputEvent) => {
        props.onInput?.(event);
        props.onChange?.(event);

        const nextValue = event.currentTarget.value;

        if (!isControlled()) {
          setDirty(() => nextValue !== initialValue);
          setFilled(() => nextValue !== "");
        }

        props.onValueChange?.(nextValue, createChangeEventDetails(event, event.currentTarget));
      }}
      onFocus={(event: InputFocusEvent) => {
        setFocused(() => true);
        props.onFocus?.(event);
      }}
      onBlur={(event: InputFocusEvent) => {
        setTouched(() => true);
        setFocused(() => false);
        props.onBlur?.(event);
      }}
    />
  );
}

export interface InputState {
  disabled: boolean;
  touched: boolean;
  dirty: boolean;
  filled: boolean;
  focused: boolean;
}

export interface InputProps extends Omit<
  JSX.InputHTMLAttributes<HTMLInputElement>,
  "onInput" | "onChange" | "onFocus" | "onBlur"
> {
  onInput?: ((event: InputInputEvent) => void) | undefined;
  onChange?: ((event: InputInputEvent) => void) | undefined;
  onFocus?: ((event: InputFocusEvent) => void) | undefined;
  onBlur?: ((event: InputFocusEvent) => void) | undefined;
  /**
   * Callback fired when the input value changes.
   */
  onValueChange?: ((value: string, eventDetails: Input.ChangeEventDetails) => void) | undefined;
  /**
   * The input value. Use when controlled.
   */
  value?: InputValue;
  /**
   * The default input value. Use when uncontrolled.
   */
  defaultValue?: InputValue;
  /**
   * Custom render target.
   */
  render?: ValidComponent | undefined;
}

export type InputChangeEventReason = "none";
export type InputChangeEventDetails = BaseUIChangeEventDetails<InputChangeEventReason>;

export namespace Input {
  export type Props = InputProps;
  export type State = InputState;
  export type ChangeEventReason = InputChangeEventReason;
  export type ChangeEventDetails = InputChangeEventDetails;
}

function toInputString(value: InputValue): string {
  if (value === undefined) {
    return "";
  }
  if (Array.isArray(value)) {
    return value.join(",");
  }
  return String(value);
}
