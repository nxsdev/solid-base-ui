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
 * Groups all parts of the preview card.
 * Doesn't render its own HTML element.
 */
export function PreviewCardRoot<Payload = unknown>(props: PreviewCardRoot.Props<Payload>) {
  return <DialogRoot<Payload> {...props} modal={props.modal ?? false} role="dialog" />;
}

export interface PreviewCardRootProps<Payload = unknown> extends Omit<
  DialogRootProps<Payload>,
  "role" | "onOpenChange" | "actionsRef" | "handle"
> {
  /**
   * Event handler called when the preview card is opened or closed.
   */
  onOpenChange?:
    | ((open: boolean, eventDetails: PreviewCardRoot.ChangeEventDetails) => void)
    | undefined;
  /**
   * A ref to imperative actions.
   * - `unmount`: when specified, the preview card won't unmount on close until called.
   * - `close`: closes the preview card imperatively.
   */
  actionsRef?: PreviewCardRootActionsRef | undefined;
  /**
   * A handle to associate the preview card with detached triggers.
   */
  handle?: DialogHandle<Payload> | undefined;
}

export type PreviewCardRootActions = DialogRootActions;
export type PreviewCardRootActionsRef = DialogRootActionsRef;
export type PreviewCardRootChangeEventReason = DialogRootChangeEventReason;
export type PreviewCardRootChangeEventDetails = DialogRootChangeEventDetails;
export type PreviewCardRootChildrenRenderProps<Payload = unknown> =
  DialogRootChildrenRenderProps<Payload>;

export namespace PreviewCardRoot {
  export type Props<Payload = unknown> = PreviewCardRootProps<Payload>;
  export type Modal = boolean | "trap-focus";
  export type Actions = PreviewCardRootActions;
  export type ActionsRef = PreviewCardRootActionsRef;
  export type ChangeEventReason = PreviewCardRootChangeEventReason;
  export type ChangeEventDetails = PreviewCardRootChangeEventDetails;
  export type ChildrenRenderProps<Payload = unknown> = PreviewCardRootChildrenRenderProps<Payload>;
}
