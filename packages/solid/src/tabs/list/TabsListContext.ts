import { createContext, useContext, type Accessor } from "solid-js";
import type { TabsChangeEventDetails, TabsValue } from "../types";

export interface TabsListContextValue {
  activateOnFocus: Accessor<boolean>;
  highlightedTabIndex: Accessor<number>;
  onTabActivation: (newValue: TabsValue, eventDetails: TabsChangeEventDetails) => void;
  setHighlightedTabIndex: (index: number) => void;
}

export const TabsListContext = createContext<TabsListContextValue | null>(null);

export function useTabsListContext(optional: true): TabsListContextValue | null;
export function useTabsListContext(optional?: false): TabsListContextValue;
export function useTabsListContext(optional = false) {
  const context = useContext(TabsListContext);

  if (context === null && !optional) {
    throw new Error("TabsList context is missing. Tabs parts must be placed within <Tabs.List>.");
  }

  return context;
}
