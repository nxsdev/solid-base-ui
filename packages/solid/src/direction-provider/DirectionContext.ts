import { createContext, useContext } from "solid-js";
import type { Accessor } from "solid-js";

export type TextDirection = "ltr" | "rtl";

export type DirectionContextValue = {
  direction: Accessor<TextDirection>;
};

export const DirectionContext = createContext<DirectionContextValue | null>(null);

export function useDirection(): TextDirection {
  const context = useContext(DirectionContext);
  return context?.direction() ?? "ltr";
}
