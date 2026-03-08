import {
  DialogTitle,
  type DialogTitleProps,
  type DialogTitleState,
} from "../../dialog/title/DialogTitle";

/**
 * A heading that labels the drawer.
 */
export function DrawerTitle(props: DrawerTitle.Props) {
  return <DialogTitle {...props} />;
}

export interface DrawerTitleProps extends DialogTitleProps {}

export type DrawerTitleState = DialogTitleState;

export namespace DrawerTitle {
  export type Props = DrawerTitleProps;
  export type State = DrawerTitleState;
}
