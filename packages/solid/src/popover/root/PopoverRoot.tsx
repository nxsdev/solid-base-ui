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
 * Groups all parts of the popover.
 * Doesn't render its own HTML element.
 */
export function PopoverRoot<Payload = unknown>(props: PopoverRoot.Props<Payload>) {
  return <DialogRoot<Payload> {...props} modal={props.modal ?? false} role="dialog" />;
}

export interface PopoverRootProps<Payload = unknown> extends Omit<
  DialogRootProps<Payload>,
  "role" | "onOpenChange" | "actionsRef" | "handle"
> {
  /**
   * Event handler called when the popover is opened or closed.
   */
  onOpenChange?:
    | ((open: boolean, eventDetails: PopoverRoot.ChangeEventDetails) => void)
    | undefined;
  /**
   * A ref to imperative actions.
   * - `unmount`: when specified, the popover won't unmount on close until called.
   * - `close`: closes the popover imperatively.
   */
  actionsRef?: PopoverRootActionsRef | undefined;
  /**
   * A handle to associate the popover with detached triggers.
   */
  handle?: DialogHandle<Payload> | undefined;
}

export type PopoverRootActions = DialogRootActions;
export type PopoverRootActionsRef = DialogRootActionsRef;
export type PopoverRootChangeEventReason = DialogRootChangeEventReason;
export type PopoverRootChangeEventDetails = DialogRootChangeEventDetails;
export type PopoverRootChildrenRenderProps<Payload = unknown> =
  DialogRootChildrenRenderProps<Payload>;

export namespace PopoverRoot {
  export type Props<Payload = unknown> = PopoverRootProps<Payload>;
  export type Modal = boolean | "trap-focus";
  export type Actions = PopoverRootActions;
  export type ActionsRef = PopoverRootActionsRef;
  export type ChangeEventReason = PopoverRootChangeEventReason;
  export type ChangeEventDetails = PopoverRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = PopoverRootChildrenRenderProps<Payload>;
}
