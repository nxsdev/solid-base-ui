import { createRequiredContext } from "@solid-base-ui/utils";
import type { ElementListRef } from "../../composite/composite";
import type { TextDirection } from "../../direction-provider";
import type { Orientation } from "../../types";
import type {
  AccordionRootChangeEventDetails,
  AccordionRootState,
  AccordionValue,
} from "./AccordionRoot";

export interface AccordionRootContextValue {
  accordionItemRefs: ElementListRef<HTMLElement>;
  direction: () => TextDirection;
  disabled: () => boolean;
  hiddenUntilFound: () => boolean;
  keepMounted: () => boolean;
  loopFocus: () => boolean;
  orientation: () => Orientation;
  value: () => AccordionValue;
  handleValueChange: (
    newValue: AccordionValue[number],
    nextOpen: boolean,
    eventDetails: AccordionRootChangeEventDetails,
  ) => void;
  state: () => AccordionRootState;
}

export const [AccordionRootContext, useAccordionRootContext] =
  createRequiredContext<AccordionRootContextValue>("AccordionRoot");
