import { Dynamic } from "@solidjs/web";
import { createMemo, createSignal, untrack, type JSX, type ValidComponent, omit } from "solid-js";
import type { BaseUIChangeEventDetails } from "../types";
import { CheckboxGroupContext, type CheckboxGroupContextValue } from "./CheckboxGroupContext";

/**
 * Provides a shared state to a series of checkboxes.
 */
export function CheckboxGroup(props: CheckboxGroup.Props) {
  const [localValue, setLocalValue] = createSignal<string[]>(
    untrack(() => [...(props.defaultValue ?? [])]),
  );

  const groupValue = (): string[] => (props.value !== undefined ? [...props.value] : localValue());

  const setGroupValue = (
    newValue: string,
    nextChecked: boolean,
    eventDetails: BaseUIChangeEventDetails<"none">,
  ) => {
    const currentValue = groupValue();
    let nextGroupValue = [...currentValue];
    const existingIndex = nextGroupValue.indexOf(newValue);

    if (nextChecked && existingIndex === -1) {
      nextGroupValue.push(newValue);
    }

    if (!nextChecked && existingIndex !== -1) {
      nextGroupValue.splice(existingIndex, 1);
    }

    props.onValueChange?.(nextGroupValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    if (props.value === undefined) {
      setLocalValue(nextGroupValue);
    }
  };

  const contextValue: CheckboxGroupContextValue = {
    value: () => groupValue(),
    setGroupValue,
    disabled: () => props.disabled ?? false,
  };

  const component = () => props.render ?? "div";
  const elementProps = createMemo(() => omit(props, ...GROUP_OMITTED_PROP_KEYS));

  return (
    <CheckboxGroupContext value={contextValue}>
      <Dynamic
        component={component()}
        role={typeof props.role === "string" ? props.role : "group"}
        data-disabled={props.disabled ? "" : undefined}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </CheckboxGroupContext>
  );
}

export interface CheckboxGroupState {
  disabled: boolean;
}

export interface CheckboxGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: readonly string[] | undefined;
  defaultValue?: readonly string[] | undefined;
  onValueChange?:
    | ((value: string[], eventDetails: CheckboxGroup.ChangeEventDetails) => void)
    | undefined;
  disabled?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export type CheckboxGroupChangeEventReason = "none";
export type CheckboxGroupChangeEventDetails =
  BaseUIChangeEventDetails<CheckboxGroupChangeEventReason>;

export namespace CheckboxGroup {
  export type State = CheckboxGroupState;
  export type Props = CheckboxGroupProps;
  export type ChangeEventReason = CheckboxGroupChangeEventReason;
  export type ChangeEventDetails = CheckboxGroupChangeEventDetails;
}

const GROUP_OMITTED_PROP_KEYS = [
  "render",
  "disabled",
  "value",
  "defaultValue",
  "onValueChange",
] as const satisfies ReadonlyArray<keyof CheckboxGroupProps>;
