import { Dynamic } from "../internal/Dynamic";
import { createMemo, type JSX, type ValidComponent } from "solid-js";
import type { Orientation } from "../types";

/**
 * A separator element accessible to screen readers.
 */
export function Separator(props: Separator.Props) {
  const component = createMemo<ValidComponent>(() => props.render ?? "div");
  const orientation = createMemo<Orientation>(() => props.orientation ?? "horizontal");
  const elementProps = createMemo<Omit<JSX.HTMLAttributes<HTMLDivElement>, "role">>(() => {
    const { orientation: _orientation, render: _render, ...rest } = props;
    void _orientation;
    void _render;
    return rest;
  });

  return (
    <Dynamic
      component={component()}
      role="separator"
      aria-orientation={orientation()}
      {...elementProps()}
    />
  );
}

export interface SeparatorProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "role"> {
  /**
   * The orientation of the separator.
   * @default "horizontal"
   */
  orientation?: Orientation | undefined;
  render?: ValidComponent | undefined;
}

export interface SeparatorState {
  /**
   * The orientation of the separator.
   */
  orientation: Orientation;
}

export namespace Separator {
  export type Props = SeparatorProps;
  export type State = SeparatorState;
}
