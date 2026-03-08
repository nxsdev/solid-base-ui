import { Dynamic } from "../../internal/Dynamic";
import { createMemo, type JSX, type ValidComponent, omit } from "solid-js";
import { resolveBoolean } from "../../utils/resolveBoolean";
import type { ToolbarRoot } from "../root/ToolbarRoot";
import { useToolbarRootContext } from "../root/ToolbarRootContext";
import { ToolbarGroupContext, type ToolbarGroupContextValue } from "./ToolbarGroupContext";

/**
 * Groups several toolbar items.
 */
export function ToolbarGroup(props: ToolbarGroup.Props) {
  const rootContext = useToolbarRootContext();

  const disabled = createMemo(
    () => rootContext.disabled() || resolveBoolean(props.disabled, false),
  );

  const contextValue: ToolbarGroupContextValue = {
    disabled,
  };

  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => omit(props, ...GROUP_OMITTED_PROP_KEYS));

  return (
    <ToolbarGroupContext value={contextValue}>
      <Dynamic
        component={component()}
        role="group"
        data-disabled={disabled() ? "" : undefined}
        data-orientation={rootContext.orientation()}
        {...elementProps()}
      >
        {props.children}
      </Dynamic>
    </ToolbarGroupContext>
  );
}

export type ToolbarGroupState = ToolbarRoot.State;

export interface ToolbarGroupProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  "data-testid"?: string | undefined;
  disabled?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace ToolbarGroup {
  export type State = ToolbarGroupState;
  export type Props = ToolbarGroupProps;
}

const GROUP_OMITTED_PROP_KEYS = ["children", "disabled", "render"] as const satisfies ReadonlyArray<
  keyof ToolbarGroupProps
>;
