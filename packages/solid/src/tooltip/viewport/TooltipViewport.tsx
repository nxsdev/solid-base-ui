import { DialogViewport, type DialogViewportProps } from "../../dialog/viewport/DialogViewport";

/**
 * A viewport wrapper for tooltip content.
 */
export function TooltipViewport(props: TooltipViewport.Props) {
  return <DialogViewport {...props}>{props.children}</DialogViewport>;
}

export interface TooltipViewportProps extends DialogViewportProps {}

export namespace TooltipViewport {
  export type Props = TooltipViewportProps;
}
