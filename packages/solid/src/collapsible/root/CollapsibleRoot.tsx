import { createMemo, createSignal, untrack, type JSX } from "solid-js";
import type { BaseUIChangeEventDetails } from "../../types";
import { createChangeEventDetails } from "../../utils/createChangeEventDetails";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { CollapsibleRootContext, type CollapsibleRootContextValue } from "./CollapsibleRootContext";
import { getCollapsibleOpenDataAttributes } from "./stateAttributesMapping";

/**
 * Groups all parts of the collapsible.
 */
export function CollapsibleRoot(props: CollapsibleRoot.Props) {
  const initialOpen = untrack(() => props.open ?? props.defaultOpen ?? false);
  const [localOpen, setLocalOpen] = createSignal(initialOpen);
  const defaultPanelId = useBaseUiId();
  const [panelIdState, setPanelIdState] = createSignal<string | undefined>(undefined, {
    pureWrite: true,
  });
  const [transitionStatus, setTransitionStatus] = createSignal<CollapsibleTransitionStatus>(
    "idle",
    { pureWrite: true },
  );

  const open = createMemo<boolean>(() => props.open ?? localOpen());
  const disabled = createMemo<boolean>(() => props.disabled ?? false);
  const panelId = createMemo<string>(() => panelIdState() ?? defaultPanelId);

  const state = createMemo<CollapsibleRootState>(() => ({
    open: open(),
    disabled: disabled(),
    transitionStatus: transitionStatus(),
  }));

  const onOpenChange = (
    nextOpen: boolean,
    event: Event,
    trigger: Element | undefined,
    reason: CollapsibleRootChangeEventReason,
  ): void => {
    const details = createChangeEventDetails(event, trigger, reason);
    props.onOpenChange?.(nextOpen, details);

    if (details.isCanceled) {
      return;
    }

    if (props.open === undefined) {
      setLocalOpen(() => nextOpen);
    }
  };

  const contextValue: CollapsibleRootContextValue = {
    open,
    disabled,
    panelId,
    setPanelId(id) {
      setPanelIdState(() => id);
    },
    onOpenChange,
    setTransitionStatus,
    state,
  };

  return (
    <CollapsibleRootContext value={contextValue}>
      <div
        class={props.class}
        style={props.style}
        data-testid={props["data-testid"]}
        data-disabled={disabled() ? "" : undefined}
        {...getCollapsibleOpenDataAttributes(open(), transitionStatus())}
      >
        {props.children}
      </div>
    </CollapsibleRootContext>
  );
}

export type CollapsibleTransitionStatus = "idle" | "starting" | "ending";

export interface CollapsibleRootState {
  open: boolean;
  disabled: boolean;
  transitionStatus: CollapsibleTransitionStatus;
}

export interface CollapsibleRootProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  open?: boolean | undefined;
  defaultOpen?: boolean | undefined;
  onOpenChange?:
    | ((open: boolean, eventDetails: CollapsibleRootChangeEventDetails) => void)
    | undefined;
  disabled?: boolean | undefined;
}

export type CollapsibleRootChangeEventReason = "trigger-press" | "none";
export type CollapsibleRootChangeEventDetails =
  BaseUIChangeEventDetails<CollapsibleRootChangeEventReason>;

export namespace CollapsibleRoot {
  export type State = CollapsibleRootState;
  export type Props = CollapsibleRootProps;
  export type ChangeEventReason = CollapsibleRootChangeEventReason;
  export type ChangeEventDetails = CollapsibleRootChangeEventDetails;
}
