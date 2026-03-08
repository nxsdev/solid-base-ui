import { createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import { Dynamic } from "../../internal/Dynamic";
import type { CollapsibleRootState } from "../root/CollapsibleRoot";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext";
import { getCollapsibleTriggerOpenDataAttributes } from "../root/stateAttributesMapping";
import { useButton } from "../../use-button";

/**
 * A button that opens and closes the collapsible panel.
 */
export function CollapsibleTrigger(props: CollapsibleTrigger.Props) {
  const context = useCollapsibleRootContext();
  const nativeButton = createMemo<boolean>(() => props.nativeButton ?? true);
  const disabled = createMemo<boolean>(() => resolveDisabled(props.disabled, context.disabled()));
  const { getButtonProps, buttonRef } = useButton<HTMLButtonElement>({
    disabled,
    focusableWhenDisabled: true,
    native: nativeButton,
  });
  const component = createMemo<ValidComponent>(() => props.render ?? "button");
  const buttonProps = createMemo(() =>
    getButtonProps(
      omit(props, ...TRIGGER_OMITTED_PROP_KEYS) as Parameters<typeof getButtonProps>[0],
    ),
  );

  return (
    <Dynamic
      component={component()}
      aria-controls={context.open() ? context.panelId() : undefined}
      aria-expanded={context.open() ? "true" : "false"}
      ref={(node: HTMLButtonElement) => {
        buttonRef(node);

        if (typeof props.ref === "function") {
          props.ref(node);
        }
      }}
      {...getCollapsibleTriggerOpenDataAttributes(context.open(), context.state().transitionStatus)}
      {...buttonProps()}
      onClick={(event: MouseEvent & { currentTarget: HTMLButtonElement; target: Element }) => {
        callEventHandler(buttonProps().onClick, event);

        if (event.defaultPrevented || resolveDisabled(buttonProps().disabled, false)) {
          return;
        }

        context.onOpenChange(!context.open(), event, event.currentTarget, "trigger-press");
      }}
    >
      {props.children}
    </Dynamic>
  );
}

export interface CollapsibleTriggerProps extends JSX.ButtonHTMLAttributes<HTMLButtonElement> {
  "data-testid"?: string | undefined;
  nativeButton?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export interface CollapsibleTriggerState extends CollapsibleRootState {}

export namespace CollapsibleTrigger {
  export type Props = CollapsibleTriggerProps;
  export type State = CollapsibleTriggerState;
}

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

function resolveDisabled(value: boolean | string | undefined, fallback: boolean): boolean {
  if (value === undefined) {
    return fallback;
  }

  return value === true || value === "";
}

const TRIGGER_OMITTED_PROP_KEYS = [
  "children",
  "nativeButton",
  "ref",
  "render",
] as const satisfies ReadonlyArray<keyof CollapsibleTriggerProps>;
