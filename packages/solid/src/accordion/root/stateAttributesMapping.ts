import type { Orientation } from "../../types";
import { AccordionRootDataAttributes } from "./AccordionRootDataAttributes";

export interface AccordionRootStateDataAttributes {
  "data-disabled"?: "" | undefined;
  "data-orientation"?: Orientation | undefined;
}

export function getAccordionRootStateDataAttributes(
  disabled: boolean,
  orientation: Orientation,
): AccordionRootStateDataAttributes {
  return {
    [AccordionRootDataAttributes.disabled]: disabled ? "" : undefined,
    [AccordionRootDataAttributes.orientation]: orientation,
  };
}
