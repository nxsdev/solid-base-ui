import { createMemo, type JSX, type ValidComponent } from "solid-js";
import { useDrawerProviderContext } from "../provider/DrawerProviderContext";

/**
 * A background layer that reacts to whether a drawer is open.
 */
export function DrawerIndentBackground(props: DrawerIndentBackground.Props) {
  const drawerProviderContext = useDrawerProviderContext(true);

  const active = createMemo<boolean>(() => drawerProviderContext?.active() ?? false);

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
      data-active={active() ? "" : undefined}
      data-inactive={active() ? undefined : ""}
    >
      {props.children}
    </div>
  );
}

export interface DrawerIndentBackgroundProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface DrawerIndentBackgroundState {
  active: boolean;
}

export namespace DrawerIndentBackground {
  export type Props = DrawerIndentBackgroundProps;
  export type State = DrawerIndentBackgroundState;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
