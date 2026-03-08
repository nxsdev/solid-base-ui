import { createContext, useContext } from "solid-js";
import type { Accessor } from "solid-js";

export interface CSPContextValue {
  nonce: Accessor<string | undefined>;
  disableStyleElements: Accessor<boolean>;
}

export const CSPContext = createContext<CSPContextValue | null>(null);

const DEFAULT_CSP_CONTEXT_VALUE: CSPContextValue = {
  nonce: () => undefined,
  disableStyleElements: () => false,
};

export function useCSPContext(): CSPContextValue {
  return useContext(CSPContext) ?? DEFAULT_CSP_CONTEXT_VALUE;
}
