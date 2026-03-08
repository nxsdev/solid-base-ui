import { createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { Dynamic } from "@solidjs/web";
import {
  ARROW_DOWN,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  END,
  HOME,
  stopEvent,
} from "../../composite/composite";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { ResolvedChildren } from "../../internal/ResolvedChildren";
import { useCollapsibleRootContext } from "../../collapsible/root/CollapsibleRootContext";
import { getCollapsibleTriggerOpenDataAttributes } from "../../collapsible/root/stateAttributesMapping";
import { useAccordionRootContext } from "../root/AccordionRootContext";
import type { AccordionItemState } from "../item/AccordionItem";
import { useAccordionItemContext } from "../item/AccordionItemContext";

const SUPPORTED_KEYS = new Set([ARROW_DOWN, ARROW_UP, ARROW_RIGHT, ARROW_LEFT, HOME, END]);

/**
 * A button that opens and closes the corresponding panel.
 */
export function AccordionTrigger(props: AccordionTrigger.Props) {
  const collapsibleContext = useCollapsibleRootContext();
  const rootContext = useAccordionRootContext();
  const itemContext = useAccordionItemContext();

  const nativeButton = createMemo(() => resolveBoolean(props.nativeButton, true));
  const disabled = createMemo(() => resolveBoolean(props.disabled, collapsibleContext.disabled()));
  const resolvedId = (): string =>
    typeof props.id === "string" ? props.id : itemContext.defaultTriggerId();

  onCleanup(() => {
    itemContext.setTriggerId(undefined);
  });

  const toggle = (event: Event, trigger: Element) => {
    collapsibleContext.onOpenChange(!collapsibleContext.open(), event, trigger, "trigger-press");
  };

  const handleClick: JSX.EventHandlerUnion<HTMLElement, MouseEvent> = (event) => {
    callEventHandler(props.onClick, event);

    if (event.defaultPrevented || disabled()) {
      return;
    }

    toggle(event, event.currentTarget);
  };

  const handleKeyDown: JSX.EventHandlerUnion<HTMLElement, KeyboardEvent> = (event) => {
    callEventHandler(props.onKeyDown, event);

    if (event.defaultPrevented) {
      return;
    }

    if (!nativeButton() && !disabled()) {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        event.currentTarget.click();
        return;
      }
    }

    if (disabled()) {
      return;
    }

    if (!SUPPORTED_KEYS.has(event.key)) {
      return;
    }

    stopEvent(event);

    const triggers = getActiveTriggers(rootContext.accordionItemRefs);
    const thisIndex = triggers.indexOf(event.currentTarget);

    if (thisIndex === -1) {
      return;
    }

    const lastIndex = triggers.length - 1;
    let nextIndex = -1;

    const isHorizontal = rootContext.orientation() === "horizontal";
    const isRtl = rootContext.direction() === "rtl";

    const toNext = () => {
      if (rootContext.loopFocus()) {
        nextIndex = thisIndex + 1 > lastIndex ? 0 : thisIndex + 1;
      } else {
        nextIndex = Math.min(thisIndex + 1, lastIndex);
      }
    };

    const toPrevious = () => {
      if (rootContext.loopFocus()) {
        nextIndex = thisIndex === 0 ? lastIndex : thisIndex - 1;
      } else {
        nextIndex = Math.max(thisIndex - 1, 0);
      }
    };

    switch (event.key) {
      case ARROW_DOWN:
        if (!isHorizontal) {
          toNext();
        }
        break;
      case ARROW_UP:
        if (!isHorizontal) {
          toPrevious();
        }
        break;
      case ARROW_RIGHT:
        if (isHorizontal) {
          if (isRtl) {
            toPrevious();
          } else {
            toNext();
          }
        }
        break;
      case ARROW_LEFT:
        if (isHorizontal) {
          if (isRtl) {
            toNext();
          } else {
            toPrevious();
          }
        }
        break;
      case HOME:
        nextIndex = 0;
        break;
      case END:
        nextIndex = lastIndex;
        break;
      default:
        break;
    }

    if (nextIndex > -1) {
      triggers[nextIndex]?.focus();
    }
  };

  return (
    <Dynamic
      component={props.render ?? (nativeButton() ? "button" : "span")}
      id={resolvedId()}
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
      type={nativeButton() ? (typeof props.type === "string" ? props.type : "button") : undefined}
      role={nativeButton() ? props.role : (props.role ?? "button")}
      tabindex={nativeButton() ? props.tabindex : (props.tabindex ?? 0)}
      disabled={nativeButton() && disabled() ? true : undefined}
      aria-disabled={disabled() ? "true" : props["aria-disabled"]}
      aria-controls={collapsibleContext.open() ? collapsibleContext.panelId() : undefined}
      aria-expanded={collapsibleContext.open() ? "true" : "false"}
      data-disabled={disabled() ? "" : undefined}
      {...getCollapsibleTriggerOpenDataAttributes(collapsibleContext.open())}
      ref={(element: HTMLElement | null) => {
        if (element !== null) {
          itemContext.setTriggerId(element.id);
        }

        if (element !== null && typeof props.ref === "function") {
          props.ref(element);
        }
      }}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      onKeyUp={(
        event: KeyboardEvent & { currentTarget: HTMLElement; target: EventTarget & Element },
      ) => {
        callEventHandler(props.onKeyUp, event);
      }}
      onFocus={props.onFocus}
      onBlur={props.onBlur}
      onMouseDown={props.onMouseDown}
      onMouseUp={props.onMouseUp}
      onPointerDown={props.onPointerDown}
      onPointerUp={props.onPointerUp}
      onPointerMove={props.onPointerMove}
      onPointerEnter={props.onPointerEnter}
      onPointerLeave={props.onPointerLeave}
    >
      <ResolvedChildren>{props.children}</ResolvedChildren>
    </Dynamic>
  );
}

export interface AccordionTriggerProps extends JSX.HTMLAttributes<HTMLElement> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
  nativeButton?: boolean | undefined;
  type?: "button" | "submit" | "reset" | "menu" | undefined;
  render?: ValidComponent | undefined;
}

export interface AccordionTriggerState extends AccordionItemState {}

export namespace AccordionTrigger {
  export type Props = AccordionTriggerProps;
  export type State = AccordionTriggerState;
}

function getActiveTriggers(accordionItemRefs: {
  current: Array<HTMLElement | null>;
}): HTMLElement[] {
  const triggers: HTMLElement[] = [];

  accordionItemRefs.current.forEach((item) => {
    if (item === null || isElementDisabled(item)) {
      return;
    }

    const trigger = item.querySelector<HTMLElement>('[type="button"], [role="button"]');

    if (trigger !== null && !isElementDisabled(trigger)) {
      triggers.push(trigger);
    }
  });

  return triggers;
}

function isElementDisabled(element: Element): boolean {
  if (element.hasAttribute("disabled")) {
    return true;
  }

  const ariaDisabled = element.getAttribute("aria-disabled");
  if (ariaDisabled === "true") {
    return true;
  }

  return element.hasAttribute("data-disabled");
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
