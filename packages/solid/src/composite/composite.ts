import type { TextDirection } from "../direction-provider/DirectionContext";

export interface ElementListRef<TElement extends HTMLElement = HTMLElement> {
  current: Array<TElement | null>;
}

export interface Dimensions {
  width: number;
  height: number;
}

export type DisabledIndices = ReadonlyArray<number> | ((index: number) => boolean);

export const ARROW_UP = "ArrowUp";
export const ARROW_DOWN = "ArrowDown";
export const ARROW_LEFT = "ArrowLeft";
export const ARROW_RIGHT = "ArrowRight";
export const HOME = "Home";
export const END = "End";

export const HORIZONTAL_KEYS = new Set([ARROW_LEFT, ARROW_RIGHT]);
export const HORIZONTAL_KEYS_WITH_EXTRA_KEYS = new Set([ARROW_LEFT, ARROW_RIGHT, HOME, END]);
export const VERTICAL_KEYS = new Set([ARROW_UP, ARROW_DOWN]);
export const VERTICAL_KEYS_WITH_EXTRA_KEYS = new Set([ARROW_UP, ARROW_DOWN, HOME, END]);
export const ARROW_KEYS = new Set([...HORIZONTAL_KEYS, ...VERTICAL_KEYS]);
export const ALL_KEYS = new Set([...ARROW_KEYS, HOME, END]);
export const COMPOSITE_KEYS = new Set([ARROW_UP, ARROW_DOWN, ARROW_LEFT, ARROW_RIGHT, HOME, END]);

export const SHIFT = "Shift" as const;
export const CONTROL = "Control" as const;
export const ALT = "Alt" as const;
export const META = "Meta" as const;
export const MODIFIER_KEYS = new Set([SHIFT, CONTROL, ALT, META]);
export type ModifierKey = "Shift" | "Control" | "Alt" | "Meta";

export function stopEvent(event: Event) {
  event.preventDefault();
  event.stopPropagation();
}

export function isIndexOutOfListBounds(listRef: ElementListRef<HTMLElement>, index: number) {
  return index < 0 || index >= listRef.current.length;
}

export function getMinListIndex(
  listRef: ElementListRef<HTMLElement>,
  disabledIndices?: DisabledIndices | undefined,
) {
  return findNonDisabledListIndex(listRef, { disabledIndices });
}

export function getMaxListIndex(
  listRef: ElementListRef<HTMLElement>,
  disabledIndices?: DisabledIndices | undefined,
) {
  return findNonDisabledListIndex(listRef, {
    decrement: true,
    startingIndex: listRef.current.length,
    disabledIndices,
  });
}

export function findNonDisabledListIndex(
  listRef: ElementListRef<HTMLElement>,
  {
    startingIndex = -1,
    decrement = false,
    disabledIndices,
    amount = 1,
  }: {
    startingIndex?: number | undefined;
    decrement?: boolean | undefined;
    disabledIndices?: DisabledIndices | undefined;
    amount?: number | undefined;
  } = {},
): number {
  let index = startingIndex;

  do {
    index += decrement ? -amount : amount;
  } while (
    index >= 0 &&
    index <= listRef.current.length - 1 &&
    isListIndexDisabled(listRef, index, disabledIndices)
  );

  return index;
}

