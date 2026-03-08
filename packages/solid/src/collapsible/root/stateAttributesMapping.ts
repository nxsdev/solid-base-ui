import type { CollapsibleTransitionStatus } from "./CollapsibleRoot";
import { CollapsiblePanelDataAttributes } from "../panel/CollapsiblePanelDataAttributes";
import { CollapsibleTriggerDataAttributes } from "../trigger/CollapsibleTriggerDataAttributes";

export interface CollapsibleOpenDataAttributes {
  "data-open"?: "" | undefined;
  "data-closed"?: "" | undefined;
  "data-starting-style"?: "" | undefined;
  "data-ending-style"?: "" | undefined;
}

export interface CollapsibleTriggerOpenDataAttributes {
  "data-panel-open"?: "" | undefined;
  "data-starting-style"?: "" | undefined;
  "data-ending-style"?: "" | undefined;
}

export function getCollapsibleOpenDataAttributes(
  open: boolean,
  transitionStatus: CollapsibleTransitionStatus = "idle",
): CollapsibleOpenDataAttributes {
  return {
    [CollapsiblePanelDataAttributes.open]: open ? "" : undefined,
    [CollapsiblePanelDataAttributes.closed]: open ? undefined : "",
    [CollapsiblePanelDataAttributes.startingStyle]:
      transitionStatus === "starting" ? "" : undefined,
    [CollapsiblePanelDataAttributes.endingStyle]: transitionStatus === "ending" ? "" : undefined,
  };
}

export function getCollapsibleTriggerOpenDataAttributes(
  open: boolean,
  transitionStatus: CollapsibleTransitionStatus = "idle",
): CollapsibleTriggerOpenDataAttributes {
  return {
    [CollapsibleTriggerDataAttributes.panelOpen]: open ? "" : undefined,
    [CollapsiblePanelDataAttributes.startingStyle]:
      transitionStatus === "starting" ? "" : undefined,
    [CollapsiblePanelDataAttributes.endingStyle]: transitionStatus === "ending" ? "" : undefined,
  };
}
