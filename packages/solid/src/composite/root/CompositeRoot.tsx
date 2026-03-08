import { createMemo, useContext, type JSX, type ValidComponent, omit } from "solid-js";
import { Dynamic } from "../../internal/Dynamic";
import { DirectionContext, type TextDirection } from "../../direction-provider/DirectionContext";
import type { Dimensions, DisabledIndices, ModifierKey } from "../composite";
import { CompositeList, type CompositeMetadata } from "../list/CompositeList";
import { CompositeRootContext, type CompositeRootContextValue } from "./CompositeRootContext";
import { useCompositeRoot } from "./useCompositeRoot";

/**
 * Internal root for composite widgets.
 */
export function CompositeRoot(props: CompositeRoot.Props) {
  const directionContext = useContext(DirectionContext);
  const direction = (): TextDirection => directionContext?.direction() ?? "ltr";

  const {
    getRootProps,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    onMapChange,
    relayKeyboardEvent,
  } = useCompositeRoot({
    itemSizes: () => props.itemSizes,
    cols: () => props.cols,
    loopFocus: () => props.loopFocus,
    dense: () => props.dense,
    orientation: () => props.orientation,
    highlightedIndex: () => props.highlightedIndex,
    onHighlightedIndexChange: () => props.onHighlightedIndexChange,
    rootRef: () => props.rootRef,
    stopEventPropagation: () => props.stopEventPropagation,
    enableHomeAndEndKeys: () => props.enableHomeAndEndKeys,
    direction,
    disabledIndices: () => props.disabledIndices,
    modifierKeys: () => props.modifierKeys,
  });

  const contextValue: CompositeRootContextValue = {
    highlightedIndex,
    onHighlightedIndexChange,
    highlightItemOnHover: () => props.highlightItemOnHover ?? false,
    relayKeyboardEvent,
  };

  const mergedProps = createMemo(() => getRootProps(omit(props, ...ROOT_OMITTED_PROP_KEYS)));
  const resolvedRender = () => props.render ?? "div";

  return (
    <CompositeRootContext value={contextValue}>
      <CompositeList
        elementsRef={elementsRef}
        onMapChange={(newMap) => {
          props.onMapChange?.(newMap);
          onMapChange(newMap);
        }}
      >
        {resolvedRender() === "div" ? (
          <div {...mergedProps()}>{props.children}</div>
        ) : (
          <Dynamic component={resolvedRender()} {...mergedProps()}>
            {props.children}
          </Dynamic>
        )}
      </CompositeList>
    </CompositeRootContext>
  );
}

export interface CompositeRootProps extends Omit<JSX.HTMLAttributes<HTMLDivElement>, "onChange"> {
  "data-disabled"?: string | undefined;
  "data-orientation"?: string | undefined;
  "data-testid"?: string | undefined;
  render?: ValidComponent | undefined;
  orientation?: "horizontal" | "vertical" | "both" | undefined;
  cols?: number | undefined;
  loopFocus?: boolean | undefined;
  highlightedIndex?: number | undefined;
  onHighlightedIndexChange?: ((index: number) => void) | undefined;
  itemSizes?: Array<Dimensions> | undefined;
  dense?: boolean | undefined;
  enableHomeAndEndKeys?: boolean | undefined;
  onMapChange?: ((newMap: Map<Element, CompositeMetadata>) => void) | undefined;
  stopEventPropagation?: boolean | undefined;
  rootRef?: ((element: HTMLElement | null) => void) | undefined;
  disabledIndices?: DisabledIndices | undefined;
  modifierKeys?: ReadonlyArray<ModifierKey> | undefined;
  highlightItemOnHover?: boolean | undefined;
}

export namespace CompositeRoot {
  export type Props = CompositeRootProps;
}

const ROOT_OMITTED_PROP_KEYS = [
  "children",
  "cols",
  "dense",
  "disabledIndices",
  "enableHomeAndEndKeys",
  "highlightItemOnHover",
  "highlightedIndex",
  "itemSizes",
  "loopFocus",
  "modifierKeys",
  "onHighlightedIndexChange",
  "onMapChange",
  "orientation",
  "render",
  "rootRef",
  "stopEventPropagation",
] as const satisfies ReadonlyArray<keyof CompositeRootProps>;
