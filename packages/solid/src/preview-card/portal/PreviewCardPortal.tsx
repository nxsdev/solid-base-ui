import { DialogPortal, type DialogPortalProps } from "../../dialog/portal/DialogPortal";

/**
 * A portal element that moves the preview card popup to a different part of the DOM.
 */
export function PreviewCardPortal(props: PreviewCardPortal.Props) {
  return <DialogPortal {...props}>{props.children}</DialogPortal>;
}

export interface PreviewCardPortalProps extends DialogPortalProps {}

export namespace PreviewCardPortal {
  export type Props = PreviewCardPortalProps;
}
