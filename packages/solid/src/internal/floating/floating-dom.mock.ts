export interface AutoUpdateOptions {
  elementResize?: boolean;
  layoutShift?: boolean;
}

export interface ElementRects {
  reference: DOMRectReadOnly;
  floating: DOMRectReadOnly;
}

export interface Middleware {
  name: string;
  options?: unknown;
}

export type Padding =
  | number
  | {
      top?: number;
      right?: number;
      bottom?: number;
      left?: number;
    };

export type Placement =
  | "top"
  | "top-start"
  | "top-end"
  | "bottom"
  | "bottom-start"
  | "bottom-end"
  | "left"
  | "left-start"
  | "left-end"
  | "right"
  | "right-start"
  | "right-end";

interface ComputePositionOptions {
  placement?: Placement;
  strategy?: "absolute" | "fixed";
  middleware?: Middleware[];
}

interface SizeApplyArgs {
  availableWidth: number;
  availableHeight: number;
  rects: ElementRects;
}

interface ArrowData {
  x: number;
  y: number;
  centerOffset: number;
}

interface HideData {
  referenceHidden: boolean;
}

interface MiddlewareData {
  hide?: HideData;
  arrow?: ArrowData;
}

interface ComputePositionResult {
  x: number;
  y: number;
  placement: Placement;
  strategy: "absolute" | "fixed";
  middlewareData: MiddlewareData;
}

type UnknownFunction = (...args: readonly unknown[]) => unknown;

function isObjectRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function isFunction(value: unknown): value is UnknownFunction {
  return typeof value === "function";
}

function getSizeApply(options: unknown): ((args: SizeApplyArgs) => void) | undefined {
  if (!isObjectRecord(options)) {
    return undefined;
  }

  const apply = options["apply"];
  if (!isFunction(apply)) {
    return undefined;
  }

  return (args: SizeApplyArgs) => {
    apply(args);
  };
}

function createMiddleware(name: string, options?: unknown): Middleware {
  return {
    name,
    options,
  };
}

export function autoUpdate(
  _reference: Element,
  _floating: HTMLElement,
  _update: () => void,
  _options?: AutoUpdateOptions,
): () => void {
  return () => {};
}

export async function computePosition(
  reference: Element,
  floating: HTMLElement,
  options: ComputePositionOptions = {},
): Promise<ComputePositionResult> {
  const referenceRect = reference.getBoundingClientRect();
  const floatingRect = floating.getBoundingClientRect();
  const middlewareData: MiddlewareData = {};

  for (const middleware of options.middleware ?? []) {
    if (middleware.name === "hide") {
      middlewareData.hide = { referenceHidden: false };
      continue;
    }

    if (middleware.name === "arrow") {
      middlewareData.arrow = {
        x: floatingRect.width / 2,
        y: floatingRect.height / 2,
        centerOffset: 0,
      };
      continue;
    }

    if (middleware.name === "size") {
      const apply = getSizeApply(middleware.options);
      apply?.({
        availableWidth: window.innerWidth,
        availableHeight: window.innerHeight,
        rects: {
          reference: referenceRect,
          floating: floatingRect,
        },
      });
    }
  }

  return {
    x: 0,
    y: 0,
    placement: options.placement ?? "bottom",
    strategy: options.strategy ?? "absolute",
    middlewareData,
  };
}

export function flip(options?: unknown): Middleware {
  return createMiddleware("flip", options);
}

export function hide(options?: unknown): Middleware {
  return createMiddleware("hide", options);
}

export function limitShift(options?: unknown): Record<string, unknown> {
  return {
    options,
  };
}

export function offset(options?: unknown): Middleware {
  return createMiddleware("offset", options);
}

export function shift(options?: unknown): Middleware {
  return createMiddleware("shift", options);
}

export function size(options?: unknown): Middleware {
  return createMiddleware("size", options);
}

export function arrow(options?: unknown): Middleware {
  return createMiddleware("arrow", options);
}
