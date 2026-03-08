import { createContext, useContext, type Accessor } from "solid-js";
import type { FloatingAlign, FloatingSide } from "../../internal/floating/useFloatingPositioning";

export interface PreviewCardPositionerContextValue {
  side: Accessor<FloatingSide>;
  align: Accessor<FloatingAlign>;
  anchorHidden: Accessor<boolean>;
  arrowStyle: Accessor<Record<string, string | undefined>>;
  arrowUncentered: Accessor<boolean>;
  setArrowElement(element: HTMLElement | null): void;
}

export const PreviewCardPositionerContext = createContext<PreviewCardPositionerContextValue | null>(
  null,
);

export function usePreviewCardPositionerContext(
  optional: true,
): PreviewCardPositionerContextValue | null;
export function usePreviewCardPositionerContext(
  optional?: false,
): PreviewCardPositionerContextValue;
export function usePreviewCardPositionerContext(optional = false) {
  const context = useContext(PreviewCardPositionerContext);

  if (context === null && !optional) {
    throw new Error(
      "PreviewCardPositioner context is missing. PreviewCard parts must be placed within <PreviewCard.Positioner>.",
    );
  }

  return context;
}
