import { createRequiredContext } from "@solid-base-ui/utils";
import type {
  CollapsibleRootChangeEventDetails,
  CollapsibleRootState,
  CollapsibleTransitionStatus,
} from "./CollapsibleRoot";

export interface CollapsibleRootContextValue {
  open: () => boolean;
  disabled: () => boolean;
  panelId: () => string;
  setPanelId: (id: string | undefined) => void;
  onOpenChange: (
    open: boolean,
    event: Event,
    trigger: Element | undefined,
    reason: CollapsibleRootChangeEventDetails["reason"],
  ) => void;
  setTransitionStatus: (status: CollapsibleTransitionStatus) => void;
  state: () => CollapsibleRootState;
}

export const [CollapsibleRootContext, useCollapsibleRootContext] =
  createRequiredContext<CollapsibleRootContextValue>("CollapsibleRoot");
