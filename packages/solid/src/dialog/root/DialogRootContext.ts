import { createContext, useContext, type Accessor } from "solid-js";
import type { DialogRoot } from "./DialogRoot";

export type DialogTriggerRegistration<Payload = unknown> = {
  element: Accessor<HTMLElement | null>;
  payload: Accessor<Payload | undefined>;
};

export interface DialogRootContextValue<Payload = unknown> {
  open: Accessor<boolean>;
  mounted: Accessor<boolean>;
  modal: Accessor<DialogRoot.Modal>;
  role: Accessor<DialogRoot.Role>;
  disablePointerDismissal: Accessor<boolean>;
  nested: Accessor<boolean>;
  nestedOpenDialogCount: Accessor<number>;
  activeTriggerId: Accessor<string | null>;
  activeTriggerElement: Accessor<HTMLElement | undefined>;
  payload: Accessor<Payload | undefined>;
  popupId: Accessor<string | undefined>;
  titleElementId: Accessor<string | undefined>;
  descriptionElementId: Accessor<string | undefined>;
  popupElement: Accessor<HTMLElement | null>;
  setPopupId(id: string | undefined): void;
  setTitleElementId(id: string | undefined): void;
  setDescriptionElementId(id: string | undefined): void;
  setPopupElement(element: HTMLElement | null): void;
  setViewportElement(element: HTMLElement | null): void;
  setBackdropElement(element: HTMLDivElement | null): void;
  setInternalBackdropElement(element: HTMLDivElement | null): void;
  setInitialFocusResolver(resolver: (() => HTMLElement | null | undefined) | null): void;
  setFinalFocusResolver(resolver: (() => HTMLElement | null | undefined) | null): void;
  registerTrigger(
    id: string,
    element: Accessor<HTMLElement | null>,
    payload: Accessor<Payload | undefined>,
  ): () => void;
  requestOpen(triggerId: string | null, event: Event, reason: DialogRoot.ChangeEventReason): void;
  requestClose(event: Event, reason: DialogRoot.ChangeEventReason, trigger?: Element): void;
  openWithPayload(payload: Payload): void;
  isOpenedByTrigger(id: string): boolean;
  registerOpenChild(): void;
  unregisterOpenChild(): void;
  closeFromAction(): void;
  unmountFromAction(): void;
}

export const DialogRootContext = createContext<DialogRootContextValue | null>(null);

export function useDialogRootContext(optional: true): DialogRootContextValue | null;
export function useDialogRootContext(optional?: false): DialogRootContextValue;
export function useDialogRootContext(optional = false) {
  const context = useContext(DialogRootContext);

  if (context === null && !optional) {
    throw new Error(
      "DialogRoot context is missing. Dialog parts must be placed within <Dialog.Root>.",
    );
  }

  return context;
}
