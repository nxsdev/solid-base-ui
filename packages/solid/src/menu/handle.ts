import type { Accessor } from "solid-js";

export interface MenuHandleStore<Payload = unknown> {
  popupId: Accessor<string | undefined>;
  openedSubmenuIndex: Accessor<number | null>;
  registerTrigger(
    id: string,
    element: Accessor<HTMLElement | null>,
    payload: Accessor<Payload | undefined>,
  ): () => void;
  requestOpen(triggerId: string | null, event: Event, reason: MenuChangeEventReason): void;
  requestClose(event: Event, reason: MenuChangeEventReason, trigger?: Element): void;
  isOpenedByTrigger(id: string): boolean;
  isOpen: Accessor<boolean>;
  setActiveTriggerId(triggerId: string | null): void;
  open(triggerId: string | null): void;
  openWithPayload(payload: Payload): void;
  close(): void;
  setOpenedSubmenuIndex(index: number | null): void;
}

export class MenuHandle<Payload = unknown> {
  store: MenuHandleStore<Payload> | null;

  constructor(store?: MenuHandleStore<Payload>) {
    this.store = store ?? null;
  }

  open(triggerId: string | null = null): void {
    this.store?.open(triggerId);
  }

  openWithPayload(payload: Payload): void {
    this.store?.openWithPayload(payload);
  }

  close(): void {
    this.store?.close();
  }

  get isOpen(): boolean {
    return this.store?.isOpen() ?? false;
  }
}

export type MenuChangeEventReason =
  | "trigger-press"
  | "trigger-hover"
  | "outside-press"
  | "item-press"
  | "link-press"
  | "escape-key"
  | "close-press"
  | "focus-out"
  | "imperative-action"
  | "none";

/**
 * Creates a new handle to connect a Menu.Root with detached Menu.Trigger components.
 */
export function createMenuHandle<Payload = unknown>(): MenuHandle<Payload> {
  return new MenuHandle<Payload>();
}