export function getGridNavigatedIndex(
  listRef: ElementListRef<HTMLElement>,
  {
    event,
    orientation,
    loopFocus,
    rtl,
    cols,
    disabledIndices,
    minIndex,
    maxIndex,
    prevIndex,
    stopEvent: stop = false,
  }: {
    event: KeyboardEvent;
    orientation: "horizontal" | "vertical" | "both";
    loopFocus: boolean;
    rtl: boolean;
    cols: number;
    disabledIndices: DisabledIndices | undefined;
    minIndex: number;
    maxIndex: number;
    prevIndex: number;
    stopEvent?: boolean | undefined;
  },
) {
  let nextIndex = prevIndex;

  let verticalDirection: "up" | "down" | undefined;
  if (event.key === ARROW_UP) {
    verticalDirection = "up";
  } else if (event.key === ARROW_DOWN) {
    verticalDirection = "down";
  }

  if (verticalDirection) {
    const rows: number[][] = [];
    const rowIndexMap: number[] = [];
    let hasRoleRow = false;
    let visibleItemCount = 0;

    {
      let currentRowElement: Element | null = null;
      let currentRowIndex = -1;

      listRef.current.forEach((element, index) => {
        if (element === null) {
          return;
        }

        visibleItemCount += 1;

        const rowElement = element.closest('[role="row"]');
        if (rowElement !== null) {
          hasRoleRow = true;
        }

        if (rowElement !== currentRowElement || currentRowIndex === -1) {
          currentRowElement = rowElement;
          currentRowIndex += 1;
          rows[currentRowIndex] = [];
        }

        rows[currentRowIndex]?.push(index);
        rowIndexMap[index] = currentRowIndex;
      });
    }

    let hasDomRows = false;
    let inferredDomCols = 0;

    if (hasRoleRow) {
      for (const row of rows) {
        const rowLength = row.length;

        if (rowLength > inferredDomCols) {
          inferredDomCols = rowLength;
        }

        if (rowLength !== cols) {
          hasDomRows = true;
        }
      }
    }

    const hasVirtualizedGaps = hasDomRows && visibleItemCount < listRef.current.length;
    const verticalCols = Math.max(1, inferredDomCols || cols);

    const navigateVertically = (direction: "up" | "down") => {
      if (!hasDomRows || prevIndex === -1) {
        return undefined;
      }

      const currentRow = rowIndexMap[prevIndex];
      if (currentRow === undefined) {
        return undefined;
      }

      const currentRowItems = rows[currentRow];
      if (currentRowItems === undefined) {
        return undefined;
      }

      const colInRow = currentRowItems.indexOf(prevIndex);
      const step = direction === "up" ? -1 : 1;

      for (let nextRow = currentRow + step, i = 0; i < rows.length; i += 1, nextRow += step) {
        if (nextRow < 0 || nextRow >= rows.length) {
          if (!loopFocus || hasVirtualizedGaps) {
            return undefined;
          }
          nextRow = nextRow < 0 ? rows.length - 1 : 0;
        }

        const targetRow = rows[nextRow];
        if (targetRow === undefined) {
          continue;
        }

        for (let col = Math.min(colInRow, targetRow.length - 1); col >= 0; col -= 1) {
          const candidate = targetRow[col];
          if (
            candidate !== undefined &&
            !isListIndexDisabled(listRef, candidate, disabledIndices)
          ) {
            return candidate;
          }
        }
      }

      return undefined;
    };

    const navigateVerticallyWithInferredRows = (direction: "up" | "down") => {
      if (!hasVirtualizedGaps || prevIndex === -1) {
        return undefined;
      }

      const colInRow = prevIndex % verticalCols;
      const rowStep = direction === "up" ? -verticalCols : verticalCols;
      const lastRowStart = maxIndex - (maxIndex % verticalCols);
      const rowCount = Math.floor(maxIndex / verticalCols) + 1;

      for (
        let rowStart = prevIndex - colInRow + rowStep, i = 0;
        i < rowCount;
        i += 1, rowStart += rowStep
      ) {
        if (rowStart < 0 || rowStart > maxIndex) {
          if (!loopFocus) {
            return undefined;
          }
          rowStart = rowStart < 0 ? lastRowStart : 0;
        }

        const rowEnd = Math.min(rowStart + verticalCols - 1, maxIndex);

        for (
          let candidate = Math.min(rowStart + colInRow, rowEnd);
          candidate >= rowStart;
          candidate -= 1
        ) {
          if (!isListIndexDisabled(listRef, candidate, disabledIndices)) {
            return candidate;
          }
        }
      }

      return undefined;
    };

    if (stop) {
      stopEvent(event);
    }

    const verticalCandidate =
      navigateVertically(verticalDirection) ??
      navigateVerticallyWithInferredRows(verticalDirection);

    if (verticalCandidate !== undefined) {
      nextIndex = verticalCandidate;
    } else if (prevIndex === -1) {
      nextIndex = verticalDirection === "up" ? maxIndex : minIndex;
    } else {
      nextIndex = findNonDisabledListIndex(listRef, {
        startingIndex: prevIndex,
        amount: verticalCols,
        decrement: verticalDirection === "up",
        disabledIndices,
      });

      if (loopFocus) {
        if (verticalDirection === "up" && (prevIndex - verticalCols < minIndex || nextIndex < 0)) {
          const col = prevIndex % verticalCols;
          const maxCol = maxIndex % verticalCols;
          const offset = maxIndex - (maxCol - col);

          if (maxCol === col) {
            nextIndex = maxIndex;
          } else {
            nextIndex = maxCol > col ? offset : offset - verticalCols;
          }
        }

        if (verticalDirection === "down" && prevIndex + verticalCols > maxIndex) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: (prevIndex % verticalCols) - verticalCols,
            amount: verticalCols,
            disabledIndices,
          });
        }
      }
    }

    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      nextIndex = prevIndex;
    }
  }

  if (orientation === "both") {
    const prevRow = Math.floor(prevIndex / cols);

    if (event.key === (rtl ? ARROW_LEFT : ARROW_RIGHT)) {
      if (stop) {
        stopEvent(event);
      }

      if (prevIndex % cols !== cols - 1) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          disabledIndices,
        });

        if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex - (prevIndex % cols) - 1,
            disabledIndices,
          });
        }
      } else if (loopFocus) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex - (prevIndex % cols) - 1,
          disabledIndices,
        });
      }

      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex;
      }
    }

    if (event.key === (rtl ? ARROW_RIGHT : ARROW_LEFT)) {
      if (stop) {
        stopEvent(event);
      }

      if (prevIndex % cols !== 0) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex,
          decrement: true,
          disabledIndices,
        });

        if (loopFocus && isDifferentGridRow(nextIndex, cols, prevRow)) {
          nextIndex = findNonDisabledListIndex(listRef, {
            startingIndex: prevIndex + (cols - (prevIndex % cols)),
            decrement: true,
            disabledIndices,
          });
        }
      } else if (loopFocus) {
        nextIndex = findNonDisabledListIndex(listRef, {
          startingIndex: prevIndex + (cols - (prevIndex % cols)),
          decrement: true,
          disabledIndices,
        });
      }

      if (isDifferentGridRow(nextIndex, cols, prevRow)) {
        nextIndex = prevIndex;
      }
    }

    const lastRow = Math.floor(maxIndex / cols) === prevRow;

    if (isIndexOutOfListBounds(listRef, nextIndex)) {
      if (loopFocus && lastRow) {
        nextIndex =
          event.key === (rtl ? ARROW_RIGHT : ARROW_LEFT)
            ? maxIndex
            : findNonDisabledListIndex(listRef, {
                startingIndex: prevIndex - (prevIndex % cols) - 1,
                disabledIndices,
              });
      } else {
        nextIndex = prevIndex;
      }
    }
  }

  return nextIndex;
}

