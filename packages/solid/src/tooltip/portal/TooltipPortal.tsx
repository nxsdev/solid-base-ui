import { DialogPortal, type DialogPortalProps } from "../../dialog/portal/DialogPortal";

/**
 * A portal element that moves the tooltip popup to a different part of the DOM.
 */
export function TooltipPortal(props: TooltipPortal.Props) {
  return <DialogPortal {...props}>{props.children}</DialogPortal>;
}

export interface TooltipPortalProps extends DialogPortalProps {}

export namespace TooltipPortal {
  export type Props = TooltipPortalProps;
}
