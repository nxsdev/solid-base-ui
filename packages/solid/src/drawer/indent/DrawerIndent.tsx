import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  type JSX,
  type ValidComponent,
} from "solid-js";
import { DrawerBackdropCssVars } from "../backdrop/DrawerBackdropCssVars";
import { DrawerPopupCssVars } from "../popup/DrawerPopupCssVars";
import {
  useDrawerProviderContext,
  type DrawerVisualState,
} from "../provider/DrawerProviderContext";

/**
 * A wrapper intended to contain the app UI, styled from drawer provider state.
 */
export function DrawerIndent(props: DrawerIndent.Props) {
  const drawerProviderContext = useDrawerProviderContext(true);

  const [visualState, setVisualState] = createSignal<DrawerVisualState>({
    swipeProgress: 0,
    frontmostHeight: 0,
  });

  createEffect(
    () => drawerProviderContext?.visualStateStore,
    (visualStateStore) => {
      if (visualStateStore === undefined) {
        setVisualState(() => ({
          swipeProgress: 0,
          frontmostHeight: 0,
        }));
        return;
      }

      const syncVisualState = () => {
        setVisualState(() => visualStateStore.getSnapshot());
      };

      syncVisualState();

      const unsubscribe = visualStateStore.subscribe(syncVisualState);

      onCleanup(() => {
        unsubscribe();
        setVisualState(() => ({
          swipeProgress: 0,
          frontmostHeight: 0,
        }));
      });
    },
  );

  const active = createMemo<boolean>(() => drawerProviderContext?.active() ?? false);

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);
    const snapshot = visualState();

    return {
      [DrawerBackdropCssVars.swipeProgress]:
        snapshot.swipeProgress > 0 ? String(snapshot.swipeProgress) : "0",
      [DrawerPopupCssVars.height]:
        snapshot.frontmostHeight > 0 ? `${snapshot.frontmostHeight}px` : undefined,
      ...inputStyle,
    };
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const { children: _children, render: _render, ref: _ref, style: _style, ...rest } = props;
    void _children;
    void _render;
    void _ref;
    void _style;
    return rest;
  });

  return (
    <div
      {...elementProps()}
      ref={(element) => {
        callRef(props.ref, element);
      }}
      style={style()}
      data-active={active() ? "" : undefined}
      data-inactive={active() ? undefined : ""}
    >
      {props.children}
    </div>
  );
}

export interface DrawerIndentProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
}

export interface DrawerIndentState {
  active: boolean;
}

export namespace DrawerIndent {
  export type Props = DrawerIndentProps;
  export type State = DrawerIndentState;
}

function toStyleObject(style: JSX.CSSProperties | string | boolean | undefined): JSX.CSSProperties {
  if (style === undefined || typeof style === "string" || typeof style === "boolean") {
    return {};
  }

  return style;
}

function callRef<TElement extends HTMLElement>(
  ref: JSX.Ref<TElement> | undefined,
  element: TElement | null,
): void {
  if (typeof ref === "function" && element !== null) {
    ref(element);
  }
}
