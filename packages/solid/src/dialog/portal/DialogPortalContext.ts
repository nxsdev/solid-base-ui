import { createRequiredContext } from "@solid-base-ui/utils";

export const [DialogPortalContext, useDialogPortalContext] =
  createRequiredContext<boolean>("Dialog.Portal");
