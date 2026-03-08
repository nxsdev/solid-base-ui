import { Dynamic } from "../../internal/Dynamic";
import { createMemo, type JSX, type ValidComponent } from "solid-js";
import type { TabsRoot } from "../root/TabsRoot";
import { useTabsRootContext } from "../root/TabsRootContext";

/**
 * A visual indicator for the active tab.
 */
export function TabsIndicator(props: TabsIndicator.Props) {
  const rootContext = useTabsRootContext();

  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const elementProps = createMemo(() => {
    const { render: _render, children: _children, ...rest } = props;
    void _render;
    void _children;
    return rest;
  });

  return (
    <Dynamic
      component={component()}
      data-orientation={rootContext.orientation()}
      data-activation-direction={rootContext.tabActivationDirection()}
      {...elementProps()}
    >
      {props.children}
    </Dynamic>
  );
}

export interface TabsIndicatorState extends TabsRoot.State {}

export interface TabsIndicatorProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  render?: ValidComponent | undefined;
}

export namespace TabsIndicator {
  export type State = TabsIndicatorState;
  export type Props = TabsIndicatorProps;
}
