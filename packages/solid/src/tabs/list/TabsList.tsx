import { createMemo, createSignal, untrack, type JSX, type ValidComponent, omit } from "solid-js";
import { CompositeRoot } from "../../composite/root/CompositeRoot";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { TabsRoot } from "../root/TabsRoot";
import { useTabsRootContext } from "../root/TabsRootContext";
import { TabsListContext, type TabsListContextValue } from "./TabsListContext";
import type { TabsValue } from "../types";

/**
 * Groups individual tab buttons.
 */
export function TabsList(props: TabsList.Props) {
  const rootContext = useTabsRootContext();

  const [highlightedTabIndex, setHighlightedTabIndex] = createSignal<number>(
    untrack(() => getInitialHighlightedTabIndex(rootContext.tabMap())),
  );

  const activateOnFocus = createMemo(() => resolveBoolean(props.activateOnFocus, false));
  const loopFocus = createMemo(() => resolveBoolean(props.loopFocus, true));

  const onTabActivation: TabsListContextValue["onTabActivation"] = (newValue, eventDetails) => {
    if (isSameValue(newValue, rootContext.value())) {
      return;
    }

    rootContext.onValueChange(newValue, eventDetails);
  };

  const contextValue: TabsListContextValue = {
    activateOnFocus,
    highlightedTabIndex,
    onTabActivation,
    setHighlightedTabIndex,
  };

  const disabledIndices = createMemo<number[]>(() => {
    const output: number[] = [];

    rootContext.tabMap().forEach((tabMetadata) => {
      if (tabMetadata.disabled !== true || tabMetadata.index === undefined) {
        return;
      }

      output.push(tabMetadata.index);
    });

    return output;
  });

  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...LIST_OMITTED_PROP_KEYS));

  return (
    <TabsListContext value={contextValue}>
      <CompositeRoot
        render={component()}
        role="tablist"
        aria-orientation={rootContext.orientation() === "vertical" ? "vertical" : undefined}
        data-orientation={rootContext.orientation()}
        data-activation-direction={rootContext.tabActivationDirection()}
        highlightedIndex={highlightedTabIndex()}
        onHighlightedIndexChange={setHighlightedTabIndex}
        enableHomeAndEndKeys
        loopFocus={loopFocus()}
        orientation={rootContext.orientation()}
        onMapChange={(newMap) => {
          rootContext.setTabMap(() => newMap);
        }}
        disabledIndices={disabledIndices()}
        {...elementProps()}
      >
        {props.children}
      </CompositeRoot>
    </TabsListContext>
  );
}

export interface TabsListState extends TabsRoot.State {}

export interface TabsListProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  activateOnFocus?: boolean | undefined;
  loopFocus?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace TabsList {
  export type State = TabsListState;
  export type Props = TabsListProps;
}

const LIST_OMITTED_PROP_KEYS = [
  "children",
  "activateOnFocus",
  "loopFocus",
  "render",
] as const satisfies ReadonlyArray<keyof TabsListProps>;

function getInitialHighlightedTabIndex(
  tabMap: Map<Element, { disabled?: unknown; index?: number | undefined }>,
): number {
  for (const tabMetadata of tabMap.values()) {
    if (tabMetadata?.disabled !== true && typeof tabMetadata?.index === "number") {
      return tabMetadata.index;
    }
  }

  return 0;
}

function isSameValue(a: TabsValue, b: TabsValue): boolean {
  return Object.is(a, b);
}