export function createGridCellMap(sizes: Dimensions[], cols: number, dense: boolean) {
  const cellMap: Array<number | undefined> = [];
  let startIndex = 0;

  sizes.forEach(({ width, height }, index) => {
    if (width > cols) {
      if (process.env.NODE_ENV !== "production") {
        throw new Error(
          `[Composite]: Invalid grid - item width at index ${index} is greater than grid columns`,
        );
      }
    }

    let itemPlaced = false;

    if (dense) {
      startIndex = 0;
    }

    while (!itemPlaced) {
      const targetCells: number[] = [];

      for (let i = 0; i < width; i += 1) {
        for (let j = 0; j < height; j += 1) {
          targetCells.push(startIndex + i + j * cols);
        }
      }

      if (
        (startIndex % cols) + width <= cols &&
        targetCells.every((cellIndex) => cellMap[cellIndex] === undefined)
      ) {
        targetCells.forEach((cellIndex) => {
          cellMap[cellIndex] = index;
        });
        itemPlaced = true;
      } else {
        startIndex += 1;
      }
    }
  });

  return [...cellMap];
}

export function getGridCellIndexOfCorner(
  index: number,
  sizes: Dimensions[],
  cellMap: Array<number | undefined>,
  cols: number,
  corner: "tl" | "tr" | "bl" | "br",
) {
  if (index === -1) {
    return -1;
  }

  const firstCellIndex = cellMap.indexOf(index);
  const sizeItem = sizes[index];

  switch (corner) {
    case "tl":
      return firstCellIndex;
    case "tr":
      return firstCellIndex + (sizeItem?.width ?? 1) - 1;
    case "bl":
      return firstCellIndex + ((sizeItem?.height ?? 1) - 1) * cols;
    case "br":
      return cellMap.lastIndexOf(index);
    default:
      return -1;
  }
}

export function getGridCellIndices(
  indices: Array<number | undefined>,
  cellMap: Array<number | undefined>,
) {
  return cellMap.flatMap((index, cellIndex) => (indices.includes(index) ? [cellIndex] : []));
}

export function isListIndexDisabled(
  listRef: ElementListRef<HTMLElement>,
  index: number,
  disabledIndices?: DisabledIndices,
) {
  if (typeof disabledIndices === "function") {
    return disabledIndices(index);
  }

  if (disabledIndices !== undefined) {
    return disabledIndices.includes(index);
  }

  const element = listRef.current[index];
  if (element === null || element === undefined) {
    return false;
  }

  return element.hasAttribute("disabled") || element.getAttribute("aria-disabled") === "true";
}

function isDifferentGridRow(index: number, cols: number, prevRow: number) {
  return Math.floor(index / cols) !== prevRow;
}

function isHTMLElement(value: EventTarget | null): value is HTMLElement {
  return value instanceof HTMLElement;
}

function isInputElement(element: EventTarget): element is HTMLInputElement {
  return isHTMLElement(element) && element.tagName === "INPUT";
}

export function isNativeInput(
  element: EventTarget,
): element is HTMLElement & (HTMLInputElement | HTMLTextAreaElement) {
  if (isInputElement(element) && element.selectionStart !== null) {
    return true;
  }

  if (isHTMLElement(element) && element.tagName === "TEXTAREA") {
    return true;
  }

  return false;
}

