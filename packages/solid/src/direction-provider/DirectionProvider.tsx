import {
  DirectionContext,
  type DirectionContextValue,
  type TextDirection,
} from "./DirectionContext";
import { createMemo, type JSX } from "solid-js";

/**
 * Enables RTL behavior for Base UI components.
 */
export function DirectionProvider(props: DirectionProvider.Props) {
  const direction = createMemo<TextDirection>(() => props.direction ?? "ltr");
  const contextValue: DirectionContextValue = {
    direction,
  };

  return <DirectionContext value={contextValue}>{props.children}</DirectionContext>;
}

export interface DirectionProviderProps {
  children?: JSX.Element | undefined;
  /**
   * The reading direction of the text.
   * @default "ltr"
   */
  direction?: TextDirection | undefined;
}

export namespace DirectionProvider {
  export type Props = DirectionProviderProps;
}
