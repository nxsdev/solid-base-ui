import { Dynamic } from "@solidjs/web";
import { Show, createMemo, type JSX, type ValidComponent } from "solid-js";
import type { RadioRootState } from "../root/RadioRoot";
import { useRadioRootContext } from "../root/RadioRootContext";

/**
 * Indicates whether the radio is selected.
 */
export function RadioIndicator(props: RadioIndicator.Props) {
  const state = useRadioRootContext();
  const shouldRender = createMemo(() => props.keepMounted || state.checked());

  const component = () => props.render ?? "span";
  const elementProps = createMemo(() => {
    const { keepMounted: _keepMounted, render: _render, ...rest } = props;
    void _keepMounted;
    void _render;
    return rest;
  });

  return (
    <Show when={shouldRender()}>
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
    </Show>
  );
}

export interface RadioIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export interface RadioIndicatorState extends RadioRootState {}

export namespace RadioIndicator {
  export type Props = RadioIndicatorProps;
  export type State = RadioIndicatorState;
}
