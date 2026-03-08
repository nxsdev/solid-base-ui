import type { DialogHandle } from "../../dialog/store/DialogHandle";
import {
  DialogRoot,
  type DialogRootActions,
  type DialogRootActionsRef,
  type DialogRootChangeEventDetails,
  type DialogRootChangeEventReason,
  type DialogRootChildrenRenderProps,
  type DialogRootProps,
} from "../../dialog/root/DialogRoot";

/**
 * Groups all parts of the tooltip.
 * Doesn't render its own HTML element.
 */
export function TooltipRoot<Payload = unknown>(props: TooltipRoot.Props<Payload>) {
  return (
    <DialogRoot<Payload>
      {...props}
      modal={false}
      role="dialog"
      disablePointerDismissal={props.disablePointerDismissal ?? true}
    />
  );
}

export interface TooltipRootProps<Payload = unknown> extends Omit<
  DialogRootProps<Payload>,
  "role" | "onOpenChange" | "actionsRef" | "handle"
> {
  onOpenChange?:
    | ((open: boolean, eventDetails: TooltipRoot.ChangeEventDetails) => void)
    | undefined;
  actionsRef?: TooltipRootActionsRef | undefined;
  handle?: DialogHandle<Payload> | undefined;
}

export type TooltipRootActions = DialogRootActions;
export type TooltipRootActionsRef = DialogRootActionsRef;
export type TooltipRootChangeEventReason = DialogRootChangeEventReason;
export type TooltipRootChangeEventDetails = DialogRootChangeEventDetails;
export type TooltipRootChildrenRenderProps<Payload = unknown> =
  DialogRootChildrenRenderProps<Payload>;

export namespace TooltipRoot {
  export type Props<Payload = unknown> = TooltipRootProps<Payload>;
  export type Actions = TooltipRootActions;
  export type ActionsRef = TooltipRootActionsRef;
  export type ChangeEventReason = TooltipRootChangeEventReason;
  export type ChangeEventDetails = TooltipRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = TooltipRootChildrenRenderProps<Payload>;
}
