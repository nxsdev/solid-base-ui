import { Dynamic } from "../../internal/Dynamic";
import {
  createEffect,
  createMemo,
  createSignal,
  untrack,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import type { Orientation as OrientationType } from "../../types";
import { CompositeList, type CompositeMetadata } from "../../composite/list/CompositeList";
import type { ElementListRef } from "../../composite/composite";
import type { TabsTab } from "../tab/TabsTab";
import { TabsRootContext, type TabsRootContextValue } from "./TabsRootContext";
import type { TabsActivationDirection, TabsChangeEventDetails, TabsValue } from "../types";

/**
 * Groups tabs and their corresponding panels.
 */
export function TabsRoot(props: TabsRoot.Props) {
  const tabPanelRefs: ElementListRef<HTMLElement> = { current: [] };
  const initialValue = untrack<TabsValue>(() => props.value ?? props.defaultValue ?? 0);
  let uncontrolledValue = initialValue;

  const [localValue, setLocalValue] = createSignal<TabsValue>(initialValue);
  const [tabMap, setTabMap] = createSignal<Map<Element, CompositeMetadata>>(new Map());
  const [mountedTabPanels, setMountedTabPanels] = createSignal<Map<TabsValue, string>>(new Map());
  const [tabActivationDirection, setTabActivationDirection] =
    createSignal<TabsActivationDirection>("none");

  const selectedValue = createMemo<TabsValue>(() => props.value ?? localValue());
  const orientation = createMemo<OrientationType>(() => props.orientation ?? "horizontal");

  const getTabPanelIdByValue = (tabValue: TabsValue) => {
    return mountedTabPanels().get(tabValue);
  };

  const getTabIdByPanelValue = (panelValue: TabsValue) => {
    for (const tabMetadata of tabMap().values()) {
      if (tabMetadata === null || tabMetadata === undefined) {
        continue;
      }

      if (isSameValue(readMetadataValue(tabMetadata), panelValue)) {
        return readMetadataId(tabMetadata);
      }
    }

    return undefined;
  };

  const getTabElementBySelectedValue = (selectedTabValue: TabsValue | undefined) => {
    if (selectedTabValue === undefined) {
      return null;
    }

    for (const [tabElement, tabMetadata] of tabMap().entries()) {
      if (tabMetadata === null || tabMetadata === undefined) {
        continue;
      }

      if (isSameValue(readMetadataValue(tabMetadata), selectedTabValue)) {
        return tabElement instanceof HTMLElement ? tabElement : null;
      }
    }

    return null;
  };

  const onValueChange = (newValue: TabsValue, eventDetails: TabsRoot.ChangeEventDetails) => {
    props.onValueChange?.(newValue, eventDetails);

    if (eventDetails.isCanceled) {
      return;
    }

    setTabActivationDirection(() => eventDetails.activationDirection);

    if (props.value === undefined) {
      uncontrolledValue = newValue;
      setLocalValue(() => newValue);
    }
  };

  const registerMountedTabPanel = (panelValue: TabsValue, panelId: string) => {
    setMountedTabPanels((previous) => {
      if (previous.get(panelValue) === panelId) {
        return previous;
      }

      const next = new Map(previous);
      next.set(panelValue, panelId);
      return next;
    });
  };

  const unregisterMountedTabPanel = (panelValue: TabsValue, panelId: string) => {
    setMountedTabPanels((previous) => {
      if (!previous.has(panelValue) || previous.get(panelValue) !== panelId) {
        return previous;
      }

      const next = new Map(previous);
      next.delete(panelValue);
      return next;
    });
  };

  createEffect(
    () => [props.value, selectedValue(), tabMap(), props.defaultValue] as const,
    ([controlledValue, currentValue, currentTabMap, defaultValue]) => {
      if (controlledValue !== undefined) {
        return;
      }

      if (currentTabMap.size === 0) {
        return;
      }

      const selectedMetadata = findMetadataByValue(currentTabMap, currentValue);

      const selectionIsDisabled = selectedMetadata?.disabled === true;
      const selectionIsMissing = selectedMetadata === null && currentValue !== null;

      const hasExplicitDefaultValue = Object.hasOwn(props, "defaultValue");
      const shouldHonorExplicitDefaultSelection =
        hasExplicitDefaultValue &&
        selectionIsDisabled &&
        isSameValue(currentValue, defaultValue ?? 0);

      if (shouldHonorExplicitDefaultSelection) {
        return;
      }

      if (!selectionIsDisabled && !selectionIsMissing) {
        return;
      }

      const firstEnabledTabValue = findFirstEnabledValue(currentTabMap);
      const nextValue = firstEnabledTabValue ?? null;

      if (isSameValue(uncontrolledValue, nextValue)) {
        return;
      }

      uncontrolledValue = nextValue;
      setLocalValue(() => nextValue);
      setTabActivationDirection(() => "none");
    },
  );

  const contextValue: TabsRootContextValue = {
    value: selectedValue,
    onValueChange,
    orientation,
    getTabElementBySelectedValue,
    getTabIdByPanelValue,
    getTabPanelIdByValue,
    registerMountedTabPanel,
    unregisterMountedTabPanel,
    tabMap,
    setTabMap,
    tabActivationDirection,
  };

  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...ROOT_OMITTED_PROP_KEYS));

  return (
    <TabsRootContext value={contextValue}>
      <CompositeList elementsRef={tabPanelRefs}>
        <Dynamic
          component={component()}
          data-orientation={orientation()}
          data-activation-direction={tabActivationDirection()}
          {...elementProps()}
        >
          {props.children}
        </Dynamic>
      </CompositeList>
    </TabsRootContext>
  );
}

