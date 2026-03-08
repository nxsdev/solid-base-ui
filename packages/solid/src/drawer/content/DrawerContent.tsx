import { createMemo, type JSX, type ValidComponent } from "solid-js";

/**
 * A container for the drawer contents.
 */
export function DrawerContent(props: DrawerContent.Props) {
  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const { children: _children, render: _render, ref: _ref, ...rest } = props;
    void _children;
    void _render;
    void _ref;
    return rest;
  });

  return (
    <div
      {...elementProps()}
      ref={(element) => {
        callRef(props.ref, element);
      }}
      data-swipe-ignore=""
    >
      {props.children}
    </div>
  );
}

export interface DrawerContentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface DrawerContentState {}

export namespace DrawerContent {
  export type Props = DrawerContentProps;
  export type State = DrawerContentState;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
