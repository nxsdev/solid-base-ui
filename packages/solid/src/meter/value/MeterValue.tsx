import type { JSX, ValidComponent } from "solid-js";
import type { MeterRootState } from "../root/MeterRoot";
import { useMeterRootContext } from "../root/MeterRootContext";

/**
 * A text element displaying the current value.
 */
export function MeterValue(props: MeterValue.Props) {
  const context = useMeterRootContext();

  const content = () => {
    if (typeof props.children === "function") {
      return props.children(context.formattedValue(), context.value());
    }

    return props.children ?? (context.formattedValue() || context.value());
  };

  return (
    <span
      aria-hidden="true"
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
    >
      {content()}
    </span>
  );
}

export interface MeterValueProps extends Omit<JSX.HTMLAttributes<HTMLSpanElement>, "children"> {
  "data-testid"?: string | undefined;
  children?: JSX.Element | ((formattedValue: string, value: number) => JSX.Element) | undefined;
  render?: ValidComponent | undefined;
}

export interface MeterValueState extends MeterRootState {}

export namespace MeterValue {
  export type Props = MeterValueProps;
  export type State = MeterValueState;
}
