import { createSignal, type Accessor, type JSX } from "solid-js";
import type { TextDirection } from "../../direction-provider/DirectionContext";
import type { DomProps } from "../../merge-props/combineProps";
import {
  ALL_KEYS,
  ARROW_DOWN,
  ARROW_KEYS,
  ARROW_LEFT,
  ARROW_RIGHT,
  ARROW_UP,
  createGridCellMap,
  END,
  findNonDisabledListIndex,
  getGridCellIndexOfCorner,
  getGridCellIndices,
  getGridNavigatedIndex,
  getMaxListIndex,
  getMinListIndex,
  HORIZONTAL_KEYS,
  HORIZONTAL_KEYS_WITH_EXTRA_KEYS,
  isIndexOutOfListBounds,
  isListIndexDisabled,
  isNativeInput,
  MODIFIER_KEYS,
  scrollIntoViewIfNeeded,
  type Dimensions,
  type DisabledIndices,
  type ElementListRef,
  type ModifierKey,
  VERTICAL_KEYS,
  VERTICAL_KEYS_WITH_EXTRA_KEYS,
  HOME,
} from "../composite";
import { ACTIVE_COMPOSITE_ITEM } from "../constants";
import type { CompositeMetadata } from "../list/CompositeList";

const EMPTY_MODIFIER_KEYS: ReadonlyArray<ModifierKey> = [];

type Orientation = "horizontal" | "vertical" | "both";

export interface UseCompositeRootParameters {
  orientation: Accessor<Orientation | undefined>;
  cols: Accessor<number | undefined>;
  loopFocus: Accessor<boolean | undefined>;
  highlightedIndex: Accessor<number | undefined>;
  onHighlightedIndexChange: Accessor<((index: number) => void) | undefined>;
  dense: Accessor<boolean | undefined>;
  direction: Accessor<TextDirection>;
  itemSizes: Accessor<Array<Dimensions> | undefined>;
  rootRef: Accessor<((element: HTMLElement | null) => void) | undefined>;
  enableHomeAndEndKeys: Accessor<boolean | undefined>;
  stopEventPropagation: Accessor<boolean | undefined>;
  disabledIndices: Accessor<DisabledIndices | undefined>;
  modifierKeys: Accessor<ReadonlyArray<ModifierKey> | undefined>;
}

export interface UseCompositeRootReturnValue {
  getRootProps: (externalProps?: DomProps<HTMLDivElement>) => DomProps<HTMLDivElement>;
  highlightedIndex: Accessor<number>;
  onHighlightedIndexChange: (index: number, shouldScrollIntoView?: boolean) => void;
  elementsRef: ElementListRef<HTMLElement>;
  disabledIndices: Accessor<DisabledIndices | undefined>;
  onMapChange: (map: Map<Element, CompositeMetadata>) => void;
  relayKeyboardEvent: (event: KeyboardEvent) => void;
}

