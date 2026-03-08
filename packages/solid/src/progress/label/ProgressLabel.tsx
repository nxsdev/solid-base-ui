import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { ProgressRootState } from "../root/ProgressRoot";
import { useProgressRootContext } from "../root/ProgressRootContext";
import { getProgressStatusDataAttributes } from "../root/stateAttributesMapping";

/**
 * An accessible label for the progress bar.
 */
export function ProgressLabel(props: ProgressLabel.Props) {
  const generatedId = useBaseUiId();
  const context = useProgressRootContext();
  const labelId = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(labelId, (resolvedLabelId) => {
    context.setLabelId(resolvedLabelId);
  });

  onCleanup(() => {
    context.setLabelId(undefined);
  });

  return (
    <span
      id={labelId()}
      role={typeof props.role === "string" ? props.role : "presentation"}
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
      {...getProgressStatusDataAttributes(context.status())}
    >
      {props.children}
    </span>
  );
}

export interface ProgressLabelProps extends JSX.HTMLAttributes<HTMLSpanElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export interface ProgressLabelState extends ProgressRootState {}

export namespace ProgressLabel {
  export type Props = ProgressLabelProps;
  export type State = ProgressLabelState;
}
