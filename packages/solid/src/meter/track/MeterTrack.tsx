import type { JSX, ValidComponent } from "solid-js";
import type { MeterRootState } from "../root/MeterRoot";

/**
 * Contains the meter indicator and represents the entire range.
 */
export function MeterTrack(props: MeterTrack.Props) {
  return (
    <div class={props.class} style={props.style} data-testid={props["data-testid"]}>
      {props.children}
    </div>
  );
}

export interface MeterTrackProps extends JSX.HTMLAttributes<HTMLDivElement> {
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
}

export interface MeterTrackState extends MeterRootState {}

export namespace MeterTrack {
  export type Props = MeterTrackProps;
  export type State = MeterTrackState;
}