export function useCompositeRoot(params: UseCompositeRootParameters): UseCompositeRootReturnValue {
  const [internalHighlightedIndex, setInternalHighlightedIndex] = createSignal<number>(0);

  const elementsRef: ElementListRef<HTMLElement> = {
    current: [],
  };

  const rootElementRef = {
    current: null as HTMLElement | null,
  };

  let hasSetDefaultIndex = false;

  const highlightedIndex = () => params.highlightedIndex() ?? internalHighlightedIndex();

  const onHighlightedIndexChange = (index: number, shouldScrollIntoView = false) => {
    const setExternalHighlightedIndex = params.onHighlightedIndexChange();

    if (setExternalHighlightedIndex !== undefined) {
      setExternalHighlightedIndex(index);
    } else {
      setInternalHighlightedIndex(index);
    }

    if (shouldScrollIntoView) {
      const newActiveItem = elementsRef.current[index] ?? null;
      scrollIntoViewIfNeeded(
        rootElementRef.current,
        newActiveItem,
        params.direction(),
        params.orientation() ?? "both",
      );
    }
  };

  const onMapChange = (map: Map<Element, CompositeMetadata>) => {
    if (map.size === 0 || hasSetDefaultIndex) {
      return;
    }

    hasSetDefaultIndex = true;

    const sortedElements = Array.from(map.keys());
    const activeItemCandidate = sortedElements.find((element) =>
      element.hasAttribute(ACTIVE_COMPOSITE_ITEM),
    );
    const activeItem =
      activeItemCandidate !== undefined && activeItemCandidate instanceof HTMLElement
        ? activeItemCandidate
        : null;

    const activeIndex = activeItem === null ? -1 : sortedElements.indexOf(activeItem);

    if (activeIndex !== -1) {
      onHighlightedIndexChange(activeIndex);
    }

    scrollIntoViewIfNeeded(
      rootElementRef.current,
      activeItem,
      params.direction(),
      params.orientation() ?? "both",
    );
  };

  const handleKeyDown = (event: KeyboardEvent) => {
    const orientation = params.orientation() ?? "both";
    const cols = params.cols() ?? 1;
    const loopFocus = params.loopFocus() ?? true;
    const dense = params.dense() ?? false;
    const enableHomeAndEndKeys = params.enableHomeAndEndKeys() ?? false;
    const stopEventPropagation = params.stopEventPropagation() ?? false;
    const disabledIndices = params.disabledIndices();
    const modifierKeys = params.modifierKeys() ?? EMPTY_MODIFIER_KEYS;

    const relevantKeys = enableHomeAndEndKeys ? ALL_KEYS : ARROW_KEYS;

    if (!relevantKeys.has(event.key)) {
      return;
    }

    if (isModifierKeySet(event, modifierKeys)) {
      return;
    }

    const rootElement = rootElementRef.current;
    if (rootElement === null) {
      return;
    }

    const isRtl = params.direction() === "rtl";

    const horizontalForwardKey = isRtl ? ARROW_LEFT : ARROW_RIGHT;
    const forwardKey = {
      horizontal: horizontalForwardKey,
      vertical: ARROW_DOWN,
      both: horizontalForwardKey,
    }[orientation];

    const horizontalBackwardKey = isRtl ? ARROW_RIGHT : ARROW_LEFT;
    const backwardKey = {
      horizontal: horizontalBackwardKey,
      vertical: ARROW_UP,
      both: horizontalBackwardKey,
    }[orientation];

    if (event.target !== null && isNativeInput(event.target) && !isElementDisabled(event.target)) {
      const selectionStart = event.target.selectionStart;
      const selectionEnd = event.target.selectionEnd;
      const textContent = event.target.value;

      if (selectionStart === null || event.shiftKey || selectionStart !== selectionEnd) {
        return;
      }

      if (event.key !== backwardKey && selectionStart < textContent.length) {
        return;
      }

      if (event.key !== forwardKey && selectionStart > 0) {
        return;
      }
    }

    const isGrid = cols > 1;

    let nextIndex = highlightedIndex();
    const minIndex = getMinListIndex(elementsRef, disabledIndices);
    const maxIndex = getMaxListIndex(elementsRef, disabledIndices);

    if (minIndex === -1 || maxIndex === -1) {
      return;
    }

    if (isGrid) {
      const sizes =
        params.itemSizes() ??
        Array.from({ length: elementsRef.current.length }, () => ({ width: 1, height: 1 }));

      const cellMap = createGridCellMap(sizes, cols, dense);

      const minGridIndex: number = cellMap.findIndex(
        (listIndex) =>
          listIndex !== undefined && !isListIndexDisabled(elementsRef, listIndex, disabledIndices),
      );

      let maxGridIndex = -1;
      cellMap.forEach((listIndex, cellIndex) => {
        if (
          listIndex !== undefined &&
          !isListIndexDisabled(elementsRef, listIndex, disabledIndices)
        ) {
          maxGridIndex = cellIndex;
        }
      });

      const indexedDisabledItems = elementsRef.current
        .map((_, index) =>
          isListIndexDisabled(elementsRef, index, disabledIndices) ? index : undefined,
        )
        .filter((value): value is number => value !== undefined);

      const navigatedCellIndex = getGridNavigatedIndex(
        {
          current: cellMap.map((itemIndex) =>
            itemIndex === undefined ? null : (elementsRef.current[itemIndex] ?? null),
          ),
        },
        {
          event,
          orientation,
          loopFocus,
          cols,
          disabledIndices: getGridCellIndices([...indexedDisabledItems, undefined], cellMap),
          minIndex: minGridIndex,
          maxIndex: maxGridIndex,
          prevIndex: getGridCellIndexOfCorner(
            highlightedIndex() > maxIndex ? minIndex : highlightedIndex(),
            sizes,
            cellMap,
            cols,
            event.key === ARROW_DOWN ? "bl" : event.key === ARROW_RIGHT ? "tr" : "tl",
          ),
          rtl: isRtl,
        },
      );

      const mappedIndex = cellMap[navigatedCellIndex];
      nextIndex = mappedIndex === undefined ? nextIndex : mappedIndex;
    }

    const forwardKeys = {
      horizontal: [horizontalForwardKey],
      vertical: [ARROW_DOWN],
      both: [horizontalForwardKey, ARROW_DOWN],
    }[orientation];

    const backwardKeys = {
      horizontal: [horizontalBackwardKey],
      vertical: [ARROW_UP],
      both: [horizontalBackwardKey, ARROW_UP],
    }[orientation];

    const preventedKeys = isGrid
      ? relevantKeys
      : {
          horizontal: enableHomeAndEndKeys ? HORIZONTAL_KEYS_WITH_EXTRA_KEYS : HORIZONTAL_KEYS,
          vertical: enableHomeAndEndKeys ? VERTICAL_KEYS_WITH_EXTRA_KEYS : VERTICAL_KEYS,
          both: relevantKeys,
        }[orientation];

    if (enableHomeAndEndKeys) {
      if (event.key === HOME) {
        nextIndex = minIndex;
      } else if (event.key === END) {
        nextIndex = maxIndex;
      }
    }

    if (
      nextIndex === highlightedIndex() &&
      (forwardKeys.includes(event.key) || backwardKeys.includes(event.key))
    ) {
      if (loopFocus && nextIndex === maxIndex && forwardKeys.includes(event.key)) {
        nextIndex = minIndex;
      } else if (loopFocus && nextIndex === minIndex && backwardKeys.includes(event.key)) {
        nextIndex = maxIndex;
      } else {
        nextIndex = findNonDisabledListIndex(elementsRef, {
          startingIndex: nextIndex,
          decrement: backwardKeys.includes(event.key),
          disabledIndices,
        });
      }
    }

    if (nextIndex !== highlightedIndex() && !isIndexOutOfListBounds(elementsRef, nextIndex)) {
      if (stopEventPropagation) {
        event.stopPropagation();
      }

      if (preventedKeys.has(event.key)) {
        event.preventDefault();
      }

      onHighlightedIndexChange(nextIndex, true);

      queueMicrotask(() => {
        elementsRef.current[nextIndex]?.focus();
      });
    }
  };

  const relayKeyboardEvent = (event: KeyboardEvent) => {
    handleKeyDown(event);
  };

  const getRootProps = (externalProps: DomProps<HTMLDivElement> = {}) => {
    const {
      ref: _ref,
      onFocus: externalOnFocus,
      onKeyDown: externalOnKeyDown,
      ...restExternalProps
    } = externalProps;
    void _ref;

    const orientation = params.orientation();
    const ariaOrientation =
      orientation === "horizontal" || orientation === "vertical" ? orientation : undefined;

    return {
      ...restExternalProps,
      "aria-orientation": ariaOrientation,
      ref(element: HTMLDivElement | null) {
        rootElementRef.current = element;
        params.rootRef()?.(element);
      },
      onFocus(
        event: FocusEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
      ) {
        runEventHandler(externalOnFocus, event);

        if (event.target === null || !isNativeInput(event.target)) {
          return;
        }

        event.target.setSelectionRange(0, event.target.value.length);
      },
      onKeyDown(
        event: KeyboardEvent & { currentTarget: HTMLDivElement; target: EventTarget & Element },
      ) {
        runEventHandler(externalOnKeyDown, event);
        handleKeyDown(event);
      },
    };
  };

  return {
    getRootProps,
    highlightedIndex,
    onHighlightedIndexChange,
    elementsRef,
    disabledIndices: params.disabledIndices,
    onMapChange,
    relayKeyboardEvent,
  };
}

function isElementDisabled(element: Element): boolean {
  return element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}

function isModifierKeySet(event: KeyboardEvent, ignoredModifierKeys: ReadonlyArray<ModifierKey>) {
  for (const key of MODIFIER_KEYS.values()) {
    if (ignoredModifierKeys.includes(key)) {
      continue;
    }

    if (event.getModifierState(key)) {
      return true;
    }
  }

  return false;
}

function runEventHandler<TElement extends HTMLElement, TEvent extends Event>(
  handler: JSX.EventHandlerUnion<TElement, TEvent> | undefined,
  event: TEvent & {
    currentTarget: TElement;
    target: EventTarget & Element;
  },
) {
  if (handler === undefined) {
    return;
  }

  if (typeof handler === "function") {
    handler(event);
    return;
  }

  handler[0](handler[1], event);
}
