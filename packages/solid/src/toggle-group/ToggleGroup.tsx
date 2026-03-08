import { createMemo, createSignal, untrack, type JSX, type ValidComponent } from "solid-js";
import { Dynamic } from "@solidjs/web";
import type { BaseUIChangeEventDetails, Orientation } from "../types";
import { ToggleGroupContext, type ToggleGroupContextValue } from "./ToggleGroupContext";

/**
 * Provides shared pressed state for a series of toggle buttons.
 */
export function ToggleGroup(props: ToggleGroup.Props) {
  const [localValue, setLocalValue] = createSignal<string[]>(
    untrack(() => [...(props.defaultValue ?? [])]),
  );

  const groupValue = (): string[] => (props.value !== undefined ? [...props.value] : localValue());

  const setGroupValue = (
    newValue: string,
    nextPressed: boolean,
    eventDetails: BaseUIChangeEventDetails<"none">,
  ) => {
    const currentValue = groupValue();
    let nextGroupValue: string[];

    if (props.multiple) {
      nextGroupValue = [...currentValue];
      const existingIndex = nextGroupValue.indexOf(newValue);

      if (nextPressed && existingIndex === -1) {
        nextGroupValue.push(newValue);
      }

      if (!nextPressed && existingIndex !== -1) {
        nextGroupValue.splice(existingIndex, 1);
      }
    } else {
      nextGroupValue = nextPressed ? [newValue] : [];
    }

    props.onValueChange?.(nextGroupValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    if (props.value === undefined) {
      setLocalValue(nextGroupValue);
    }
  };

  const contextValue: ToggleGroupContextValue = {
    value: () => groupValue(),
    setGroupValue,
    disabled: () => props.disabled ?? false,
    orientation: () => props.orientation ?? "horizontal",
    isValueInitialized: () => props.value !== undefined || props.defaultValue !== undefined,
  };

  const component = () => props.render ?? "div";
  const elementProps = createMemo(() => {
    const {
      render: _render,
      disabled: _disabled,
      orientation: _orientation,
      multiple: _multiple,
      value: _value,
      defaultValue: _defaultValue,
      onValueChange: _onValueChange,
      loopFocus: _loopFocus,
      children: _children,
      ...rest
    } = props;
    void _render;
    void _disabled;
    void _orientation;
    void _multiple;
    void _value;
    void _defaultValue;
    void _onValueChange;
    void _loopFocus;
    void _children;
    return rest;
  });

  return (
    <ToggleGroupContext value={contextValue}>
      <Dynamic
        component={component()}
        role="group"
        data-disabled={props.disabled ? "" : undefined}
        data-orientation={props.orientation ?? "horizontal"}
        data-multiple={props.multiple ? "" : undefined}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </ToggleGroupContext>
  );
}

export interface ToggleGroupState {
  disabled: boolean;
  multiple: boolean;
  orientation: Orientation;
}

export interface ToggleGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  /**
   * Controlled pressed values.
   */
  value?: readonly string[] | undefined;
  /**
   * Uncontrolled initial pressed values.
   */
  defaultValue?: readonly string[] | undefined;
  /**
   * Called when pressed values change.
   */
  onValueChange?:
    | ((groupValue: string[], eventDetails: ToggleGroup.ChangeEventDetails) => void)
    | undefined;
  /**
   * Whether all toggles should be disabled.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * @default "horizontal"
   */
  orientation?: Orientation | undefined;
  /**
   * Whether multiple toggles can be pressed.
   * @default false
   */
  multiple?: boolean | undefined;
  /**
   * Reserved for keyboard roving behavior.
   * @default true
   */
  loopFocus?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export type ToggleGroupChangeEventReason = "none";
export type ToggleGroupChangeEventDetails = BaseUIChangeEventDetails<ToggleGroupChangeEventReason>;

export namespace ToggleGroup {
  export type State = ToggleGroupState;
  export type Props = ToggleGroupProps;
  export type ChangeEventReason = ToggleGroupChangeEventReason;
  export type ChangeEventDetails = ToggleGroupChangeEventDetails;
}
