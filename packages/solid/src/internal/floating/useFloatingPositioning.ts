import {
  autoUpdate,
  computePosition,
  flip,
  hide,
  limitShift,
  offset,
  shift,
  size,
  arrow as arrowMiddleware,
  type AutoUpdateOptions,
  type ElementRects,
  type Middleware,
  type Padding,
  type Placement,
} from "@floating-ui/dom";
import {
  createEffect,
  createMemo,
  createSignal,
  onCleanup,
  untrack,
  type Accessor,
} from "solid-js";
import { useDirection } from "../../direction-provider/DirectionContext";

export type FloatingSide = "top" | "bottom" | "left" | "right" | "inline-end" | "inline-start";
export type FloatingAlign = "start" | "center" | "end";
export type FloatingBoundary = "clipping-ancestors" | Element | Element[];

export interface FloatingOffsetData {
  side: FloatingSide;
  align: FloatingAlign;
  anchor: { width: number; height: number };
  positioner: { width: number; height: number };
}

export type FloatingOffset = number | ((data: FloatingOffsetData) => number);

interface SideFlipMode {
  side?: "flip" | "none" | undefined;
  align?: "flip" | "shift" | "none" | undefined;
  fallbackAxisSide?: "start" | "end" | "none" | undefined;
}

interface SideShiftMode {
  side?: "shift" | "none" | undefined;
  align?: "shift" | "none" | undefined;
  fallbackAxisSide?: "start" | "end" | "none" | undefined;
}

export type FloatingCollisionAvoidance = SideFlipMode | SideShiftMode;

export interface UseFloatingPositioningParameters {
  mounted: Accessor<boolean>;
  referenceElement: Accessor<Element | null | undefined>;
  floatingElement: Accessor<HTMLElement | null>;
  arrowElement?: Accessor<HTMLElement | null> | undefined;
  side?: Accessor<FloatingSide> | undefined;
  align?: Accessor<FloatingAlign> | undefined;
  positionMethod?: Accessor<"absolute" | "fixed"> | undefined;
  sideOffset?: Accessor<FloatingOffset> | undefined;
  alignOffset?: Accessor<FloatingOffset> | undefined;
  collisionBoundary?: Accessor<FloatingBoundary | undefined> | undefined;
  collisionPadding?: Accessor<number | Padding | undefined> | undefined;
  arrowPadding?: Accessor<number> | undefined;
  sticky?: Accessor<boolean> | undefined;
  disableAnchorTracking?: Accessor<boolean> | undefined;
  collisionAvoidance?: Accessor<FloatingCollisionAvoidance | undefined> | undefined;
}

export interface FloatingPositioningResult {
  style: Accessor<Record<string, string | undefined>>;
  arrowStyle: Accessor<Record<string, string | undefined>>;
  side: Accessor<FloatingSide>;
  align: Accessor<FloatingAlign>;
  physicalSide: Accessor<"top" | "bottom" | "left" | "right">;
  anchorHidden: Accessor<boolean>;
  arrowUncentered: Accessor<boolean>;
}

