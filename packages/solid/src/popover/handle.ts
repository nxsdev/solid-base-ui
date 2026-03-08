import { DialogHandle } from "../dialog/store/DialogHandle";

export type PopoverHandle<Payload = unknown> = DialogHandle<Payload>;

/**
 * Creates a new handle to connect a Popover.Root with detached Popover.Trigger components.
 */
export function createPopoverHandle<Payload = unknown>(): PopoverHandle<Payload> {
  return new DialogHandle<Payload>();
}
