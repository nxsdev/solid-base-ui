import { createContext, useContext, type Accessor, type Setter } from "solid-js";
import type { Orientation } from "../../types";
import type { CompositeMetadata } from "../../composite/list/CompositeList";
import type { TabsActivationDirection, TabsChangeEventDetails, TabsValue } from "../types";

export interface TabsRootContextValue {
  value: Accessor<TabsValue>;
  onValueChange: (value: TabsValue, eventDetails: TabsChangeEventDetails) => void;
  orientation: Accessor<Orientation>;
  getTabElementBySelectedValue: (selectedValue: TabsValue | undefined) => HTMLElement | null;
  getTabIdByPanelValue: (panelValue: TabsValue) => string | undefined;
  getTabPanelIdByValue: (tabValue: TabsValue) => string | undefined;
  registerMountedTabPanel: (panelValue: TabsValue, panelId: string) => void;
  unregisterMountedTabPanel: (panelValue: TabsValue, panelId: string) => void;
  tabMap: Accessor<Map<Element, CompositeMetadata>>;
  setTabMap: Setter<Map<Element, CompositeMetadata>>;
  tabActivationDirection: Accessor<TabsActivationDirection>;
}

export const TabsRootContext = createContext<TabsRootContextValue | null>(null);

export function useTabsRootContext(optional: true): TabsRootContextValue | null;
export function useTabsRootContext(optional?: false): TabsRootContextValue;
export function useTabsRootContext(optional = false) {
  const context = useContext(TabsRootContext);

  if (context === null && !optional) {
    throw new Error("TabsRoot context is missing. Tabs parts must be placed within <Tabs.Root>.");
  }

  return context;
}