export function useFloatingPositioning(
  params: UseFloatingPositioningParameters,
): FloatingPositioningResult {
  const direction = useDirection();

  const [x, setX] = createSignal<number | null>(null);
  const [y, setY] = createSignal<number | null>(null);
  const [logicalSide, setLogicalSide] = createSignal<FloatingSide>(
    untrack(() => params.side?.() ?? "bottom"),
  );
  const [renderedAlign, setRenderedAlign] = createSignal<FloatingAlign>(
    untrack(() => params.align?.() ?? "center"),
  );
  const [renderedPhysicalSide, setRenderedPhysicalSide] = createSignal<
    "top" | "bottom" | "left" | "right"
  >("bottom");
  const [isPositioned, setIsPositioned] = createSignal(false);
  const [isAnchorHidden, setIsAnchorHidden] = createSignal(false);
  const [arrowX, setArrowX] = createSignal<number | null>(null);
  const [arrowY, setArrowY] = createSignal<number | null>(null);
  const [isArrowUncentered, setIsArrowUncentered] = createSignal(false);
  const [availableWidth, setAvailableWidth] = createSignal<number | null>(null);
  const [availableHeight, setAvailableHeight] = createSignal<number | null>(null);
  const [anchorWidth, setAnchorWidth] = createSignal<number | null>(null);
  const [anchorHeight, setAnchorHeight] = createSignal<number | null>(null);

  let updateSequence = 0;

  const resolveSide = () => params.side?.() ?? "bottom";
  const resolveAlign = () => params.align?.() ?? "center";
  const resolvePositionMethod = () => params.positionMethod?.() ?? "absolute";
  const resolveSideOffset = () => params.sideOffset?.() ?? 0;
  const resolveAlignOffset = () => params.alignOffset?.() ?? 0;
  const resolveCollisionBoundary = () => params.collisionBoundary?.() ?? "clipping-ancestors";
  const resolveCollisionPadding = () => params.collisionPadding?.() ?? 5;
  const resolveArrowPadding = () => params.arrowPadding?.() ?? 5;
  const resolveSticky = () => params.sticky?.() ?? false;
  const resolveDisableAnchorTracking = () => params.disableAnchorTracking?.() ?? false;
  const resolveCollisionAvoidance = () =>
    params.collisionAvoidance?.() ?? DEFAULT_COLLISION_AVOIDANCE;

  const updatePosition = async () => {
    const mounted = untrack(params.mounted);
    if (!mounted) {
      setIsPositioned((previous) => (previous ? false : previous));
      return;
    }

    const reference = untrack(params.referenceElement);
    const floating = untrack(params.floatingElement);

    if (reference == null || floating === null) {
      setIsPositioned((previous) => (previous ? false : previous));
      return;
    }

    const side = untrack(resolveSide);
    const align = untrack(resolveAlign);
    const isRtl = direction === "rtl";
    const physicalSide = toPhysicalSide(side, isRtl);
    const placement = (align === "center" ? physicalSide : `${physicalSide}-${align}`) as Placement;

    const collisionAvoidance = untrack(resolveCollisionAvoidance);
    const sideCollisionMode = collisionAvoidance.side ?? "flip";
    const alignCollisionMode = collisionAvoidance.align ?? "flip";
    const fallbackAxisSide = collisionAvoidance.fallbackAxisSide ?? "end";
    const sideOffset = untrack(resolveSideOffset);
    const alignOffset = untrack(resolveAlignOffset);
    const collisionBoundary = untrack(resolveCollisionBoundary);
    const collisionPadding = untrack(resolveCollisionPadding);
    const sticky = untrack(resolveSticky);
    const arrowPadding = untrack(resolveArrowPadding);
    const positionMethod = untrack(resolvePositionMethod);

    const middleware: Middleware[] = [
      offset((state) => {
        const data = createOffsetData(state.rects, state.placement, side, isRtl);

        const main = typeof sideOffset === "function" ? sideOffset(data) : sideOffset;
        const cross = typeof alignOffset === "function" ? alignOffset(data) : alignOffset;

        return {
          mainAxis: main,
          crossAxis: cross,
          alignmentAxis: cross,
        };
      }),
      buildFlipMiddleware({
        boundary: collisionBoundary,
        padding: collisionPadding,
        sideCollisionMode,
        alignCollisionMode,
        fallbackAxisSide,
      }),
      buildShiftMiddleware({
        boundary: collisionBoundary,
        padding: collisionPadding,
        sideCollisionMode,
        alignCollisionMode,
        sticky,
      }),
      size({
        boundary: toFloatingBoundary(collisionBoundary),
        padding: collisionPadding,
        apply({ availableWidth: w, availableHeight: h, rects }) {
          setAvailableWidth((previous) => (previous === w ? previous : w));
          setAvailableHeight((previous) => (previous === h ? previous : h));
          setAnchorWidth((previous) =>
            previous === rects.reference.width ? previous : rects.reference.width,
          );
          setAnchorHeight((previous) =>
            previous === rects.reference.height ? previous : rects.reference.height,
          );
        },
      }),
      hide(),
    ];

    const arrowElement = untrack(() => params.arrowElement?.() ?? null);
    if (arrowElement !== null) {
      middleware.push(
        arrowMiddleware({
          element: arrowElement,
          padding: arrowPadding,
        }),
      );
    }

    const sequence = ++updateSequence;
    const result = await computePosition(reference, floating, {
      placement,
      strategy: positionMethod,
      middleware,
    });

    if (sequence !== updateSequence) {
      return;
    }

    setX((previous) => (previous === result.x ? previous : result.x));
    setY((previous) => (previous === result.y ? previous : result.y));
    setIsPositioned((previous) => (previous ? previous : true));

    const actualSide = getPlacementSide(result.placement);
    const nextLogicalSide = toLogicalSide(actualSide, side, isRtl);
    const nextAlign = getPlacementAlign(result.placement);
    const nextAnchorHidden = Boolean(result.middlewareData.hide?.referenceHidden);

    setRenderedPhysicalSide((previous) => (previous === actualSide ? previous : actualSide));
    setLogicalSide((previous) => (previous === nextLogicalSide ? previous : nextLogicalSide));
    setRenderedAlign((previous) => (previous === nextAlign ? previous : nextAlign));
    setIsAnchorHidden((previous) => (previous === nextAnchorHidden ? previous : nextAnchorHidden));

    const nextArrowX = result.middlewareData.arrow?.x;
    const nextArrowY = result.middlewareData.arrow?.y;
    const resolvedArrowX = typeof nextArrowX === "number" ? nextArrowX : null;
    const resolvedArrowY = typeof nextArrowY === "number" ? nextArrowY : null;
    const nextArrowUncentered = (result.middlewareData.arrow?.centerOffset ?? 0) !== 0;

    setArrowX((previous) => (previous === resolvedArrowX ? previous : resolvedArrowX));
    setArrowY((previous) => (previous === resolvedArrowY ? previous : resolvedArrowY));
    setIsArrowUncentered((previous) =>
      previous === nextArrowUncentered ? previous : nextArrowUncentered,
    );
  };

  createEffect(
    () =>
      [
        params.mounted(),
        params.referenceElement(),
        params.floatingElement(),
        params.arrowElement?.(),
        resolveSide(),
        resolveAlign(),
        resolvePositionMethod(),
        resolveSideOffset(),
        resolveAlignOffset(),
        resolveCollisionBoundary(),
        resolveCollisionPadding(),
        resolveArrowPadding(),
        resolveSticky(),
        resolveDisableAnchorTracking(),
        resolveCollisionAvoidance(),
      ] as const,
    () => {
      void updatePosition();
    },
  );

  createEffect(
    () =>
      [
        params.mounted(),
        params.referenceElement(),
        params.floatingElement(),
        resolveDisableAnchorTracking(),
      ] as const,
    ([mounted, reference, floating, disableTracking]) => {
      if (!mounted || reference == null || floating === null) {
        return;
      }

      const options: AutoUpdateOptions = {
        elementResize: !disableTracking && typeof ResizeObserver !== "undefined",
        layoutShift: !disableTracking && typeof IntersectionObserver !== "undefined",
      };

      const cleanup = autoUpdate(
        reference,
        floating,
        () => {
          void updatePosition();
        },
        options,
      );
      onCleanup(cleanup);
    },
  );

  const style = createMemo<Record<string, string | undefined>>(() => {
    const strategy = resolvePositionMethod();
    const left = x();
    const top = y();

    return {
      position: isPositioned() ? strategy : "fixed",
      left: left === null ? undefined : `${left}px`,
      top: top === null ? undefined : `${top}px`,
      opacity: isPositioned() ? undefined : "0",
      "--available-width": toPx(availableWidth()),
      "--available-height": toPx(availableHeight()),
      "--anchor-width": toPx(anchorWidth()),
      "--anchor-height": toPx(anchorHeight()),
    };
  });

  const arrowStyle = createMemo<Record<string, string | undefined>>(() => ({
    position: "absolute",
    left: toPx(arrowX()),
    top: toPx(arrowY()),
  }));

  return {
    style,
    arrowStyle,
    side: logicalSide,
    align: renderedAlign,
    physicalSide: renderedPhysicalSide,
    anchorHidden: isAnchorHidden,
    arrowUncentered: isArrowUncentered,
  };
}

