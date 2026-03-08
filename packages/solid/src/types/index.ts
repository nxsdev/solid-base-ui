import type { JSX } from "solid-js";

export type HTMLProps<TElement extends HTMLElement = HTMLElement> = JSX.HTMLAttributes<TElement> & {
  ref?: JSX.Ref<TElement> | undefined;
};

/**
 * Shape of the render prop callback.
 */
export type ComponentRenderFn<Props, State> = (props: Props, state: State) => JSX.Element;

export type BaseUIEvent<E extends Event> = E & {
  preventBaseUIHandler: () => void;
  readonly baseUIHandlerPrevented?: boolean | undefined;
};

export type BaseUIChangeEventDetails<
  Reason extends string,
  CustomProperties extends object = {},
> = {
  reason: Reason;
  event: Event;
  cancel: () => void;
  allowPropagation: () => void;
  isCanceled: boolean;
  isPropagationAllowed: boolean;
  trigger: Element | undefined;
} & CustomProperties;

export type BaseUIGenericEventDetails<
  Reason extends string,
  CustomProperties extends object = {},
> = {
  reason: Reason;
  event: Event;
} & CustomProperties;

export type Simplify<T> = T extends (...args: never[]) => unknown ? T : { [K in keyof T]: T[K] };

export type RequiredExcept<T, K extends keyof T> = Required<Omit<T, K>> & Pick<T, K>;

export type Orientation = "horizontal" | "vertical";