export function scrollIntoViewIfNeeded(
  scrollContainer: HTMLElement | null,
  element: HTMLElement | null,
  direction: TextDirection,
  orientation: "horizontal" | "vertical" | "both",
) {
  if (
    scrollContainer === null ||
    element === null ||
    typeof scrollContainer.scrollTo !== "function"
  ) {
    return;
  }

  let targetX = scrollContainer.scrollLeft;
  let targetY = scrollContainer.scrollTop;

  const isOverflowingX = scrollContainer.clientWidth < scrollContainer.scrollWidth;
  const isOverflowingY = scrollContainer.clientHeight < scrollContainer.scrollHeight;

  if (isOverflowingX && orientation !== "vertical") {
    const elementOffsetLeft = getOffset(scrollContainer, element, "left");
    const containerStyles = getStyles(scrollContainer);
    const elementStyles = getStyles(element);

    if (direction === "ltr") {
      if (
        elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight >
        scrollContainer.scrollLeft +
          scrollContainer.clientWidth -
          containerStyles.scrollPaddingRight
      ) {
        targetX =
          elementOffsetLeft +
          element.offsetWidth +
          elementStyles.scrollMarginRight -
          scrollContainer.clientWidth +
          containerStyles.scrollPaddingRight;
      } else if (
        elementOffsetLeft - elementStyles.scrollMarginLeft <
        scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft
      ) {
        targetX =
          elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
      }
    }

    if (direction === "rtl") {
      if (
        elementOffsetLeft - elementStyles.scrollMarginRight <
        scrollContainer.scrollLeft + containerStyles.scrollPaddingLeft
      ) {
        targetX =
          elementOffsetLeft - elementStyles.scrollMarginLeft - containerStyles.scrollPaddingLeft;
      } else if (
        elementOffsetLeft + element.offsetWidth + elementStyles.scrollMarginRight >
        scrollContainer.scrollLeft +
          scrollContainer.clientWidth -
          containerStyles.scrollPaddingRight
      ) {
        targetX =
          elementOffsetLeft +
          element.offsetWidth +
          elementStyles.scrollMarginRight -
          scrollContainer.clientWidth +
          containerStyles.scrollPaddingRight;
      }
    }
  }

  if (isOverflowingY && orientation !== "horizontal") {
    const elementOffsetTop = getOffset(scrollContainer, element, "top");
    const containerStyles = getStyles(scrollContainer);
    const elementStyles = getStyles(element);

    if (
      elementOffsetTop - elementStyles.scrollMarginTop <
      scrollContainer.scrollTop + containerStyles.scrollPaddingTop
    ) {
      targetY = elementOffsetTop - elementStyles.scrollMarginTop - containerStyles.scrollPaddingTop;
    } else if (
      elementOffsetTop + element.offsetHeight + elementStyles.scrollMarginBottom >
      scrollContainer.scrollTop + scrollContainer.clientHeight - containerStyles.scrollPaddingBottom
    ) {
      targetY =
        elementOffsetTop +
        element.offsetHeight +
        elementStyles.scrollMarginBottom -
        scrollContainer.clientHeight +
        containerStyles.scrollPaddingBottom;
    }
  }

  scrollContainer.scrollTo({
    left: targetX,
    top: targetY,
    behavior: "auto",
  });
}

function getOffset(ancestor: HTMLElement, element: HTMLElement, side: "left" | "top") {
  const propName = side === "left" ? "offsetLeft" : "offsetTop";

  let result = 0;
  let currentElement: HTMLElement | null = element;

  while (currentElement !== null && currentElement.offsetParent !== null) {
    result += currentElement[propName];

    if (currentElement.offsetParent === ancestor) {
      break;
    }

    if (!(currentElement.offsetParent instanceof HTMLElement)) {
      break;
    }

    currentElement = currentElement.offsetParent;
  }

  return result;
}

function getStyles(element: HTMLElement) {
  const styles = getComputedStyle(element);

  return {
    scrollMarginTop: parseFloat(styles.scrollMarginTop) || 0,
    scrollMarginRight: parseFloat(styles.scrollMarginRight) || 0,
    scrollMarginBottom: parseFloat(styles.scrollMarginBottom) || 0,
    scrollMarginLeft: parseFloat(styles.scrollMarginLeft) || 0,
    scrollPaddingTop: parseFloat(styles.scrollPaddingTop) || 0,
    scrollPaddingRight: parseFloat(styles.scrollPaddingRight) || 0,
    scrollPaddingBottom: parseFloat(styles.scrollPaddingBottom) || 0,
    scrollPaddingLeft: parseFloat(styles.scrollPaddingLeft) || 0,
  };
}
