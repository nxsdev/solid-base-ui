import type { JSX } from "solid-js";
import { useFocusableWhenDisabled } from "../use-focusable-when-disabled/useFocusableWhenDisabled";

type BoolParam = boolean | undefined | (() => boolean | undefined);
type NumberParam = number | string | undefined | (() => number | string | undefined);
type ButtonType = "button" | "submit" | "reset" | "menu";

type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};

export interface UseButtonParameters {
  /**
   * Whether the component should ignore user interaction.
   * @default false
   */
  disabled?: BoolParam;
  /**
   * Whether the button may receive focus even when disabled.
   * @default false
   */
  focusableWhenDisabled?: BoolParam;
  /**
   * @default 0
   */
  tabIndex?: NumberParam;
  /**
   * Whether the rendered element is a native button.
   * @default true
   */
  native?: BoolParam;
  /**
   * Whether the button is inside a composite widget.
   * @default false
   */
  composite?: BoolParam;
}

type SolidEvent<TElement extends HTMLElement, TEvent extends Event> = TEvent & {
  currentTarget: TElement;
  target: EventTarget & Element;
};

export type ButtonPropsForUseButton<TElement extends HTMLElement = HTMLElement> =
  JSX.HTMLAttributes<TElement> &
    DataAttributes & {
      role?: string | undefined;
      tabindex?: number | string | undefined;
      type?: ButtonType | undefined;
      disabled?: boolean | undefined;
      "aria-disabled"?: JSX.AriaAttributes["aria-disabled"] | undefined;
      children?: JSX.Element | undefined;
      ref?: JSX.Ref<TElement> | undefined;
      /**
       * Solid internal flag injected into component props.
       * Ignored by `getButtonProps`.
       */
      internal?: boolean | undefined;
    };

export interface UseButtonReturnValue<TElement extends HTMLElement = HTMLElement> {
  getButtonProps: (
    externalProps?: ButtonPropsForUseButton<TElement>,
  ) => ButtonPropsForUseButton<TElement>;
  buttonRef: (element: HTMLElement | null) => void;
}

