import { createRenderEffect } from "solid-js";

export * from "@solidjs/web";

/**
 * Compat bridge for compiler output that still calls effect(fn, initial).
 * Solid 2 runtime uses effect(fn, effectFn, initial).
 */
export function effect<TValue>(
  fn: (previous: TValue | undefined) => TValue,
  effectOrInitial?: ((value: TValue, previous: TValue | undefined) => void) | TValue,
  initial?: TValue,
): void {
  if (typeof effectOrInitial === "function" || arguments.length >= 3) {
    createRenderEffect(
      fn,
      effectOrInitial as (value: TValue, previous: TValue | undefined) => void,
      initial,
    );
    return;
  }

  createRenderEffect(fn, () => undefined, effectOrInitial);
}

/**
 * Fallback for transform output that imports `use` helper.
 */
export function use<TElement>(
  directive: ((element: TElement, accessor?: () => unknown) => void) | undefined,
  element: TElement,
  accessor?: () => unknown,
): void {
  directive?.(element, accessor);
}
