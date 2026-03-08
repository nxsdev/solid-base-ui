import { createDialogHandle, type DialogHandle } from "../dialog/store/DialogHandle";

export function createAlertDialogHandle<Payload = unknown>(): DialogHandle<Payload> {
  return createDialogHandle<Payload>();
}
