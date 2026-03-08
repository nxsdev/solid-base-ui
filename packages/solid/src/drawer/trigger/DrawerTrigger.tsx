import {
  DialogTrigger,
  type DialogTriggerProps,
  type DialogTriggerState,
} from "../../dialog/trigger/DialogTrigger";

/**
 * A button that opens the drawer.
 */
export function DrawerTrigger<Payload = unknown>(props: DrawerTrigger.Props<Payload>) {
  return <DialogTrigger<Payload> {...props} />;
}

export interface DrawerTriggerProps<Payload = unknown> extends DialogTriggerProps<Payload> {}

export type DrawerTriggerState = DialogTriggerState;

export namespace DrawerTrigger {
  export type Props<Payload = unknown> = DrawerTriggerProps<Payload>;
  export type State = DrawerTriggerState;
}
