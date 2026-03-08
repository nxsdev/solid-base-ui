import {
  DialogViewport,
  type DialogViewportProps,
  type DialogViewportState,
} from "../../dialog/viewport/DialogViewport";

/**
 * A viewport for displaying preview card content transitions.
 */
export function PreviewCardViewport(props: PreviewCardViewport.Props) {
  return <DialogViewport {...props}>{props.children}</DialogViewport>;
}

export interface PreviewCardViewportProps extends DialogViewportProps {}
export interface PreviewCardViewportState extends DialogViewportState {}

export namespace PreviewCardViewport {
  export type Props = PreviewCardViewportProps;
  export type State = PreviewCardViewportState;
}
