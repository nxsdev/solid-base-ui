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
 * Groups all parts of the alert dialog.
 * Doesn't render its own HTML element.
 */
export function AlertDialogRoot<Payload = unknown>(props: AlertDialogRoot.Props<Payload>) {
  return (
    <DialogRoot<Payload>
      {...props}
      modal={true}
      role="alertdialog"
      disablePointerDismissal={true}
    />
  );
}

export interface AlertDialogRootProps<Payload = unknown> extends Omit<
  DialogRootProps<Payload>,
  "modal" | "role" | "disablePointerDismissal" | "onOpenChange" | "actionsRef" | "handle"
> {
  /**
   * Event handler called when the dialog is opened or closed.
   */
  onOpenChange?:
    | ((open: boolean, eventDetails: AlertDialogRoot.ChangeEventDetails) => void)
    | undefined;
  /**
   * A ref to imperative actions.
   * - `unmount`: when specified, the dialog won't unmount on close until called.
   * - `close`: closes the dialog imperatively.
   */
  actionsRef?: AlertDialogRootActionsRef | undefined;
  /**
   * A handle to associate the alert dialog with detached triggers.
   */
  handle?: DialogHandle<Payload> | undefined;
}

export type AlertDialogRootActions = DialogRootActions;
export type AlertDialogRootActionsRef = DialogRootActionsRef;
export type AlertDialogRootChangeEventReason = DialogRootChangeEventReason;
export type AlertDialogRootChangeEventDetails = DialogRootChangeEventDetails;
export type AlertDialogRootChildrenRenderProps<Payload = unknown> =
  DialogRootChildrenRenderProps<Payload>;

export namespace AlertDialogRoot {
  export type Props<Payload = unknown> = AlertDialogRootProps<Payload>;
  export type Actions = AlertDialogRootActions;
  export type ActionsRef = AlertDialogRootActionsRef;
  export type ChangeEventReason = AlertDialogRootChangeEventReason;
  export type ChangeEventDetails = AlertDialogRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = AlertDialogRootChildrenRenderProps<Payload>;
}
