import { Dynamic } from "@solidjs/web";
import { createMemo, createSignal, untrack, type JSX, type ValidComponent } from "solid-js";
import type { BaseUIChangeEventDetails } from "../types";
import { RadioGroupContext, type RadioGroupContextValue } from "./RadioGroupContext";

/**
 * Provides a shared state to a series of radio buttons.
 */
export function RadioGroup(props: RadioGroup.Props) {
  const [localValue, setLocalValue] = createSignal<string | undefined>(
    untrack(() => props.defaultValue),
  );

  const groupValue = (): string | undefined =>
    props.value !== undefined ? props.value : localValue();

  const setValue = (nextValue: string, eventDetails: BaseUIChangeEventDetails<"none">) => {
    props.onValueChange?.(nextValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    if (props.value === undefined) {
      setLocalValue(nextValue);
    }
  };

  const contextValue: RadioGroupContextValue = {
    value: () => groupValue(),
    setValue,
    disabled: () => props.disabled ?? false,
    readOnly: () => props.readOnly ?? false,
    required: () => props.required ?? false,
    name: () => props.name,
  };

  const component = () => props.render ?? "div";
  const elementProps = createMemo(() => {
    const {
      render: _render,
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _onValueChange,
      disabled: _disabled,
      readOnly: _readOnly,
      required: _required,
      name: _name,
      ...rest
    } = props;
    void _render;
    void _value;
    void _defaultValue;
    void _onValueChange;
    void _disabled;
    void _readOnly;
    void _required;
    void _name;
    return rest;
  });

  return (
    <RadioGroupContext value={contextValue}>
      <Dynamic
        component={component()}
        role={typeof props.role === "string" ? props.role : "radiogroup"}
        aria-disabled={props.disabled ? "true" : undefined}
        aria-readonly={props.readOnly ? "true" : undefined}
        aria-required={props.required ? "true" : undefined}
        data-disabled={props.disabled ? "" : undefined}
        data-readonly={props.readOnly ? "" : undefined}
        data-required={props.required ? "" : undefined}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </RadioGroupContext>
  );
}

export interface RadioGroupState {
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
}

export interface RadioGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: string | undefined;
  defaultValue?: string | undefined;
  onValueChange?:
    | ((value: string, eventDetails: RadioGroup.ChangeEventDetails) => void)
    | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  render?: ValidComponent | undefined;
}

export type RadioGroupChangeEventReason = "none";
export type RadioGroupChangeEventDetails = BaseUIChangeEventDetails<RadioGroupChangeEventReason>;

export namespace RadioGroup {
  export type State = RadioGroupState;
  export type Props = RadioGroupProps;
  export type ChangeEventReason = RadioGroupChangeEventReason;
  export type ChangeEventDetails = RadioGroupChangeEventDetails;
}
