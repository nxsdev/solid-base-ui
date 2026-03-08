import { createChangeEventDetails } from "../utils/createChangeEventDetails";
import type { TabsActivationDirection, TabsChangeEventDetails } from "./types";

export function createTabsChangeEventDetails(
  event: Event | undefined,
  trigger: Element | undefined,
  activationDirection: TabsActivationDirection,
): TabsChangeEventDetails {
  return Object.assign(createChangeEventDetails(event, trigger, "none"), {
    activationDirection,
  });
}
