import { ScrollAreaRootDataAttributes } from "./ScrollAreaRootDataAttributes";
import type { ScrollAreaRootState } from "./ScrollAreaRoot";

export interface ScrollAreaStateDataAttributes {
  "data-scrolling"?: "" | undefined;
  "data-has-overflow-x"?: "" | undefined;
  "data-has-overflow-y"?: "" | undefined;
  "data-overflow-x-start"?: "" | undefined;
  "data-overflow-x-end"?: "" | undefined;
  "data-overflow-y-start"?: "" | undefined;
  "data-overflow-y-end"?: "" | undefined;
}

export function getScrollAreaStateDataAttributes(
  state: ScrollAreaRootState,
): ScrollAreaStateDataAttributes {
  return {
    [ScrollAreaRootDataAttributes.scrolling]: state.scrolling ? "" : undefined,
    [ScrollAreaRootDataAttributes.hasOverflowX]: state.hasOverflowX ? "" : undefined,
    [ScrollAreaRootDataAttributes.hasOverflowY]: state.hasOverflowY ? "" : undefined,
    [ScrollAreaRootDataAttributes.overflowXStart]: state.overflowXStart ? "" : undefined,
    [ScrollAreaRootDataAttributes.overflowXEnd]: state.overflowXEnd ? "" : undefined,
    [ScrollAreaRootDataAttributes.overflowYStart]: state.overflowYStart ? "" : undefined,
    [ScrollAreaRootDataAttributes.overflowYEnd]: state.overflowYEnd ? "" : undefined,
  };
}

export function applyScrollAreaStateDataAttributes(
  element: HTMLElement,
  state: ScrollAreaRootState,
): void {
  toggleAttribute(element, ScrollAreaRootDataAttributes.scrolling, state.scrolling);
  toggleAttribute(element, ScrollAreaRootDataAttributes.hasOverflowX, state.hasOverflowX);
  toggleAttribute(element, ScrollAreaRootDataAttributes.hasOverflowY, state.hasOverflowY);
  toggleAttribute(element, ScrollAreaRootDataAttributes.overflowXStart, state.overflowXStart);
  toggleAttribute(element, ScrollAreaRootDataAttributes.overflowXEnd, state.overflowXEnd);
  toggleAttribute(element, ScrollAreaRootDataAttributes.overflowYStart, state.overflowYStart);
  toggleAttribute(element, ScrollAreaRootDataAttributes.overflowYEnd, state.overflowYEnd);
}

function toggleAttribute(element: HTMLElement, attribute: string, enabled: boolean): void {
  if (enabled) {
    element.setAttribute(attribute, "");
    return;
  }

  element.removeAttribute(attribute);
}
