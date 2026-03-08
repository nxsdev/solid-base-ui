import { onCleanup, type JSX } from "solid-js";
import type { ElementListRef } from "../composite";
import {
  CompositeListContext,
  type CompositeListContextValue,
  type StringListRef,
} from "./CompositeListContext";

export type CompositeMetadata = {
  index?: number | undefined;
} & Record<string, unknown>;

/**
 * Provides context for list items in a composite component.
 */
export function CompositeList(props: CompositeList.Props) {
  const map = new Map<Element, Record<string, unknown> | null>();
  const listeners = new Set<(map: Map<Element, CompositeMetadata>) => void>();
  const nextIndexRef = { current: 0 };
  let lastSortedMap = new Map<Element, CompositeMetadata>();

  const mutationObserver =
    typeof MutationObserver === "function"
      ? new MutationObserver(() => {
          notifyMapChange();
        })
      : null;

  const observeParents = (sortedMap: Map<Element, CompositeMetadata>) => {
    if (mutationObserver === null) {
      return;
    }

    mutationObserver.disconnect();

    sortedMap.forEach((_, node) => {
      if (node.parentElement !== null) {
        mutationObserver.observe(node.parentElement, { childList: true });
      }
    });
  };

  const notifyMapChange = () => {
    const sortedMap = createSortedMap(map);

    if (isCompositeMapEqual(lastSortedMap, sortedMap)) {
      return;
    }

    lastSortedMap = sortedMap;

    const sortedElements = Array.from(sortedMap.keys()).map((node) =>
      node instanceof HTMLElement ? node : null,
    );

    props.elementsRef.current.length = sortedElements.length;
    sortedElements.forEach((element, index) => {
      props.elementsRef.current[index] = element;
    });

    if (props.labelsRef !== undefined && props.labelsRef.current.length !== sortedMap.size) {
      props.labelsRef.current.length = sortedMap.size;
    }

    nextIndexRef.current = sortedMap.size;
    observeParents(sortedMap);

    props.onMapChange?.(sortedMap);

    listeners.forEach((listener) => {
      listener(sortedMap);
    });
  };

  const register = (node: Element, metadata: Record<string, unknown> | null | undefined) => {
    map.set(node, metadata ?? null);
    notifyMapChange();

    queueMicrotask(() => {
      notifyMapChange();
    });
  };

  const unregister = (node: Element) => {
    map.delete(node);
    notifyMapChange();
  };

  const subscribeMapChange = (fn: (map: Map<Element, CompositeMetadata>) => void) => {
    listeners.add(fn);

    queueMicrotask(() => {
      if (listeners.has(fn)) {
        fn(lastSortedMap);
      }
    });

    return () => {
      listeners.delete(fn);
    };
  };

  onCleanup(() => {
    mutationObserver?.disconnect();
    props.elementsRef.current.length = 0;

    if (props.labelsRef !== undefined) {
      props.labelsRef.current.length = 0;
    }
  });

  const contextValue: CompositeListContextValue = {
    register,
    unregister,
    subscribeMapChange,
    elementsRef: props.elementsRef,
    labelsRef: props.labelsRef,
    nextIndexRef,
  };

  return <CompositeListContext value={contextValue}>{props.children}</CompositeListContext>;
}

function createSortedMap(
  map: Map<Element, Record<string, unknown> | null>,
): Map<Element, CompositeMetadata> {
  const newMap = new Map<Element, CompositeMetadata>();
  const sortedNodes = Array.from(map.keys())
    .filter((node) => node.isConnected)
    .sort(sortByDocumentPosition);

  sortedNodes.forEach((node, index) => {
    const metadata = map.get(node);
    const normalizedMetadata = metadata === null || metadata === undefined ? {} : metadata;

    newMap.set(node, {
      ...normalizedMetadata,
      index,
    });
  });

  return newMap;
}

function sortByDocumentPosition(a: Element, b: Element) {
  const position = a.compareDocumentPosition(b);

  if (
    position & Node.DOCUMENT_POSITION_FOLLOWING ||
    position & Node.DOCUMENT_POSITION_CONTAINED_BY
  ) {
    return -1;
  }

  if (position & Node.DOCUMENT_POSITION_PRECEDING || position & Node.DOCUMENT_POSITION_CONTAINS) {
    return 1;
  }

  return 0;
}

export interface CompositeListProps {
  children?: JSX.Element | undefined;
  /**
   * A ref to list item elements ordered by composite index.
   */
  elementsRef: ElementListRef<HTMLElement>;
  /**
   * A ref to list item labels ordered by composite index.
   */
  labelsRef?: StringListRef | undefined;
  onMapChange?: ((newMap: Map<Element, CompositeMetadata>) => void) | undefined;
}

export namespace CompositeList {
  export type Props = CompositeListProps;
}

function isCompositeMapEqual(
  previousMap: Map<Element, CompositeMetadata>,
  nextMap: Map<Element, CompositeMetadata>,
) {
  if (previousMap.size !== nextMap.size) {
    return false;
  }

  const previousEntries = Array.from(previousMap.entries());
  const nextEntries = Array.from(nextMap.entries());

  for (let index = 0; index < previousEntries.length; index += 1) {
    const previousEntry = previousEntries[index];
    const nextEntry = nextEntries[index];

    if (previousEntry === undefined || nextEntry === undefined) {
      return false;
    }

    const [previousNode, previousMetadata] = previousEntry;
    const [nextNode, nextMetadata] = nextEntry;

    if (previousNode !== nextNode) {
      return false;
    }

    if (!isCompositeMetadataEqual(previousMetadata, nextMetadata)) {
      return false;
    }
  }

  return true;
}

function isCompositeMetadataEqual(previous: CompositeMetadata, next: CompositeMetadata) {
  const previousKeys = Object.keys(previous);
  const nextKeys = Object.keys(next);

  if (previousKeys.length !== nextKeys.length) {
    return false;
  }

  for (const key of previousKeys) {
    if (!(key in next) || previous[key] !== next[key]) {
      return false;
    }
  }

  return true;
}
