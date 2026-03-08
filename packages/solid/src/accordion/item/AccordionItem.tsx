import { createMemo, createSignal, type JSX, omit } from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { resolveBoolean } from "../../utils/resolveBoolean";
import {
  IndexGuessBehavior,
  useCompositeListItem,
} from "../../composite/list/useCompositeListItem";
import {
  CollapsibleRootContext,
  type CollapsibleRootContextValue,
} from "../../collapsible/root/CollapsibleRootContext";
import type { CollapsibleRootState } from "../../collapsible/root/CollapsibleRoot";
import { useAccordionRootContext } from "../root/AccordionRootContext";
import type { AccordionRootState } from "../root/AccordionRoot";
import { ResolvedChildren } from "../../internal/ResolvedChildren";
import { AccordionItemContext, type AccordionItemContextValue } from "./AccordionItemContext";
import { getAccordionStateDataAttributes } from "./stateAttributesMapping";

/**
 * Groups an accordion header with the corresponding panel.
 */
export function AccordionItem(props: AccordionItem.Props) {
  const { ref: listItemRef, index } = useCompositeListItem({
    indexGuessBehavior: IndexGuessBehavior.GuessFromOrder,
  });
  const rootContext = useAccordionRootContext();

  const generatedValue = useBaseUiId();
  const generatedPanelId = useBaseUiId();
  const generatedTriggerId = useBaseUiId();

  const value = createMemo(() => props.value ?? generatedValue);
  const disabled = createMemo(
    () => resolveBoolean(props.disabled, false) || rootContext.disabled(),
  );

  const open = createMemo(() => {
    const openValues = rootContext.value();

    return openValues.some((entry) => entry === value());
  });

  const [panelIdState, setPanelIdState] = createSignal<string | undefined>(undefined, {
    pureWrite: true,
  });
  const [transitionStatus, setTransitionStatus] = createSignal<
    CollapsibleRootState["transitionStatus"]
  >("idle", { pureWrite: true });
  const panelId = createMemo<string>(() => panelIdState() ?? generatedPanelId);

  const state = createMemo<AccordionItemState>(() => ({
    ...rootContext.state(),
    index: index(),
    open: open(),
    disabled: disabled(),
  }));

  let triggerIdState = generatedTriggerId;
  const triggerId = (): string => triggerIdState;

  const onOpenChange = (
    nextOpen: boolean,
    event: Event,
    trigger: Element | undefined,
    reason: AccordionItemChangeEventReason,
  ) => {
    const details = createChangeEventDetails(event, trigger, reason);

    props.onOpenChange?.(nextOpen, details);

    if (details.isCanceled) {
      return;
    }

    rootContext.handleValueChange(value(), nextOpen, details);
  };

  const collapsibleState = createMemo<CollapsibleRootState>(() => ({
    open: open(),
    disabled: disabled(),
    transitionStatus: transitionStatus(),
  }));

  const collapsibleContextValue: CollapsibleRootContextValue = {
    open,
    disabled,
    panelId,
    setPanelId(id) {
      setPanelIdState(() => id);
    },
    onOpenChange,
    setTransitionStatus,
    state: collapsibleState,
  };

  const accordionItemContextValue: AccordionItemContextValue = {
    defaultTriggerId: () => generatedTriggerId,
    open,
    state,
    setTriggerId(id) {
      triggerIdState = id ?? generatedTriggerId;
    },
    triggerId,
  };

  const elementProps = createMemo(() => omit(props, ...ITEM_OMITTED_PROP_KEYS));

  return (
    <CollapsibleRootContext value={collapsibleContextValue}>
      <AccordionItemContext value={accordionItemContextValue}>
        <div
          ref={(node) => {
            listItemRef(node);

            if (typeof props.ref === "function") {
              props.ref(node);
            }
          }}
          {...getAccordionStateDataAttributes({
            open: open(),
            disabled: disabled(),
            index: index(),
            orientation: rootContext.orientation(),
          })}
          {...elementProps()}
        >
          <ResolvedChildren>{props.children}</ResolvedChildren>
        </div>
      </AccordionItemContext>
    </CollapsibleRootContext>
  );
}

export interface AccordionItemState extends AccordionRootState {
  index: number;
  open: boolean;
}

export interface AccordionItemProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  value?: unknown;
  disabled?: boolean | undefined;
  onOpenChange?:
    | ((open: boolean, eventDetails: AccordionItemChangeEventDetails) => void)
    | undefined;
}

export type AccordionItemChangeEventReason = "trigger-press" | "none";
export type AccordionItemChangeEventDetails =
  BaseUIChangeEventDetails<AccordionItemChangeEventReason>;

export namespace AccordionItem {
  export type State = AccordionItemState;
  export type Props = AccordionItemProps;
  export type ChangeEventReason = AccordionItemChangeEventReason;
  export type ChangeEventDetails = AccordionItemChangeEventDetails;
}

const ITEM_OMITTED_PROP_KEYS = [
  "children",
  "value",
  "disabled",
  "onOpenChange",
  "ref",
] as const satisfies ReadonlyArray<keyof AccordionItemProps>;
