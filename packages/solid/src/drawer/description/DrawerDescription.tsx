import {
  DialogDescription,
  type DialogDescriptionProps,
  type DialogDescriptionState,
} from "../../dialog/description/DialogDescription";

/**
 * A paragraph with additional information about the drawer.
 */
export function DrawerDescription(props: DrawerDescription.Props) {
  return <DialogDescription {...props} />;
}

export interface DrawerDescriptionProps extends DialogDescriptionProps {}

export type DrawerDescriptionState = DialogDescriptionState;

export namespace DrawerDescription {
  export type Props = DrawerDescriptionProps;
  export type State = DrawerDescriptionState;
}
