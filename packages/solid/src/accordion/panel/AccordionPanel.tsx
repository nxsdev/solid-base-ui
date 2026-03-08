import {
  Show,
  createEffect,
  createMemo,
  onCleanup,
  type JSX,
  type ValidComponent,
  omit,
} from "solid-js";
import type { CollapsibleRootState } from "../../collapsible/root/CollapsibleRoot";
import { useCollapsibleRootContext } from "../../collapsible/root/CollapsibleRootContext";
import { ResolvedChildren } from "../../internal/ResolvedChildren";
import { resolveBoolean } from "../../utils/resolveBoolean";
import { useAccordionRootContext } from "../root/AccordionRootContext";
import type { AccordionRoot } from "../root/AccordionRoot";
import type { AccordionItem } from "../item/AccordionItem";
import { useAccordionItemContext } from "../item/AccordionItemContext";
import { getAccordionStateDataAttributes } from "../item/stateAttributesMapping";
import { AccordionPanelCssVars } from "./AccordionPanelCssVars";
import { useCollapsiblePanel } from "../../collapsible/panel/useCollapsiblePanel";

/**
 * A collapsible panel with the accordion item contents.
 */
export function AccordionPanel(props: AccordionPanel.Props) {
  const rootContext = useAccordionRootContext();
  const collapsibleContext = useCollapsibleRootContext();
  const itemContext = useAccordionItemContext();

  const hiddenUntilFound = createMemo(() =>
    resolveBoolean(props.hiddenUntilFound, rootContext.hiddenUntilFound()),
  );
  const keepMounted = createMemo(() =>
    resolveBoolean(props.keepMounted, rootContext.keepMounted()),
  );

  createEffect(
    () => props.id,
    (id) => {
      if (typeof id !== "string") {
        return;
      }

      collapsibleContext.setPanelId(id);
    },
  );

  onCleanup(() => {
    if (typeof props.id === "string") {
      collapsibleContext.setPanelId(undefined);
    }
  });

  const panel = useCollapsiblePanel({
    hiddenUntilFound,
    keepMounted,
    onTransitionStatusChange: collapsibleContext.setTransitionStatus,
  });

  const panelState = createMemo<AccordionPanelState>(() => ({
    ...itemContext.state(),
    transitionStatus: panel.transitionStatus(),
  }));

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);

    return {
      [AccordionPanelCssVars.accordionPanelHeight]:
        panel.style()["--collapsible-panel-height"] ?? "auto",
      [AccordionPanelCssVars.accordionPanelWidth]:
        panel.style()["--collapsible-panel-width"] ?? "auto",
      ...inputStyle,
    };
  });

  const elementProps = createMemo(() => omit(props, ...PANEL_OMITTED_PROP_KEYS));

  return (
    <Show when={panel.shouldRender()}>
      <div
        id={typeof props.id === "string" ? props.id : collapsibleContext.panelId()}
        role="region"
        hidden={panel.hidden()}
        aria-labelledby={itemContext.triggerId() || itemContext.defaultTriggerId()}
        style={style()}
        ref={(node) => {
          panel.ref(node);

          if (typeof props.ref === "function") {
            props.ref(node);
          }
        }}
        {...getAccordionStateDataAttributes(panelState())}
        {...elementProps()}
      >
        <ResolvedChildren>{props.children}</ResolvedChildren>
      </div>
    </Show>
  );
}

export interface AccordionPanelState extends AccordionItem.State {
  transitionStatus: CollapsibleRootState["transitionStatus"];
}

export interface AccordionPanelProps
  extends
    JSX.HTMLAttributes<HTMLDivElement>,
    Pick<AccordionRoot.Props, "hiddenUntilFound" | "keepMounted"> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace AccordionPanel {
  export type State = AccordionPanelState;
  export type Props = AccordionPanelProps;
}

const PANEL_OMITTED_PROP_KEYS = [
  "children",
  "hiddenUntilFound",
  "keepMounted",
  "ref",
  "style",
  "id",
] as const satisfies ReadonlyArray<keyof AccordionPanelProps>;

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}
