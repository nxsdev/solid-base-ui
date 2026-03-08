import type { Orientation } from "../../types";
import { AccordionItemDataAttributes } from "./AccordionItemDataAttributes";

export type AccordionTransitionStatus = "idle" | "starting" | "ending";

export interface AccordionStateAttributesInput {
  open: boolean;
  disabled: boolean;
  index: number;
  orientation: Orientation;
  transitionStatus?: AccordionTransitionStatus | undefined;
}

export interface AccordionStateDataAttributes {
  "data-open"?: "" | undefined;
  "data-disabled"?: "" | undefined;
  "data-index"?: string | undefined;
  "data-orientation"?: Orientation | undefined;
  "data-starting-style"?: "" | undefined;
  "data-ending-style"?: "" | undefined;
}

export function getAccordionStateDataAttributes(
  state: AccordionStateAttributesInput,
): AccordionStateDataAttributes {
  return {
    [AccordionItemDataAttributes.open]: state.open ? "" : undefined,
    [AccordionItemDataAttributes.disabled]: state.disabled ? "" : undefined,
    [AccordionItemDataAttributes.index]: String(state.index),
    [AccordionItemDataAttributes.orientation]: state.orientation,
    [AccordionItemDataAttributes.startingStyle]:
      state.transitionStatus === "starting" ? "" : undefined,
    [AccordionItemDataAttributes.endingStyle]: state.transitionStatus === "ending" ? "" : undefined,
  };
}