export function useButton<TElement extends HTMLElement = HTMLElement>(
  parameters: UseButtonParameters = {},
): UseButtonReturnValue<TElement> {
  let warnedNativeMismatch = false;
  let warnedNonNativeMismatch = false;

  const buttonRef = (element: HTMLElement | null): void => {
    if (process.env.NODE_ENV === "production" || element === null) {
      return;
    }

    const isNativeButton = readBool(parameters.native, true);
    const elementIsButton = isButtonElement(element);

    if (isNativeButton && !elementIsButton && !warnedNativeMismatch) {
      warnedNativeMismatch = true;
      console.error(
        "Base UI: A component that acts as a button expected a native <button> because " +
          "the `nativeButton` prop is true. Rendering a non-<button> removes native button " +
          "semantics, which can impact forms and accessibility. Use a real <button> in the " +
          "`render` prop, or set `nativeButton` to `false`.",
      );
      return;
    }

    if (!isNativeButton && elementIsButton && !warnedNonNativeMismatch) {
      warnedNonNativeMismatch = true;
      console.error(
        "Base UI: A component that acts as a button expected a non-<button> because " +
          "the `nativeButton` prop is false. Rendering a <button> keeps native behavior while " +
          "Base UI applies non-native attributes and handlers, which can add unintended extra " +
          "attributes (such as `role` or `aria-disabled`). Use a non-<button> in the `render` " +
          "prop, or set `nativeButton` to `true`.",
      );
    }
  };

  const getButtonProps = (
    externalProps: ButtonPropsForUseButton<TElement> = {},
  ): ButtonPropsForUseButton<TElement> => {
    const disabled = readBool(parameters.disabled, false);
    const focusableWhenDisabled = readBool(parameters.focusableWhenDisabled, false);
    const tabIndexParam = readNumber(parameters.tabIndex, 0);
    const isNativeButton = readBool(parameters.native, true);
    const composite = readBool(parameters.composite, false);

    const { props: focusableWhenDisabledProps } = useFocusableWhenDisabled<TElement>({
      focusableWhenDisabled,
      disabled,
      composite,
      tabIndex: tabIndexParam,
      isNativeButton,
    });

    const {
      onClick: externalOnClick,
      onMouseDown: externalOnMouseDown,
      onKeyDown: externalOnKeyDown,
      onKeyUp: externalOnKeyUp,
      onPointerDown: externalOnPointerDown,
      role: externalRole,
      tabindex: externalTabIndex,
      disabled: externalDisabled,
      type: externalType,
      "aria-disabled": externalAriaDisabled,
      children: _children,
      internal: _internal,
      ref: _externalRef,
      ...otherExternalProps
    } = externalProps;
    void _children;
    void _internal;
    void _externalRef;

    const isFocusableComposite = composite && focusableWhenDisabled !== false;
    const shouldForceEnabledNativeButton =
      isNativeButton && disabled && (focusableWhenDisabled || isFocusableComposite);

    const resolvedDisabledAttribute = shouldForceEnabledNativeButton
      ? undefined
      : (externalDisabled ?? focusableWhenDisabledProps.disabled);
    const resolvedRole = !isNativeButton ? (externalRole ?? "button") : externalRole;
    const resolvedTabIndex = externalTabIndex ?? focusableWhenDisabledProps.tabindex;
    const resolvedType = externalType ?? (isNativeButton ? "button" : undefined);
    const resolvedAriaDisabled =
      externalAriaDisabled ?? focusableWhenDisabledProps["aria-disabled"];

    return {
      ...otherExternalProps,
      role: resolvedRole,
      tabindex: resolvedTabIndex,
      type: resolvedType,
      disabled: resolvedDisabledAttribute,
      "aria-disabled": resolvedAriaDisabled,
      "data-disabled": disabled ? "" : undefined,
      onClick(event) {
        if (disabled) {
          event.preventDefault();
          return;
        }
        callEventHandler(externalOnClick, event);
      },
      onMouseDown(event) {
        if (disabled) {
          return;
        }
        callEventHandler(externalOnMouseDown, event);
      },
      onPointerDown(event) {
        if (disabled) {
          event.preventDefault();
          return;
        }
        callEventHandler(externalOnPointerDown, event);
      },
      onKeyDown(event) {
        callEventHandler(focusableWhenDisabledProps.onKeyDown, event);

        if (disabled) {
          return;
        }

        callEventHandler(externalOnKeyDown, event);

        const isCurrentTarget = event.target === event.currentTarget;
        const currentTarget = event.currentTarget;
        const currentTargetIsButton = isButtonElement(currentTarget);
        const currentTargetIsLink = !isNativeButton && isValidLinkElement(currentTarget);
        const shouldClick =
          isCurrentTarget && (isNativeButton ? currentTargetIsButton : !currentTargetIsLink);
        const isEnterKey = event.key === "Enter";
        const isSpaceKey = event.key === " ";
        const role = currentTarget.getAttribute("role");
        const isTextNavigationRole =
          role?.startsWith("menuitem") === true || role === "option" || role === "gridcell";

        if (isCurrentTarget && composite && isSpaceKey) {
          if (event.defaultPrevented && isTextNavigationRole) {
            return;
          }

          event.preventDefault();

          if (currentTargetIsLink || (isNativeButton && currentTargetIsButton) || shouldClick) {
            currentTarget.click();
          }

          return;
        }

        if (shouldClick) {
          if (!isNativeButton && (isSpaceKey || isEnterKey)) {
            event.preventDefault();
          }

          if (!isNativeButton && isEnterKey) {
            currentTarget.click();
          }
        }
      },
      onKeyUp(event) {
        if (disabled) {
          return;
        }

        callEventHandler(externalOnKeyUp, event);

        if (
          event.target === event.currentTarget &&
          isNativeButton &&
          composite &&
          isButtonElement(event.currentTarget) &&
          event.key === " "
        ) {
          event.preventDefault();
          return;
        }

        if (
          event.target === event.currentTarget &&
          !isNativeButton &&
          !composite &&
          event.key === " "
        ) {
          event.currentTarget.click();
        }
      },
    };
  };

  return {
    getButtonProps,
    buttonRef,
  };
}

function callEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: SolidEvent<TElement, TEvent>,
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

function readBool(value: BoolParam, fallback: boolean): boolean {
  if (typeof value === "function") {
    return value() ?? fallback;
  }
  return value ?? fallback;
}

function readNumber(value: NumberParam, fallback: number): number {
  const normalize = (raw: number | string | undefined): number => {
    if (typeof raw === "number") {
      return raw;
    }
    if (typeof raw === "string") {
      const parsed = Number(raw);
      return Number.isNaN(parsed) ? fallback : parsed;
    }
    return fallback;
  };

  if (typeof value === "function") {
    return normalize(value());
  }
  return normalize(value);
}

function isButtonElement(element: HTMLElement | null): element is HTMLButtonElement {
  return element?.tagName === "BUTTON";
}

function isValidLinkElement(element: HTMLElement): element is HTMLAnchorElement {
  return element instanceof HTMLAnchorElement && element.href.length > 0;
}
