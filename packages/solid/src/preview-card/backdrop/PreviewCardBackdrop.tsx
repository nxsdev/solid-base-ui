import {
  DialogBackdrop,
  type DialogBackdropProps,
  type DialogBackdropState,
} from "../../dialog/backdrop/DialogBackdrop";

/**
 * An overlay displayed beneath the preview card popup.
 */
export function PreviewCardBackdrop(props: PreviewCardBackdrop.Props) {
  return <DialogBackdrop {...props}>{props.children}</DialogBackdrop>;
}

export interface PreviewCardBackdropProps extends DialogBackdropProps {}
export interface PreviewCardBackdropState extends DialogBackdropState {}

export namespace PreviewCardBackdrop {
  export type Props = PreviewCardBackdropProps;
  export type State = PreviewCardBackdropState;
}
