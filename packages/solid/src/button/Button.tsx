import type { JSX, ValidComponent } from "solid-js";
import { createMemo, omit } from "solid-js";
import { Dynamic } from "../internal/Dynamic";
import { useButton, type ButtonPropsForUseButton } from "../use-button/useButton";

/**
 * A button component that can be used to trigger actions.
 */
export function Button(props: ButtonProps) {
  const { getButtonProps, buttonRef } = useButton({
    disabled: () => props.disabled,
    focusableWhenDisabled: () => props.focusableWhenDisabled,
    native: () => props.nativeButton,
    composite: () => props.composite,
    tabIndex: () => props.tabindex,
  });

  const component = createMemo<ValidComponent>(
    () => props.render ?? (props.nativeButton === false ? "span" : "button"),
  );
  const elementProps = createMemo(() => omit(props, ...BUTTON_OMITTED_PROP_KEYS));
  const buttonProps = createMemo(() => getButtonProps(elementProps()));

  return (
    <Dynamic component={component()} ref={buttonRef} {...buttonProps()}>
      {props.children}
    </Dynamic>
  );
}

export interface ButtonState {
  /**
   * Whether the button should ignore user interaction.
   */
  disabled: boolean;
}

export interface ButtonProps extends Omit<ButtonPropsForUseButton<HTMLElement>, "disabled"> {
  /**
   * Whether the button should ignore user interaction.
   * @default false
   */
  disabled?: boolean;
  /**
   * Whether the button should be focusable while disabled.
   * @default false
   */
  focusableWhenDisabled?: boolean;
  /**
   * Whether the rendered element is native button.
   * @default true
   */
  nativeButton?: boolean;
  /**
   * Whether the button is inside a composite widget.
   * @default false
   */
  composite?: boolean;
  /**
   * The element or component used for rendering.
   * Example: `render="span"`.
   */
  render?: ValidComponent;
  children?: JSX.Element;
}

const BUTTON_OMITTED_PROP_KEYS = [
  "children",
  "composite",
  "disabled",
  "focusableWhenDisabled",
  "nativeButton",
  "render",
  "tabindex",
] as const satisfies ReadonlyArray<keyof ButtonProps>;
