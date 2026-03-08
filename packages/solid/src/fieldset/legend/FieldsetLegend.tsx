import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import type { FieldsetRootState } from "../root/FieldsetRoot";
import { useFieldsetRootContext } from "../root/FieldsetRootContext";

/**
 * An accessible label that is automatically associated with the fieldset.
 */
export function FieldsetLegend(props: FieldsetLegend.Props) {
  const generatedId = useBaseUiId();
  const context = useFieldsetRootContext();
  const legendId = createMemo<string>(() =>
    typeof props.id === "string" ? props.id : generatedId,
  );

  createEffect(legendId, (resolvedLegendId) => {
    context.setLegendId(resolvedLegendId);
  });

  onCleanup(() => {
    context.setLegendId(undefined);
  });

  return (
    <div
      id={legendId()}
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
      data-disabled={context.disabled() ? "" : undefined}
    >
      {props.children}
    </div>
  );
}

export interface FieldsetLegendState extends FieldsetRootState {}

export interface FieldsetLegendProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export namespace FieldsetLegend {
  export type State = FieldsetLegendState;
  export type Props = FieldsetLegendProps;
}
