import { createMemo, createSignal, untrack, type JSX, omit } from "solid-js";
import type { BaseUIChangeEventDetails, Orientation } from "../../types";
import { CompositeList } from "../../composite/list/CompositeList";
import type { ElementListRef } from "../../composite/composite";
import { useDirection } from "../../direction-provider";
import { ResolvedChildren } from "../../internal/ResolvedChildren";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { AccordionRootContext, type AccordionRootContextValue } from "./AccordionRootContext";
import { getAccordionRootStateDataAttributes } from "./stateAttributesMapping";

/**
 * Groups all parts of the accordion.
 */
export function AccordionRoot(props: AccordionRoot.Props) {
  const accordionItemRefs: ElementListRef<HTMLElement> = { current: [] };
  const initialValue = untrack<AccordionValue>(() => props.value ?? props.defaultValue ?? []);
  let uncontrolledValue = initialValue;
  const [localValue, setLocalValue] = createSignal<AccordionValue>(initialValue, {
    pureWrite: true,
  });

  const direction = createMemo(() => useDirection());
  const disabled = createMemo(() => resolveBoolean(props.disabled, false));
  const hiddenUntilFound = createMemo(() => resolveBoolean(props.hiddenUntilFound, false));
  const keepMounted = createMemo(() => resolveBoolean(props.keepMounted, false));
  const loopFocus = createMemo(() => resolveBoolean(props.loopFocus, true));
  const orientation = createMemo<Orientation>(() => props.orientation ?? "vertical");
  const multiple = createMemo(() => resolveBoolean(props.multiple, false));

  const value = createMemo<AccordionValue>(() => props.value ?? localValue());

  const state = createMemo<AccordionRootState>(() => ({
    value: value(),
    disabled: disabled(),
    orientation: orientation(),
  }));

  const handleValueChange: AccordionRootContextValue["handleValueChange"] = (
    newValue,
    nextOpen,
    eventDetails,
  ) => {
    const currentValue = props.value === undefined ? uncontrolledValue : value();
    const nextValue = getNextAccordionValue(currentValue, newValue, nextOpen, multiple());

    props.onValueChange?.(nextValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    if (props.value === undefined) {
      uncontrolledValue = nextValue;
      setLocalValue(() => nextValue);
    }
  };

  const contextValue: AccordionRootContextValue = {
    accordionItemRefs,
    direction,
    disabled,
    hiddenUntilFound,
    keepMounted,
    loopFocus,
    orientation,
    value,
    handleValueChange,
    state,
  };

  const elementProps = createMemo(() => omit(props, ...ROOT_OMITTED_PROP_KEYS));

  return (
    <AccordionRootContext value={contextValue}>
      <CompositeList elementsRef={accordionItemRefs}>
        <div
          dir={direction()}
          role="region"
          {...getAccordionRootStateDataAttributes(disabled(), orientation())}
          {...elementProps()}
        >
          <ResolvedChildren>{props.children}</ResolvedChildren>
        </div>
      </CompositeList>
    </AccordionRootContext>
  );
}

export type AccordionValue = unknown[];

export interface AccordionRootState {
  value: AccordionValue;
  disabled: boolean;
  orientation: Orientation;
}

export interface AccordionRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  value?: AccordionValue | undefined;
  defaultValue?: AccordionValue | undefined;
  disabled?: boolean | undefined;
  hiddenUntilFound?: boolean | undefined;
  keepMounted?: boolean | undefined;
  loopFocus?: boolean | undefined;
  onValueChange?:
    | ((value: AccordionValue, eventDetails: AccordionRootChangeEventDetails) => void)
    | undefined;
  multiple?: boolean | undefined;
  orientation?: Orientation | undefined;
}

export type AccordionRootChangeEventReason = "trigger-press" | "none";
export type AccordionRootChangeEventDetails =
  BaseUIChangeEventDetails<AccordionRootChangeEventReason>;

export namespace AccordionRoot {
  export type Value = AccordionValue;
  export type State = AccordionRootState;
  export type Props = AccordionRootProps;
  export type ChangeEventReason = AccordionRootChangeEventReason;
  export type ChangeEventDetails = AccordionRootChangeEventDetails;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "value",
  "defaultValue",
  "disabled",
  "hiddenUntilFound",
  "keepMounted",
  "loopFocus",
  "onValueChange",
  "multiple",
  "orientation",
] as const satisfies ReadonlyArray<keyof AccordionRootProps>;

function getNextAccordionValue(
  currentValue: AccordionValue,
  newValue: AccordionValue[number],
  nextOpen: boolean,
  multiple: boolean,
): AccordionValue {
  if (!multiple) {
    const isAlreadyOpen = currentValue.some((entry) => entry === newValue);
    return isAlreadyOpen ? [] : [newValue];
  }

  if (!nextOpen) {
    return currentValue.filter((entry) => entry !== newValue);
  }

  const alreadyOpen = currentValue.some((entry) => entry === newValue);
  return alreadyOpen ? currentValue : [...currentValue, newValue];
}
