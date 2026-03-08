import { Show, createMemo, createSignal, type JSX, type ValidComponent } from "solid-js";
import type { Padding } from "@floating-ui/dom";
import { useDialogPortalContext } from "../../dialog/portal/DialogPortalContext";
import { useDialogRootContext } from "../../dialog/root/DialogRootContext";
import {
  useFloatingPositioning,
  type FloatingAlign,
  type FloatingBoundary,
  type FloatingCollisionAvoidance,
  type FloatingOffset,
  type FloatingSide,
} from "../../internal/floating/useFloatingPositioning";
import {
  PreviewCardPositionerContext,
  type PreviewCardPositionerContextValue,
} from "./PreviewCardPositionerContext";
import { PreviewCardPositionerDataAttributes } from "./PreviewCardPositionerDataAttributes";

/**
 * Positions the preview card against the trigger.
 */
export function PreviewCardPositioner(props: PreviewCardPositioner.Props) {
  const keepMounted = useDialogPortalContext();
  const previewCardRootContext = useDialogRootContext();

  const shouldRender = createMemo<boolean>(() => keepMounted || previewCardRootContext.mounted());
  const side = createMemo<FloatingSide>(() => props.side ?? "bottom");
  const align = createMemo<FloatingAlign>(() => props.align ?? "center");
  const positionMethod = createMemo<"absolute" | "fixed">(() => props.positionMethod ?? "absolute");
  const sideOffset = createMemo<FloatingOffset>(() => props.sideOffset ?? 0);
  const alignOffset = createMemo<FloatingOffset>(() => props.alignOffset ?? 0);
  const collisionBoundary = createMemo<FloatingBoundary | undefined>(() => props.collisionBoundary);
  const collisionPadding = createMemo<number | Padding | undefined>(() => props.collisionPadding);
  const arrowPadding = createMemo<number>(() => props.arrowPadding ?? 5);
  const sticky = createMemo<boolean>(() => props.sticky ?? false);
  const disableAnchorTracking = createMemo<boolean>(() => props.disableAnchorTracking ?? false);
  const collisionAvoidance = createMemo<FloatingCollisionAvoidance | undefined>(
    () => props.collisionAvoidance,
  );

  const [positionerElement, setPositionerElementState] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });
  const [arrowElement, setArrowElementState] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });

  const referenceElement = createMemo<Element | null | undefined>(() =>
    resolveAnchorElement(props.anchor, previewCardRootContext.activeTriggerElement()),
  );

  const positioning = useFloatingPositioning({
    mounted: previewCardRootContext.mounted,
    referenceElement,
    floatingElement: positionerElement,
    arrowElement,
    side,
    align,
    positionMethod,
    sideOffset,
    alignOffset,
    collisionBoundary,
    collisionPadding,
    arrowPadding,
    sticky,
    disableAnchorTracking,
    collisionAvoidance,
  });

  const style = createMemo<JSX.CSSProperties>(() => {
    const inputStyle = toStyleObject(props.style);

    return {
      ...positioning.style(),
      pointerEvents: previewCardRootContext.open() ? undefined : "none",
      ...inputStyle,
    };
  });

  const elementProps = createMemo<JSX.HTMLAttributes<HTMLDivElement>>(() => {
    const {
      children: _children,
      render: _render,
      ref: _ref,
      style: _style,
      anchor: _anchor,
      positionMethod: _positionMethod,
      side: _side,
      align: _align,
      sideOffset: _sideOffset,
      alignOffset: _alignOffset,
      collisionBoundary: _collisionBoundary,
      collisionPadding: _collisionPadding,
      arrowPadding: _arrowPadding,
      sticky: _sticky,
      disableAnchorTracking: _disableAnchorTracking,
      collisionAvoidance: _collisionAvoidance,
      ...rest
    } = props;
    void _children;
    void _render;
    void _ref;
    void _style;
    void _anchor;
    void _positionMethod;
    void _side;
    void _align;
    void _sideOffset;
    void _alignOffset;
    void _collisionBoundary;
    void _collisionPadding;
    void _arrowPadding;
    void _sticky;
    void _disableAnchorTracking;
    void _collisionAvoidance;
    return rest;
  });

  const contextValue: PreviewCardPositionerContextValue = {
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    arrowStyle: positioning.arrowStyle,
    arrowUncentered: positioning.arrowUncentered,
    setArrowElement(element) {
      setArrowElementState((previous) => (previous === element ? previous : element));
    },
  };

  return (
    <Show when={shouldRender()}>
      <PreviewCardPositionerContext value={contextValue}>
        <div
          {...elementProps()}
          ref={(element) => {
            setPositionerElementState((previous) => (previous === element ? previous : element));
            callRef(props.ref, element);
          }}
          role="presentation"
          hidden={!previewCardRootContext.mounted()}
          {...{
            [PreviewCardPositionerDataAttributes.open]: previewCardRootContext.open()
              ? ""
              : undefined,
            [PreviewCardPositionerDataAttributes.closed]: previewCardRootContext.open()
              ? undefined
              : "",
            [PreviewCardPositionerDataAttributes.anchorHidden]: positioning.anchorHidden()
              ? ""
              : undefined,
            [PreviewCardPositionerDataAttributes.side]: positioning.side(),
            [PreviewCardPositionerDataAttributes.align]: positioning.align(),
          }}
          style={style()}
        >
          {props.children}
        </div>
      </PreviewCardPositionerContext>
    </Show>
  );
}

export interface PreviewCardPositionerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
  anchor?: Element | string | undefined;
  positionMethod?: "absolute" | "fixed" | undefined;
  side?: PreviewCardPositioner.Side | undefined;
  align?: PreviewCardPositioner.Align | undefined;
  sideOffset?: FloatingOffset | undefined;
  alignOffset?: FloatingOffset | undefined;
  collisionBoundary?: FloatingBoundary | undefined;
  collisionPadding?: number | Padding | undefined;
  arrowPadding?: number | undefined;
  sticky?: boolean | undefined;
  disableAnchorTracking?: boolean | undefined;
  collisionAvoidance?: FloatingCollisionAvoidance | undefined;
}

export interface PreviewCardPositionerState {
  open: boolean;
  side: PreviewCardPositioner.Side;
  align: PreviewCardPositioner.Align;
  anchorHidden: boolean;
}

export namespace PreviewCardPositioner {
  export type Props = PreviewCardPositionerProps;
  export type State = PreviewCardPositionerState;
  export type Side = "top" | "bottom" | "left" | "right" | "inline-start" | "inline-end";
  export type Align = "start" | "center" | "end";
}

function resolveAnchorElement(
  anchor: Element | string | undefined,
  fallback: HTMLElement | undefined,
): Element | null | undefined {
  if (anchor instanceof Element) {
    return anchor;
  }

  if (typeof anchor === "string") {
    return document.querySelector(anchor);
  }

  return fallback ?? null;
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
