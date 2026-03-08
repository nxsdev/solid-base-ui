import { createMemo, type JSX, type ValidComponent } from "solid-js";
import type { MeterRootState } from "../root/MeterRoot";
import { useMeterRootContext } from "../root/MeterRootContext";

/**
 * Visualizes the position of the value along the range.
 */
export function MeterIndicator(props: MeterIndicator.Props) {
  const context = useMeterRootContext();
  const widthPercent = createMemo(() =>
    valueToPercent(context.value(), context.min(), context.max()),
  );

  return (
    <div
      class={props.class}
      style={{
        "inset-inline-start": 0,
        height: "inherit",
        width: `${widthPercent()}%`,
        ...toStyleObject(props.style),
      }}
      data-testid={props["data-testid"]}
    >
      {props.children}
    </div>
  );
}

export interface MeterIndicatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export interface MeterIndicatorState extends MeterRootState {}

export namespace MeterIndicator {
  export type Props = MeterIndicatorProps;
  export type State = MeterIndicatorState;
}

function valueToPercent(value: number, min: number, max: number): number {
  if (max <= min) {
    return 0;
  }

  const clamped = Math.min(max, Math.max(min, value));
  return ((clamped - min) / (max - min)) * 100;
}

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}
