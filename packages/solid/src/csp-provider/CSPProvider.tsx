import { CSPContext, type CSPContextValue } from "./CSPContext";
import type { JSX } from "solid-js";

/**
 * Provides Content Security Policy (CSP) configuration to components.
 */
export function CSPProvider(props: CSPProvider.Props) {
  const nonce = () => props.nonce;
  const disableStyleElements = () => props.disableStyleElements ?? false;

  const contextValue: CSPContextValue = {
    nonce,
    disableStyleElements,
  };

  return <CSPContext value={contextValue}>{props.children}</CSPContext>;
}

export interface CSPProviderState {}

export interface CSPProviderProps {
  children?: JSX.Element | undefined;
  /**
   * The nonce value applied to inline style/script elements.
   */
  nonce?: string | undefined;
  /**
   * Whether inline style elements created by components should be disabled.
   * @default false
   */
  disableStyleElements?: boolean | undefined;
}

export namespace CSPProvider {
  export type State = CSPProviderState;
  export type Props = CSPProviderProps;
}
