import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { MeterRootState } from "../root/MeterRoot";
import { useMeterRootContext } from "../root/MeterRootContext";

/**
 * An accessible label for the meter.
 */
export function MeterLabel(props: MeterLabel.Props) {
  const id = useBaseUiId();
  const rootContext = useMeterRootContext();
  const labelId = createMemo<string | undefined>(() =>
    typeof props.id === "string" ? props.id : id,
  );

  createEffect(labelId, (resolvedLabelId) => {
    rootContext.setLabelId(resolvedLabelId);
  });

  onCleanup(() => {
    rootContext.setLabelId(undefined);
  });

  return (
    <span
      id={labelId()}
      role={typeof props.role === "string" ? props.role : "presentation"}
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
    >
      {props.children}
    </span>
  );
}

export interface MeterLabelProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export interface MeterLabelState extends MeterRootState {}

export namespace MeterLabel {
  export type Props = MeterLabelProps;
  export type State = MeterLabelState;
}
