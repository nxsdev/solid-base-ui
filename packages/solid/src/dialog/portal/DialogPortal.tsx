import { Show, createMemo, type JSX } from "solid-js";
import { Portal } from "@solidjs/web";
import { useDialogRootContext } from "../root/DialogRootContext";
import { DialogPortalContext } from "./DialogPortalContext";

/**
 * A portal element that moves the popup to a different part of the DOM.
 * By default, the portal element is appended to `<body>`.
 */
export function DialogPortal(props: DialogPortal.Props) {
  const dialogRootContext = useDialogRootContext();

  const keepMounted = props.keepMounted ?? false;
  const shouldRender = createMemo<boolean>(() => dialogRootContext.mounted() || keepMounted);

  const internalBackdropHidden = createMemo<boolean>(() => !dialogRootContext.open());
  const mountProps = createMemo<{ mount?: Element }>(() =>
    props.container === undefined ? {} : { mount: props.container },
  );

  return (
    <Show when={shouldRender()}>
      <DialogPortalContext value={keepMounted}>
        <Portal {...mountProps()}>
          <Show when={dialogRootContext.mounted() && dialogRootContext.modal() === true}>
            <div
              ref={(element) => {
                dialogRootContext.setInternalBackdropElement(element);
              }}
              role="presentation"
              hidden={internalBackdropHidden()}
              style={{
                position: "fixed",
                inset: "0",
              }}
              onClick={(event) => {
                if (dialogRootContext.disablePointerDismissal()) {
                  return;
                }

                dialogRootContext.requestClose(event, "outside-press", event.currentTarget);
              }}
            />
          </Show>
          {props.children}
        </Portal>
      </DialogPortalContext>
    </Show>
  );
}

export interface DialogPortalProps {
  keepMounted?: boolean | undefined;
  container?: Element | undefined;
  children?: JSX.Element | undefined;
}

export namespace DialogPortal {
  export type Props = DialogPortalProps;
}
