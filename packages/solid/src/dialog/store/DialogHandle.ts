import type { Accessor } from "solid-js";
import { createSignal } from "solid-js";
import type { DialogRoot } from "../root/DialogRoot";

/**
 * Internal contract that powers detached triggers and imperative actions.
 */
export interface DialogHandleStore<Payload = unknown> {
  popupId: () => string | undefined;
  registerTrigger(
    id: string,
    element: Accessor<HTMLElement | null>,
    payload: Accessor<Payload | undefined>,
  ): () => void;
  requestOpen(triggerId: string | null, event: Event, reason: DialogRoot.ChangeEventReason): void;
  requestClose(event: Event, reason: DialogRoot.ChangeEventReason, trigger?: Element): void;
  isOpenedByTrigger(id: string): boolean;
  isOpen: () => boolean;
  open: (triggerId: string | null) => void;
  openWithPayload: (payload: Payload) => void;
  close: () => void;
}

/**
 * A handle to control a Dialog imperatively and to associate detached triggers with it.
 */
export class DialogHandle<Payload = unknown> {
  private readonly storeAccessor: Accessor<DialogHandleStore<Payload> | null>;
  private readonly setStoreAccessor: (value: DialogHandleStore<Payload> | null) => void;

  constructor(store?: DialogHandleStore<Payload>) {
    const [storeAccessor, setStoreAccessor] = createSignal<DialogHandleStore<Payload> | null>(
      store ?? null,
    );
    this.storeAccessor = storeAccessor;
    this.setStoreAccessor = setStoreAccessor;
  }

  get store(): DialogHandleStore<Payload> | null {
    return this.storeAccessor();
  }

  set store(value: DialogHandleStore<Payload> | null) {
    this.setStoreAccessor(value);
  }

  /**
   * Opens the dialog and associates it with the given trigger id.
   */
  open(triggerId: string | null = null): void {
    this.store?.open(triggerId);
  }

  /**
   * Opens the dialog with an explicit payload and no trigger association.
   */
  openWithPayload(payload: Payload): void {
    this.store?.openWithPayload(payload);
  }

  /**
   * Closes the dialog.
   */
  close(): void {
    this.store?.close();
  }

  /**
   * Indicates whether the dialog is currently open.
   */
  get isOpen(): boolean {
    return this.store?.isOpen() ?? false;
  }
}

/**
 * Creates a new handle to connect a Dialog.Root with detached Dialog.Trigger components.
 */
export function createDialogHandle<Payload = unknown>(): DialogHandle<Payload> {
  return new DialogHandle<Payload>();
}
