import { Show, createEffect, createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import type { CollapsibleRootState } from "../root/CollapsibleRoot";
import { Dynamic } from "../../internal/Dynamic";
import { ResolvedChildren } from "../../internal/ResolvedChildren";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useCollapsibleRootContext } from "../root/CollapsibleRootContext";
import { getCollapsibleOpenDataAttributes } from "../root/stateAttributesMapping";
import { useCollapsiblePanel } from "./useCollapsiblePanel";

/**
 * A panel with the collapsible contents.
 */
export function CollapsiblePanel(props: CollapsiblePanel.Props) {
  const context = useCollapsibleRootContext();
  const defaultId = useBaseUiId();
  const resolvedId = createMemo<string>(() =>
    typeof props.id === "string" ? props.id : defaultId,
  );

  createEffect(resolvedId, (id) => {
    context.setPanelId(id);
  });

  const keepMounted = createMemo<boolean>(() => props.keepMounted ?? false);
  const hiddenUntilFound = createMemo<boolean>(() => props.hiddenUntilFound ?? false);
  const panel = useCollapsiblePanel({
    hiddenUntilFound,
    keepMounted,
    onTransitionStatusChange: context.setTransitionStatus,
  });

  const style = createMemo<JSX.CSSProperties>(() => ({
    ...panel.style(),
    ...toStyleObject(props.style),
  }));

  const elementProps = createMemo(() => omit(props, ...PANEL_OMITTED_PROP_KEYS));

  return (
    <Show when={panel.shouldRender()}>
      <Dynamic
        component={props.render ?? "div"}
        id={resolvedId()}
        hidden={panel.hidden()}
        style={style()}
        ref={(node: HTMLDivElement) => {
          panel.ref(node);

          if (typeof props.ref === "function") {
            props.ref(node);
          }
        }}
        {...getCollapsibleOpenDataAttributes(context.open(), panel.transitionStatus())}
        {...elementProps()}
      >
        <ResolvedChildren>{props.children}</ResolvedChildren>
      </Dynamic>
    </Show>
  );
}

export interface CollapsiblePanelProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  hiddenUntilFound?: boolean | undefined;
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export interface CollapsiblePanelState extends CollapsibleRootState {}

export namespace CollapsiblePanel {
  export type Props = CollapsiblePanelProps;
  export type State = CollapsiblePanelState;
}

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}

const PANEL_OMITTED_PROP_KEYS = [
  "children",
  "hiddenUntilFound",
  "id",
  "keepMounted",
  "ref",
  "render",
  "style",
] as const satisfies ReadonlyArray<keyof CollapsiblePanelProps>;
