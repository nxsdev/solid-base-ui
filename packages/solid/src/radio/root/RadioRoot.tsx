import { createMemo, createSignal, untrack, type JSX, type ValidComponent } from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { useRadioGroupContext } from "../../radio-group/RadioGroupContext";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { RadioRootContext, type RadioRootContextValue } from "./RadioRootContext";

type RadioInputChangeEvent = Event & {
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
 * Represents the radio itself.
 */
export function RadioRoot(props: RadioRootProps) {
  const groupContext = useRadioGroupContext();
  const initialChecked = untrack(() => Boolean(props.checked ?? props.defaultChecked));
  const [localChecked, setLocalChecked] = createSignal(initialChecked);
  const [touched, setTouched] = createSignal(false);
  const [focused, setFocused] = createSignal(false);

  const checked = createMemo<boolean>(() => {
    if (groupContext !== null) {
      return groupContext.value() === props.value;
    }

    return props.checked ?? localChecked();
  });
  const disabled = createMemo<boolean>(
    () => (props.disabled ?? false) || (groupContext?.disabled() ?? false),
  );
  const readOnly = createMemo<boolean>(
    () => (props.readOnly ?? false) || (groupContext?.readOnly() ?? false),
  );
  const required = createMemo<boolean>(
    () => (props.required ?? false) || (groupContext?.required() ?? false),
  );
  const nativeButton = createMemo<boolean>(() => props.nativeButton ?? false);
  const resolvedName = createMemo<string | undefined>(() => groupContext?.name() ?? props.name);
  const generatedInputId = useBaseUiId();
  const hiddenInputId = createMemo<string>(() =>
    nativeButton() ? generatedInputId : (props.id ?? generatedInputId),
  );
  const dirty = createMemo<boolean>(() => checked() !== initialChecked);
  const filled = createMemo<boolean>(() => checked());

  const updateChecked = (event: Event, trigger: Element | undefined): boolean => {
    const details = createChangeEventDetails(event, trigger);
    groupContext?.setValue(props.value, details);
    props.onCheckedChange?.(true, details);

    if (details.isCanceled) {
      return false;
    }

    if (groupContext === null && props.checked === undefined) {
      setLocalChecked(() => true);
    }

    return true;
  };

  const contextValue: RadioRootContextValue = {
    checked,
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

    if (event.defaultPrevented || disabled() || readOnly() || checked()) {
      return;
    }

    event.preventDefault();
    updateChecked(event, event.currentTarget);
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

    if (event.defaultPrevented || disabled() || readOnly()) {
      return;
    }

    if (event.key === "Enter") {
      event.preventDefault();
      return;
    }

    if (event.key === " ") {
      event.preventDefault();
    }
  };

  const handleRootKeyUp: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (event) => {
    callEventHandler(props.onKeyUp, event);

    if (event.defaultPrevented || disabled() || readOnly() || checked()) {
      return;
    }

    if (event.key === " ") {
      event.currentTarget.click();
    }
  };

  return (
    <RadioRootContext value={contextValue}>
      <span
        id={nativeButton() ? props.id : undefined}
        role={typeof props.role === "string" ? props.role : "radio"}
        tabindex={props.tabindex ?? (disabled() ? -1 : 0)}
        aria-label={props["aria-label"]}
        aria-checked={checked() ? "true" : "false"}
        aria-disabled={disabled() ? "true" : undefined}
        aria-readonly={readOnly() ? "true" : undefined}
        aria-required={required() ? "true" : undefined}
        data-testid={props["data-testid"]}
        data-checked={checked() ? "" : undefined}
        data-unchecked={checked() ? undefined : ""}
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
      <input
        type="radio"
        ref={(element) => {
          props.inputRef?.(element);
        }}
        checked={checked()}
        disabled={disabled()}
        required={required()}
        id={hiddenInputId()}
        name={resolvedName()}
        value={props.value}
        tabindex={-1}
        aria-hidden="true"
        style={VISUALLY_HIDDEN_INPUT_STYLE}
        onChange={(event: RadioInputChangeEvent) => {
          if (disabled() || readOnly()) {
            event.preventDefault();
            event.currentTarget.checked = checked();
            return;
          }

          const accepted = updateChecked(event, event.currentTarget);

          if (!accepted || props.checked !== undefined || groupContext !== null) {
            event.currentTarget.checked = checked();
          }
        }}
      />
    </RadioRootContext>
  );
}

export interface RadioRootState {
  checked: boolean;
  disabled: boolean;
  readOnly: boolean;
  required: boolean;
  touched: boolean;
  dirty: boolean;
  filled: boolean;
  focused: boolean;
}

export interface RadioRootProps extends JSX.HTMLAttributes<HTMLElement> {
  "data-testid"?: string | undefined;
  id?: string | undefined;
  value: string;
  checked?: boolean | undefined;
  defaultChecked?: boolean | undefined;
  disabled?: boolean | undefined;
  readOnly?: boolean | undefined;
  required?: boolean | undefined;
  name?: string | undefined;
  inputRef?: ((element: HTMLInputElement) => void) | undefined;
  onCheckedChange?:
    | ((checked: boolean, eventDetails: RadioRootChangeEventDetails) => void)
    | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export type RadioRootChangeEventReason = "none";
export type RadioRootChangeEventDetails = BaseUIChangeEventDetails<RadioRootChangeEventReason>;

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
