import type { Orientation } from "../types";
import type { BaseUIChangeEventDetails } from "../types";

export type TabsValue = unknown | null;

export type TabsActivationDirection = "left" | "right" | "up" | "down" | "none";

export type TabsChangeEventReason = "none";

export type TabsChangeEventDetails = BaseUIChangeEventDetails<TabsChangeEventReason> & {
  activationDirection: TabsActivationDirection;
};

export interface TabsStateBase {
  orientation: Orientation;
  tabActivationDirection: TabsActivationDirection;
}
