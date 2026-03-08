import { Dynamic } from "@solidjs/web";
import { createMemo, createSignal, omit, untrack, type ValidComponent } from "solid-js";
import type { BaseUIChangeEventDetails } from "../types";
import { useButton } from "../use-button";
import type { ButtonPropsForUseButton } from "../use-button";
import { useToggleGroupContext } from "../toggle-group/ToggleGroupContext";
import { createChangeEventDetails } from "../utils/createChangeEventDetails";
import { useBaseUiId } from "../utils/useBaseUiId";

/**
 * A two-state button that can be on or off.
 */
export function Toggle(props: Toggle.Props) {
  const groupContext = useToggleGroupContext();
  const generatedValue = useBaseUiId();
  const [localPressed, setLocalPressed] = createSignal<boolean>(
    untrack(() => props.defaultPressed ?? false),
  );

  const toggleValue = createMemo(() => props.value || generatedValue);
  const disabled = createMemo<boolean>(
    () => (props.disabled ?? false) || (groupContext?.disabled() ?? false),
  );

  const pressed = createMemo<boolean>(() => {
    if (groupContext) {
      return groupContext.value().includes(toggleValue());
    }

    if (props.pressed !== undefined) {
      return props.pressed;
    }

    return localPressed();
  });

  const { getButtonProps, buttonRef } = useButton({
    disabled,
    native: () => props.nativeButton,
  });

  const component = () => props.render ?? (props.nativeButton === false ? "span" : "button");

  const elementProps = createMemo(() => omit(props, ...TOGGLE_OMITTED_PROP_KEYS));

  const buttonProps = createMemo(() =>
    getButtonProps({
      ...elementProps(),
      "aria-pressed": pressed() ? "true" : "false",
      "data-pressed": pressed() ? "" : undefined,
      onClick(event) {
        const details = createChangeEventDetails(event, event.currentTarget);
        const nextPressed = !pressed();

        groupContext?.setGroupValue(toggleValue(), nextPressed, details);
        props.onPressedChange?.(nextPressed, details);

        if (details.isCanceled) {
          return;
        }

        if (groupContext === null && props.pressed === undefined) {
          setLocalPressed(() => nextPressed);
        }
      },
    } satisfies ButtonPropsForUseButton<HTMLElement>),
  );

  return <Dynamic component={component()} ref={buttonRef} {...buttonProps()} />;
}

export interface ToggleState {
  /**
   * Whether the toggle is currently pressed.
   */
  pressed: boolean;
  /**
   * Whether the toggle should ignore user interaction.
   */
  disabled: boolean;
}

export interface ToggleProps extends Omit<ButtonPropsForUseButton<HTMLElement>, "disabled"> {
  /**
   * Controlled pressed state.
   */
  pressed?: boolean | undefined;
  /**
   * Uncontrolled initial pressed state.
   * @default false
   */
  defaultPressed?: boolean | undefined;
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: boolean | undefined;
  /**
   * Callback fired when pressed state changes.
   */
  onPressedChange?:
    | ((pressed: boolean, eventDetails: Toggle.ChangeEventDetails) => void)
    | undefined;
  /**
   * Identifier used by ToggleGroup.
   */
  value?: string | undefined;
  /**
   * Whether the rendered element is a native button.
   * @default true
   */
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export type ToggleChangeEventReason = "none";
export type ToggleChangeEventDetails = BaseUIChangeEventDetails<ToggleChangeEventReason>;

export namespace Toggle {
  export type State = ToggleState;
  export type Props = ToggleProps;
  export type ChangeEventReason = ToggleChangeEventReason;
  export type ChangeEventDetails = ToggleChangeEventDetails;
}

const TOGGLE_OMITTED_PROP_KEYS = [
  "render",
  "defaultPressed",
  "pressed",
  "onPressedChange",
  "value",
  "disabled",
  "nativeButton",
  "ref",
] as const satisfies ReadonlyArray<keyof ToggleProps>;
