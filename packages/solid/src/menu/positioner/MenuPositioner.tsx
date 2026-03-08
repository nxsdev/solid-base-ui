import { createMemo, createSignal, type JSX, type ValidComponent, omit } from "solid-js";
import type { Padding } from "@floating-ui/dom";
import {
  useFloatingPositioning,
  type FloatingAlign,
  type FloatingBoundary,
  type FloatingCollisionAvoidance,
  type FloatingOffset,
  type FloatingSide,
} from "../../internal/floating/useFloatingPositioning";
import { useMenuRootContext } from "../root/MenuRootContext";
import { useMenuSubmenuRootContext } from "../submenu-root/MenuSubmenuRootContext";
import { MenuPositionerContext, type MenuPositionerContextValue } from "./MenuPositionerContext";
import { MenuPositionerDataAttributes } from "./MenuPositionerDataAttributes";

/**
 * Positions the menu popup against the trigger.
 *
 * Documentation: [Base UI Menu](https://xxxxx.com/solid/components/menu)
 */
export function MenuPositioner(props: MenuPositioner.Props) {
  const submenuRootContext = useMenuSubmenuRootContext(true);
  const menuRootContext = submenuRootContext?.menu() ?? useMenuRootContext();
  const resolvedOpen = createMemo<boolean>(() => menuRootContext.open());
  const resolvedMounted = createMemo<boolean>(() => menuRootContext.mounted());

  if (submenuRootContext !== null && submenuRootContext.menu() === null) {
    return null;
  }

  const side = createMemo<FloatingSide>(() => props.side ?? "bottom");
  const align = createMemo<FloatingAlign>(() => props.align ?? "start");
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

  const [positionerElement, setPositionerElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });
  const [arrowElement, setArrowElement] = createSignal<HTMLElement | null>(null, {
    pureWrite: true,
  });

  const referenceElement = createMemo<Element | null | undefined>(() =>
    resolveAnchorElement(props.anchor, menuRootContext.activeTriggerElement()),
  );

  const positioning = useFloatingPositioning({
    mounted: resolvedMounted,
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
      pointerEvents: resolvedOpen() ? undefined : "none",
      ...inputStyle,
    };
  });

  const elementProps = createMemo(() => omit(props, ...POSITIONER_OMITTED_PROP_KEYS));

  const contextValue: MenuPositionerContextValue = {
    side: positioning.side,
    align: positioning.align,
    anchorHidden: positioning.anchorHidden,
    arrowStyle: positioning.arrowStyle,
    arrowUncentered: positioning.arrowUncentered,
    setArrowElement(element) {
      setArrowElement((previous) => (previous === element ? previous : element));
    },
  };

  return (
    <MenuPositionerContext value={contextValue}>
      <div
        {...elementProps()}
        ref={(element) => {
          setPositionerElement((previous) => (previous === element ? previous : element));
          callRef(props.ref, element);
        }}
        role="presentation"
        hidden={!resolvedMounted()}
        {...{
          [MenuPositionerDataAttributes.open]: resolvedOpen() ? "" : undefined,
          [MenuPositionerDataAttributes.closed]: resolvedOpen() ? undefined : "",
          [MenuPositionerDataAttributes.anchorHidden]: positioning.anchorHidden() ? "" : undefined,
          [MenuPositionerDataAttributes.side]: positioning.side(),
          [MenuPositionerDataAttributes.align]: positioning.align(),
        }}
        style={style()}
      >
        {props.children}
      </div>
    </MenuPositionerContext>
  );
}

export interface MenuPositionerProps extends JSX.HTMLAttributes<HTMLDivElement> {
  render?: ValidComponent | undefined;
  anchor?: Element | string | undefined;
  positionMethod?: "absolute" | "fixed" | undefined;
  side?: MenuPositioner.Side | undefined;
  align?: MenuPositioner.Align | undefined;
  sideOffset?: FloatingOffset | undefined;
  alignOffset?: FloatingOffset | undefined;
  collisionBoundary?: FloatingBoundary | undefined;
  collisionPadding?: number | Padding | undefined;
  arrowPadding?: number | undefined;
  sticky?: boolean | undefined;
  disableAnchorTracking?: boolean | undefined;
  collisionAvoidance?: FloatingCollisionAvoidance | undefined;
}

export interface MenuPositionerState {
  open: boolean;
  side: MenuPositioner.Side;
  align: MenuPositioner.Align;
  anchorHidden: boolean;
}

export namespace MenuPositioner {
  export type Props = MenuPositionerProps;
  export type State = MenuPositionerState;
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

const POSITIONER_OMITTED_PROP_KEYS = [
  "children",
  "render",
  "ref",
  "style",
  "anchor",
  "positionMethod",
  "side",
  "align",
  "sideOffset",
  "alignOffset",
  "collisionBoundary",
  "collisionPadding",
  "arrowPadding",
  "sticky",
  "disableAnchorTracking",
  "collisionAvoidance",
] as const satisfies ReadonlyArray<keyof MenuPositionerProps>;
