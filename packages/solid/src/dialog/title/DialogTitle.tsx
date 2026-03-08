import { createEffect, createMemo, onCleanup, type JSX, type ValidComponent } from "solid-js";
import { useBaseUiId } from "../../utils/useBaseUiId";
import { useDialogRootContext } from "../root/DialogRootContext";

/**
 * A heading that labels the dialog.
 */
export function DialogTitle(props: DialogTitle.Props) {
  const dialogRootContext = useDialogRootContext();

  const generatedId = useBaseUiId();
  const id = createMemo<string>(() => (typeof props.id === "string" ? props.id : generatedId));

  createEffect(id, (titleId) => {
    dialogRootContext.setTitleElementId(titleId);

    onCleanup(() => {
      if (dialogRootContext.titleElementId() === titleId) {
        dialogRootContext.setTitleElementId(undefined);
      }
    });
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLHeadingElement>>(() => {
    const { children: _children, render: _render, id: _id, ref: _ref, ...rest } = props;
    void _children;
    void _render;
    void _id;
    void _ref;
    return rest;
  });

  return (
    <h2
      {...elementProps()}
      id={id()}
      ref={(element) => {
        callRef(props.ref, element);
      }}
    >
      {props.children}
    </h2>
  );
}

export interface DialogTitleProps extends JSX.HTMLAttributes<HTMLHeadingElement> {
  render?: ValidComponent | undefined;
}

export interface DialogTitleState {}

export namespace DialogTitle {
  export type Props = DialogTitleProps;
  export type State = DialogTitleState;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
