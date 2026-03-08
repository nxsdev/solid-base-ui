import { createMemo, type JSX, type ValidComponent } from "solid-js";
import type { ProgressRootState } from "../root/ProgressRoot";
import { useProgressRootContext } from "../root/ProgressRootContext";
import { getProgressStatusDataAttributes } from "../root/stateAttributesMapping";

/**
 * Visualizes the completion status of the task.
 */
export function ProgressIndicator(props: ProgressIndicator.Props) {
  const context = useProgressRootContext();

  const percentageValue = createMemo<number | null>(() => {
    const resolvedValue = context.value();
    if (resolvedValue === null) {
      return null;
    }

    return valueToPercent(resolvedValue, context.min(), context.max());
  });

  const style = createMemo<JSX.CSSProperties>(() => {
    const styleObject = toStyleObject(props.style);
    const currentPercentage = percentageValue();

    if (currentPercentage === null) {
      return styleObject;
    }

    return {
      "inset-inline-start": 0,
      height: "inherit",
      width: `${currentPercentage}%`,
      ...styleObject,
    };
  });

  return (
    <div
      class={props.class}
      style={style()}
      data-testid={props["data-testid"]}
      {...getProgressStatusDataAttributes(context.status())}
    >
      {props.children}
    </div>
  );
}

export interface ProgressIndicatorProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export interface ProgressIndicatorState extends ProgressRootState {}

export namespace ProgressIndicator {
  export type Props = ProgressIndicatorProps;
  export type State = ProgressIndicatorState;
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
