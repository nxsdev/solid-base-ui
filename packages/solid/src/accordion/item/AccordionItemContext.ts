import { createRequiredContext } from "@solid-base-ui/utils";
import type { AccordionItemState } from "./AccordionItem";

export interface AccordionItemContextValue {
  defaultTriggerId: () => string;
  open: () => boolean;
  state: () => AccordionItemState;
  setTriggerId: (id: string | undefined) => void;
  triggerId: () => string;
}

export const [AccordionItemContext, useAccordionItemContext] =
  createRequiredContext<AccordionItemContextValue>("AccordionItem");
