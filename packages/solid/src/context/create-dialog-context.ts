import { createSignal } from "solid-js";
import { createRequiredContext } from "@solid-base-ui/utils";

export type DialogContextValue = {
  open: () => boolean;
  setOpen: (next: boolean) => void;
};

export const [DialogContext, useDialogContext] =
  createRequiredContext<DialogContextValue>("Dialog");

export function createDialogContextValue(initialOpen = false): DialogContextValue {
  const [open, setOpenSignal] = createSignal(initialOpen);

  const setOpen = (next: boolean): void => {
    setOpenSignal(() => next);
  };

  return {
    open,
    setOpen,
  };
}
