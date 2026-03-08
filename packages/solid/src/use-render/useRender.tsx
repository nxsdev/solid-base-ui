import type { JSX, ValidComponent } from "solid-js";
import { Dynamic } from "@solidjs/web";

type DataAttributes = {
  [K in `data-${string}`]?: string | number | boolean | undefined;
};

export type RenderElementProps<TElement extends HTMLElement = HTMLElement> =
  JSX.HTMLAttributes<TElement> &
    DataAttributes & {
      role?: JSX.AriaAttributes["role"] | undefined;
    };

export interface UseRenderParameters<
  TElement extends HTMLElement = HTMLElement,
  TProps extends object = RenderElementProps<TElement>,
> {
  /**
   * Override the rendered element/component.
   */
  render?: ValidComponent | undefined;
  /**
   * Fallback element/component when `render` is not set.
   * @default "div"
   */
  defaultTagName?: ValidComponent | undefined;
  /**
   * Props for the rendered element.
   */
  props?: TProps | undefined;
  /**
   * Ref callback for the rendered element.
   */
  ref?: ((element: TElement | null) => void) | undefined;
  /**
   * When false, render nothing.
   * @default true
   */
  enabled?: boolean | undefined;
  children?: JSX.Element | undefined;
}

export function useRender<
  TElement extends HTMLElement = HTMLElement,
  TProps extends object = RenderElementProps<TElement>,
>(parameters: UseRenderParameters<TElement, TProps>): JSX.Element | null {
  const { render, defaultTagName = "div", props, ref, enabled = true, children } = parameters;

  if (!enabled) {
    return null;
  }

  const component = render ?? defaultTagName;
  return (
    <Dynamic component={component} ref={ref} {...props}>
      {children}
    </Dynamic>
  );
}
