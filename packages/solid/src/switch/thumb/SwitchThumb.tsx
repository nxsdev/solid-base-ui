import { Dynamic } from "@solidjs/web";
import { createMemo, type JSX, type ValidComponent } from "solid-js";
import type { SwitchRootState } from "../root/SwitchRoot";
import { useSwitchRootContext } from "../root/SwitchRootContext";

/**
 * The movable part of the switch that indicates whether the switch is on or off.
 */
export function SwitchThumb(props: SwitchThumb.Props) {
  const state = useSwitchRootContext();
  const component = () => props.render ?? "span";

  const elementProps = createMemo(() => {
    const { render: _render, ...rest } = props;
    void _render;
    return rest;
  });

  return (
    <Dynamic
      component={component()}
      data-checked={state.checked() ? "" : undefined}
      data-unchecked={state.checked() ? undefined : ""}
      data-disabled={state.disabled() ? "" : undefined}
      data-readonly={state.readOnly() ? "" : undefined}
      data-required={state.required() ? "" : undefined}
      data-touched={state.touched() ? "" : undefined}
      data-dirty={state.dirty() ? "" : undefined}
      data-filled={state.filled() ? "" : undefined}
      data-focused={state.focused() ? "" : undefined}
      {...elementProps()}
    />
  );
}

export interface SwitchThumbProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  render?: ValidComponent | undefined;
}

export interface SwitchThumbState extends SwitchRootState {}

export namespace SwitchThumb {
  export type Props = SwitchThumbProps;
  export type State = SwitchThumbState;
}
