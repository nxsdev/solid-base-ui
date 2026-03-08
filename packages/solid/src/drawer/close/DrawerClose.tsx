import {
  DialogClose,
  type DialogCloseProps,
  type DialogCloseState,
} from "../../dialog/close/DialogClose";

/**
 * A button that closes the drawer.
 */
export function DrawerClose(props: DrawerClose.Props) {
  return <DialogClose {...props} />;
}

export interface DrawerCloseProps extends DialogCloseProps {}

export type DrawerCloseState = DialogCloseState;

export namespace DrawerClose {
  export type Props = DrawerCloseProps;
  export type State = DrawerCloseState;
}
