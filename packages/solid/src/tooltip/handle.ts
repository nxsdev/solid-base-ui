import { DialogHandle } from "../dialog/store/DialogHandle";

export type TooltipHandle<Payload = unknown> = DialogHandle<Payload>;

/**
 * Creates a new handle to connect a Tooltip.Root with detached Tooltip.Trigger components.
 */
export function createTooltipHandle<Payload = unknown>(): TooltipHandle<Payload> {
  return new DialogHandle<Payload>();
}