const DEFAULT_COLLISION_AVOIDANCE: FloatingCollisionAvoidance = {
  fallbackAxisSide: "end",
};

function toPx(value: number | null): string | undefined {
  if (value === null) {
    return undefined;
  }

  return `${value}px`;
}

function toFloatingBoundary(boundary: FloatingBoundary): "clippingAncestors" | Element | Element[] {
  if (boundary === "clipping-ancestors") {
    return "clippingAncestors";
  }

  return boundary;
}

function toPhysicalSide(side: FloatingSide, isRtl: boolean): "top" | "bottom" | "left" | "right" {
  if (side === "inline-start") {
    return isRtl ? "right" : "left";
  }

  if (side === "inline-end") {
    return isRtl ? "left" : "right";
  }

  return side;
}

function toLogicalSide(
  physicalSide: "top" | "bottom" | "left" | "right",
  requestedSide: FloatingSide,
  isRtl: boolean,
): FloatingSide {
  const requestedIsLogical = requestedSide === "inline-start" || requestedSide === "inline-end";
  if (!requestedIsLogical) {
    return physicalSide;
  }

  if (physicalSide === "left") {
    return isRtl ? "inline-end" : "inline-start";
  }

  if (physicalSide === "right") {
    return isRtl ? "inline-start" : "inline-end";
  }

  return physicalSide;
}

