import { Dynamic } from "../../internal/Dynamic";
import { Show, createEffect, createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import { useCompositeListItem } from "../../composite/list/useCompositeListItem";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { TabsRoot } from "../root/TabsRoot";
import { useTabsRootContext } from "../root/TabsRootContext";
import type { TabsTab } from "../tab/TabsTab";

/**
 * A panel displayed when the corresponding tab is active.
 */
export function TabsPanel(props: TabsPanel.Props) {
  const rootContext = useTabsRootContext();

  const generatedId = useBaseUiId();
  const id = createMemo(() => {
    if (typeof props.id === "string" && props.id !== "") {
      return props.id;
    }

    return generatedId;
  });

  const metadata: TabsPanel.Metadata = {
    get id() {
      return id();
    },
    get value() {
      return props.value;
    },
  };

  const { ref: listItemRef, index } = useCompositeListItem({
    metadata,
  });

  const keepMounted = createMemo(() => resolveBoolean(props.keepMounted, false));
  const open = createMemo(() => isSameValue(props.value, rootContext.value()));
  const hidden = createMemo(() => !open());

  createEffect(
    () => [hidden(), keepMounted(), id(), props.value] as const,
    ([isHidden, isKeepMounted, panelId, panelValue]) => {
      if (isHidden && !isKeepMounted) {
        return;
      }

      rootContext.registerMountedTabPanel(panelValue, panelId);

      return () => {
        rootContext.unregisterMountedTabPanel(panelValue, panelId);
      };
    },
  );

  const shouldRender = createMemo(() => keepMounted() || open());

  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...PANEL_OMITTED_PROP_KEYS));

  const handleRef: JSX.Ref<HTMLDivElement> = (node) => {
    listItemRef(node);

    if (typeof props.ref === "function") {
      props.ref(node);
    }
  };

  return (
    <Show when={shouldRender()}>
      <Dynamic
        component={component()}
        ref={handleRef}
        role="tabpanel"
        id={id()}
        aria-labelledby={rootContext.getTabIdByPanelValue(props.value)}
        hidden={hidden()}
        tabindex={open() ? 0 : -1}
        data-index={index()}
        data-orientation={rootContext.orientation()}
        data-activation-direction={rootContext.tabActivationDirection()}
        data-hidden={hidden() ? "" : undefined}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </Show>
  );
}

export interface TabsPanelMetadata extends Record<string, unknown> {
  id?: string | undefined;
  value: TabsTab.Value;
}

export interface TabsPanelState extends TabsRoot.State {
  hidden: boolean;
}

export interface TabsPanelProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  value: TabsTab.Value;
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace TabsPanel {
  export type Metadata = TabsPanelMetadata;
  export type State = TabsPanelState;
  export type Props = TabsPanelProps;
}

const PANEL_OMITTED_PROP_KEYS = [
  "children",
  "value",
  "keepMounted",
  "render",
  "ref",
] as const satisfies ReadonlyArray<keyof TabsPanelProps>;

function isSameValue(a: TabsTab.Value, b: TabsTab.Value): boolean {
  return Object.is(a, b);
}
