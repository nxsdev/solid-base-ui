import { Dynamic } from "../../internal/Dynamic";
import { createMemo, createSignal, omit, untrack, type JSX, type ValidComponent } from "solid-js";
import type { MenuRoot } from "../root/MenuRoot";
import { MenuRadioGroupContext, type MenuRadioGroupContextValue } from "./MenuRadioGroupContext";

/**
 * Groups related radio items.
 */
export function MenuRadioGroup(props: MenuRadioGroup.Props) {
  const [localValue, setLocalValue] = createSignal<unknown>(untrack(() => props.defaultValue));
  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const disabled = createMemo<boolean>(() => props.disabled ?? false);
  const value = createMemo<unknown>(() => props.value ?? localValue());
  const elementProps = createMemo(() => omit(props, ...RADIO_GROUP_OMITTED_PROP_KEYS));

  const contextValue: MenuRadioGroupContextValue = {
    value,
    setValue(nextValue, eventDetails) {
      props.onValueChange?.(nextValue, eventDetails);

      if (eventDetails.isCanceled) {
        return;
      }

      if (props.value === undefined) {
        setLocalValue(() => nextValue);
      }
    },
    disabled,
  };

  return (
    <MenuRadioGroupContext value={contextValue}>
      <Dynamic
        component={component()}
        role="group"
        aria-disabled={disabled() ? "true" : undefined}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </MenuRadioGroupContext>
  );
}

export interface MenuRadioGroupState {
  disabled: boolean;
}

export interface MenuRadioGroupProps extends JSX.HTMLAttributes<HTMLDivElement> {
  value?: unknown;
  defaultValue?: unknown;
  onValueChange?: ((value: unknown, eventDetails: MenuRoot.ChangeEventDetails) => void) | undefined;
  disabled?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace MenuRadioGroup {
  export type State = MenuRadioGroupState;
  export type Props = MenuRadioGroupProps;
  export type ChangeEventReason = MenuRoot.ChangeEventReason;
  export type ChangeEventDetails = MenuRoot.ChangeEventDetails;
}

const RADIO_GROUP_OMITTED_PROP_KEYS = [
  "children",
  "value",
  "defaultValue",
  "onValueChange",
  "disabled",
  "render",
] as const satisfies ReadonlyArray<keyof MenuRadioGroupProps>;