function getPlacementSide(placement: Placement): "top" | "bottom" | "left" | "right" {
  const [side] = placement.split("-");

  if (side === "top" || side === "bottom" || side === "left" || side === "right") {
    return side;
  }

  return "bottom";
}

function getPlacementAlign(placement: Placement): FloatingAlign {
  const [, align] = placement.split("-");

  if (align === "start" || align === "end") {
    return align;
  }

  return "center";
}

function createOffsetData(
  rects: ElementRects,
  placement: Placement,
  side: FloatingSide,
  isRtl: boolean,
): FloatingOffsetData {
  const renderedSide = getPlacementSide(placement);

  return {
    side: toLogicalSide(renderedSide, side, isRtl),
    align: getPlacementAlign(placement),
    anchor: {
      width: rects.reference.width,
      height: rects.reference.height,
    },
    positioner: {
      width: rects.floating.width,
      height: rects.floating.height,
    },
  };
}

interface BuildCollisionOptions {
  boundary: FloatingBoundary;
  padding: number | Padding | undefined;
  sideCollisionMode: "flip" | "none" | "shift";
  alignCollisionMode: "flip" | "shift" | "none";
  fallbackAxisSide: "start" | "end" | "none";
}

function buildFlipMiddleware(options: BuildCollisionOptions): Middleware {
  const { boundary, padding, sideCollisionMode, alignCollisionMode, fallbackAxisSide } = options;

  return flip({
    boundary: toFloatingBoundary(boundary),
    ...(padding === undefined ? {} : { padding }),
    mainAxis: sideCollisionMode === "flip",
    crossAxis: alignCollisionMode === "flip",
    fallbackAxisSideDirection: fallbackAxisSide,
  });
}

interface BuildShiftOptions {
  boundary: FloatingBoundary;
  padding: number | Padding | undefined;
  sideCollisionMode: "flip" | "none" | "shift";
  alignCollisionMode: "flip" | "shift" | "none";
  sticky: boolean;
}

function buildShiftMiddleware(options: BuildShiftOptions): Middleware {
  const { boundary, padding, sideCollisionMode, alignCollisionMode, sticky } = options;

  const crossAxisShiftEnabled = sticky || sideCollisionMode === "shift";

  return shift({
    boundary: toFloatingBoundary(boundary),
    ...(padding === undefined ? {} : { padding }),
    mainAxis: alignCollisionMode !== "none",
    crossAxis: crossAxisShiftEnabled,
    ...(sticky ? {} : { limiter: limitShift() }),
  });
}
