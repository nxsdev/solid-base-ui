import type { JSX, ValidComponent } from "solid-js";
import type { ProgressRootState } from "../root/ProgressRoot";
import { useProgressRootContext } from "../root/ProgressRootContext";
import { getProgressStatusDataAttributes } from "../root/stateAttributesMapping";

/**
 * Contains the progress indicator and represents the full range.
 */
export function ProgressTrack(props: ProgressTrack.Props) {
  const context = useProgressRootContext();

  return (
    <div
      class={props.class}
      style={props.style}
      data-testid={props["data-testid"]}
      {...getProgressStatusDataAttributes(context.status())}
    >
      {props.children}
    </div>
  );
}

export interface ProgressTrackProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export interface ProgressTrackState extends ProgressRootState {}

export namespace ProgressTrack {
  export type Props = ProgressTrackProps;
  export type State = ProgressTrackState;
}
