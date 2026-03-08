import { DialogHandle } from "../dialog/store/DialogHandle";

export type PreviewCardHandle<Payload = unknown> = DialogHandle<Payload>;

/**
 * Creates a new handle to connect a PreviewCard.Root with detached PreviewCard.Trigger components.
 */
export function createPreviewCardHandle<Payload = unknown>(): PreviewCardHandle<Payload> {
  return new DialogHandle<Payload>();
}
