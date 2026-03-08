import {
  createEffect,
  createMemo,
  createSignal,
  untrack,
  type JSX,
  type ValidComponent,
} from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { useCheckboxGroupContext } from "../../checkbox-group/CheckboxGroupContext";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { CheckboxRootContext, type CheckboxRootContextValue } from "./CheckboxRootContext";

type CheckboxInputChangeEvent = Event & {
  currentTarget: HTMLInputElement;
  target: EventTarget & Element;
};

const VISUALLY_HIDDEN_INPUT_STYLE: JSX.CSSProperties = {
  position: "absolute",
  width: "1px",
  height: "1px",
  margin: "-1px",
  padding: "0",
  border: "0",
  clip: "rect(0 0 0 0)",
  overflow: "hidden",
  "white-space": "nowrap",
};

/**
 * Represents the checkbox itself.
 */
export function CheckboxRoot(props: CheckboxRootProps) {
  const groupContext = useCheckboxGroupContext();
  const initialChecked = untrack(() => Boolean(props.checked ?? props.defaultChecked));
  const [localChecked, setLocalChecked] = createSignal(initialChecked);
  const [touched, setTouched] = createSignal(false);
  const [focused, setFocused] = createSignal(false);
  const generatedInputId = useBaseUiId();
  const checkboxValue = createMemo<string>(() => props.value ?? props.name ?? generatedInputId);

  const checked = createMemo<boolean>(() => {
    if (groupContext !== null) {
      return groupContext.value().includes(checkboxValue());
    }

    return props.checked ?? localChecked();
  });
  const indeterminate = createMemo<boolean>(() => props.indeterminate ?? false);
  const disabled = createMemo<boolean>(
    () => (props.disabled ?? false) || (groupContext?.disabled() ?? false),
  );
  const readOnly = createMemo<boolean>(() => props.readOnly ?? false);
  const required = createMemo<boolean>(() => props.required ?? false);
  const nativeButton = createMemo<boolean>(() => props.nativeButton ?? false);
  const hiddenInputId = createMemo<string>(() =>
    nativeButton() ? generatedInputId : (props.id ?? generatedInputId),
  );
  const dirty = createMemo<boolean>(() => checked() !== initialChecked);
  const filled = createMemo<boolean>(() => checked());

  let inputElement: HTMLInputElement | null = null;

  createEffect(indeterminate, (nextIndeterminate) => {
    if (inputElement !== null) {
      inputElement.indeterminate = nextIndeterminate;
    }
  });

  const updateChecked = (
    nextChecked: boolean,
    event: Event,
    trigger: Element | undefined,
  ): boolean => {
    const details = createChangeEventDetails(event, trigger);
    props.onCheckedChange?.(nextChecked, details);

    if (details.isCanceled) {
      return false;
    }

    groupContext?.setGroupValue(checkboxValue(), nextChecked, details);

    if (details.isCanceled) {
      return false;
    }

    if (props.checked === undefined && groupContext === null) {
      setLocalChecked(() => nextChecked);
    }

    return true;
  };

  const contextValue: CheckboxRootContextValue = {
    checked,
    indeterminate,
    disabled,
    readOnly,
    required,
    touched,
    dirty,
    filled,
    focused,
  };

  const handleRootClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (event) => {
    callEventHandler(props.onClick, event);

    if (event.defaultPrevented || readOnly() || disabled() || indeterminate()) {
      return;
    }

    event.preventDefault();
    updateChecked(!checked(), event, event.currentTarget);
  };

  const handleRootFocus: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = (event) => {
    callEventHandler(props.onFocus, event);
    if (!disabled()) {
      setFocused(() => true);
    }
  };

  const handleRootBlur: JSX.EventHandlerUnion<HTMLElement, FocusEvent> = (event) => {
    callEventHandler(props.onBlur, event);
    setTouched(() => true);
    setFocused(() => false);
  };

  const handleRootKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (event) => {
    callEventHandler(props.onKeyDown, event);

    if (event.defaultPrevented || disabled() || readOnly() || indeterminate()) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      event.currentTarget.click();
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
    }
  };

  const handleRootKeyUp: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (event) => {
    callEventHandler(props.onKeyUp, event);

    if (event.defaultPrevented || disabled() || readOnly() || indeterminate()) {
      return;
    }

    if (event.key === " ") {
      event.currentTarget.click();
    }
  };

  return (
    <CheckboxRootContext value={contextValue}>
      <span
        id={nativeButton() ? props.id : undefined}
        role={typeof props.role === "string" ? props.role : "checkbox"}
        tabindex={props.tabindex ?? (disabled() ? -1 : 0)}
        aria-label={props["aria-label"]}
        aria-checked={indeterminate() ? "mixed" : checked() ? "true" : "false"}
        aria-disabled={disabled() ? "true" : undefined}
        aria-readonly={readOnly() ? "true" : undefined}
        aria-required={required() ? "true" : undefined}
        data-testid={props["data-testid"]}
        data-checked={indeterminate() ? undefined : checked() ? "" : undefined}
        data-unchecked={indeterminate() ? undefined : checked() ? undefined : ""}
        data-indeterminate={indeterminate() ? "" : undefined}
        data-disabled={disabled() ? "" : undefined}
        data-readonly={readOnly() ? "" : undefined}
        data-required={required() ? "" : undefined}
        data-touched={touched() ? "" : undefined}
        data-dirty={dirty() ? "" : undefined}
        data-filled={filled() ? "" : undefined}
        data-focused={focused() ? "" : undefined}
        class={props.class}
        style={props.style}
        onClick={handleRootClick}
        onFocus={handleRootFocus}
        onBlur={handleRootBlur}
        onKeyDown={handleRootKeyDown}
        onKeyUp={handleRootKeyUp}
      >
        {props.children}
      </span>
      {props.name && !checked() && props.uncheckedValue !== undefined ? (
        <input type="hidden" name={props.name} value={props.uncheckedValue} />
      ) : null}
      <input
        type="checkbox"
        ref={(element) => {
          inputElement = element;
          props.inputRef?.(element);
        }}
        checked={checked()}
        disabled={disabled()}
        required={required()}
        id={hiddenInputId()}
        name={props.name}
        value={props.value}
        tabindex={-1}
        aria-hidden="true"
        style={VISUALLY_HIDDEN_INPUT_STYLE}
        onChange={(event: CheckboxInputChangeEvent) => {
          if (readOnly() || disabled() || indeterminate()) {
            event.preventDefault();
            event.currentTarget.checked = checked();
            return;
          }

          const accepted = updateChecked(event.currentTarget.checked, event, event.currentTarget);

          if (!accepted || props.checked !== undefined || groupContext !== null) {
            event.currentTarget.checked = checked();
          }
        }}
      />
    </CheckboxRootContext>
  );
}

export interface CheckboxRootState {
  checked: boolean;
  indeterminate: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  touched: boolean;
  dirty: boolean;
  filled: boolean;
  focused: boolean;
}

export interface CheckboxRootProps extends JSX.HTMLAttributes<HTMLElement> {
  "data-testid"?: string | undefined;
  id?: string | undefined;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  disabled?: boolean | undefined;
  indeterminate?: boolean | undefined;
  inputRef?: ((element: HTMLInputElement) => void) | undefined;
  name?: string | undefined;
  onCheckedChange?:
    | ((checked: boolean, eventDetails: CheckboxRootChangeEventDetails) => void)
    | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  uncheckedValue?: string | undefined;
  value?: string | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export type CheckboxRootChangeEventReason = "none";
export type CheckboxRootChangeEventDetails =
  BaseUIChangeEventDetails<CheckboxRootChangeEventReason>;

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
