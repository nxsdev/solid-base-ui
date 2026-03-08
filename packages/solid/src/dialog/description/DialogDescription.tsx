import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useDialogRootContext } from "../root/DialogRootContext";

/**
 * A paragraph with additional information about the dialog.
 */
export function DialogDescription(props: DialogDescription.Props) {
  const dialogRootContext = useDialogRootContext();

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (descriptionId) => {
    dialogRootContext.setDescriptionElementId(descriptionId);

    onCleanup(() => {
      if (dialogRootContext.descriptionElementId() === descriptionId) {
        dialogRootContext.setDescriptionElementId(undefined);
      }
    });
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLParagraphElement>>(() => {
    const { children: _children, render: _render, id: _id, ref: _ref, ...rest } = props;
    void _children;
    void _render;
    void _id;
    void _ref;
    return rest;
  });

  return (
    <p
      {...elementProps()}
      id={id()}
      ref={(element) => {
        callRef(props.ref, element);
      }}
    >
      {props.children}
    </p>
  );
}

export interface DialogDescriptionProps extends JSX.HTMLAttributes<HTMLParagraphElement> {
  render?: ValidComponent | undefined;
}

export interface DialogDescriptionState {}

export namespace DialogDescription {
  export type Props = DialogDescriptionProps;
  export type State = DialogDescriptionState;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