export type TabsRootOrientation = OrientationType;

export interface TabsRootState {
  orientation: TabsRoot.Orientation;
  tabActivationDirection: TabsTab.ActivationDirection;
}

export interface TabsRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value?: TabsTab.Value | undefined;
  defaultValue?: TabsTab.Value | undefined;
  orientation?: TabsRoot.Orientation | undefined;
  onValueChange?:
    | ((value: TabsTab.Value, eventDetails: TabsRoot.ChangeEventDetails) => void)
    | undefined;
  render?: ValidComponent | undefined;
}

export type TabsRootChangeEventReason = "none";
export type TabsRootChangeEventDetails = TabsChangeEventDetails;

export namespace TabsRoot {
  export type State = TabsRootState;
  export type Props = TabsRootProps;
  export type Orientation = TabsRootOrientation;
  export type ChangeEventReason = TabsRootChangeEventReason;
  export type ChangeEventDetails = TabsRootChangeEventDetails;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "value",
  "defaultValue",
  "orientation",
  "onValueChange",
  "render",
] as const satisfies ReadonlyArray<keyof TabsRootProps>;

function isSameValue(a: TabsValue, b: TabsValue): boolean {
  return Object.is(a, b);
}

function readMetadataValue(metadata: CompositeMetadata): TabsValue {
  if (Object.hasOwn(metadata, "value")) {
    return metadata.value;
  }

  if (typeof metadata.index === "number") {
    return metadata.index;
  }

  return null;
}

function readMetadataId(metadata: CompositeMetadata): string | undefined {
  return typeof metadata.id === "string" ? metadata.id : undefined;
}

function readMetadataDisabled(metadata: CompositeMetadata): boolean {
  return metadata.disabled === true;
}

function findMetadataByValue(
  map: Map<Element, CompositeMetadata>,
  value: TabsValue,
): { disabled: boolean; value: TabsValue } | null {
  for (const metadata of map.values()) {
    if (metadata === null || metadata === undefined) {
      continue;
    }

    const metadataValue = readMetadataValue(metadata);

    if (isSameValue(metadataValue, value)) {
      return {
        disabled: readMetadataDisabled(metadata),
        value: metadataValue,
      };
    }
  }

  return null;
}

function findFirstEnabledValue(map: Map<Element, CompositeMetadata>): TabsValue | undefined {
  for (const metadata of map.values()) {
    if (metadata === null || metadata === undefined || readMetadataDisabled(metadata)) {
      continue;
    }

    return readMetadataValue(metadata);
  }

  return undefined;
}
