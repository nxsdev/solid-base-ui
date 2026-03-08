import { Dynamic } from "@solidjs/web";
import { Show, createMemo, type JSX, type ValidComponent } from "solid-js";
import type { CheckboxRootState } from "../root/CheckboxRoot";
import { useCheckboxRootContext } from "../root/CheckboxRootContext";

/**
 * Indicates whether the checkbox is checked.
 */
export function CheckboxIndicator(props: CheckboxIndicator.Props) {
  const state = useCheckboxRootContext();
  const shouldRender = createMemo(
    () => props.keepMounted || state.checked() || state.indeterminate(),
  );

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
        data-checked={state.indeterminate() ? undefined : state.checked() ? "" : undefined}
        data-unchecked={state.indeterminate() ? undefined : state.checked() ? undefined : ""}
        data-indeterminate={state.indeterminate() ? "" : undefined}
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

export interface CheckboxIndicatorState extends CheckboxRootState {}

export interface CheckboxIndicatorProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  keepMounted?: boolean | undefined;
  render?: ValidComponent | undefined;
}

export namespace CheckboxIndicator {
  export type State = CheckboxIndicatorState;
  export type Props = CheckboxIndicatorProps;
}
