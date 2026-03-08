import type { JSX } from "solid-js";

export interface UseFocusableWhenDisabledParameters {
  /**
   * Whether the component should be focusable when disabled.
   * When `undefined`, composite items are focusable when disabled by default.
   */
  focusableWhenDisabled?: boolean | undefined;
  /**
   * The disabled state of the component.
   */
  disabled: boolean;
  /**
   * Whether this is a composite item.
   * @default false
   */
  composite?: boolean | undefined;
  /**
   * @default 0
   */
  tabIndex?: number | undefined;
  /**
   * Whether the host element is a native button.
   * @default true
   */
  isNativeButton?: boolean | undefined;
}

export interface FocusableWhenDisabledProps<TElement extends HTMLElement = HTMLElement> {
  "aria-disabled"?: JSX.AriaAttributes["aria-disabled"] | undefined;
  disabled?: boolean | undefined;
  tabindex?: number | undefined;
  onKeyDown: JSX.EventHandlerUnion<TElement, KeyboardEvent>;
}

export interface UseFocusableWhenDisabledReturnValue<TElement extends HTMLElement = HTMLElement> {
  props: FocusableWhenDisabledProps<TElement>;
}

export function useFocusableWhenDisabled<TElement extends HTMLElement = HTMLElement>(
  parameters: UseFocusableWhenDisabledParameters,
): UseFocusableWhenDisabledReturnValue<TElement> {
  const {
    focusableWhenDisabled,
    disabled,
    composite = false,
    tabIndex = 0,
    isNativeButton = true,
  } = parameters;

  const isFocusableComposite = composite && focusableWhenDisabled !== false;
  const isNonFocusableComposite = composite && focusableWhenDisabled === false;

  const props: FocusableWhenDisabledProps<TElement> = {
    onKeyDown(event) {
      if (disabled && focusableWhenDisabled && event.key !== "Tab") {
        event.preventDefault();
      }
    },
  };

  if (!composite) {
    props.tabindex = tabIndex;

    if (!isNativeButton && disabled) {
      props.tabindex = focusableWhenDisabled ? tabIndex : -1;
    }
  }

  if (
    (isNativeButton && (focusableWhenDisabled || isFocusableComposite)) ||
    (!isNativeButton && disabled)
  ) {
    props["aria-disabled"] = disabled ? "true" : undefined;
  }

  if (isNativeButton && (!focusableWhenDisabled || isNonFocusableComposite)) {
    props.disabled = disabled;
  }

  return { props };
}
