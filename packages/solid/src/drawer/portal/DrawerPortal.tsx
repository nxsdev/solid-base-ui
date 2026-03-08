import { DialogPortal, type DialogPortalProps } from "../../dialog/portal/DialogPortal";

/**
 * A portal element that moves the popup to a different part of the DOM.
 */
export function DrawerPortal(props: DrawerPortal.Props) {
  return <DialogPortal {...props} />;
}

export interface DrawerPortalProps extends DialogPortalProps {}

export interface DrawerPortalState {}

export namespace DrawerPortal {
  export type Props = DrawerPortalProps;
  export type State = DrawerPortalState;
}
